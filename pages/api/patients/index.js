import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

// Helper function to validate and sanitize patient data
const validateAndSanitizePatientData = (data) => {
  console.log('Validating patient data:', data);
  
  const {
    name,
    guardianName,
    address,
    age,
    sex,
    occupation,
    mobileNumber,
    chiefComplaints,
    medicalHistory,
    physicalGenerals,
    menstrualHistory,
    foodAndHabit
  } = data;

  // Required fields validation
  const errors = [];
  if (!name) errors.push('Name is required');
  if (!address) errors.push('Address is required');
  if (age === undefined || age === null || age === '') errors.push('Age is required');
  if (!sex) errors.push('Sex is required');
  if (!mobileNumber) errors.push('Mobile number is required');
  if (!chiefComplaints) errors.push('Chief complaints are required');

  // Validate data types
  if (age !== undefined && age !== null && isNaN(parseInt(age))) {
    errors.push('Age must be a number');
  }

  if (errors.length > 0) {
    console.log('Validation errors:', errors);
    return { valid: false, errors };
  }

  // Create default values for optional JSON fields
  const defaultMedicalHistory = {
    pastHistory: {
      allergy: false, anemia: false, arthritis: false, asthma: false,
      cancer: false, diabetes: false, heartDisease: false, hypertension: false,
      thyroid: false, tuberculosis: false
    },
    familyHistory: {
      diabetes: false, hypertension: false, thyroid: false,
      tuberculosis: false, cancer: false
    }
  };
  
  const defaultPhysicalGenerals = {
    appetite: '', bowel: '', urine: '', sweating: '', 
    sleep: '', thirst: '', addictions: ''
  };
  
  const defaultFoodAndHabit = {
    foodHabit: '',
    addictions: ''
  };
  
  const defaultMenstrualHistory = sex === 'Female' ? {
    menses: '', menopause: 'No', leucorrhoea: '',
    gonorrhea: 'No', otherDischarges: ''
  } : null;

  // Safe parsing of JSON fields
  let sanitizedMedicalHistory;
  let sanitizedPhysicalGenerals;
  let sanitizedMenstrualHistory;
  let sanitizedFoodAndHabit;

  try {
    sanitizedMedicalHistory = medicalHistory 
      ? (typeof medicalHistory === 'string' ? JSON.parse(medicalHistory) : medicalHistory) 
      : defaultMedicalHistory;
  } catch (e) {
    sanitizedMedicalHistory = defaultMedicalHistory;
  }

  try {
    sanitizedPhysicalGenerals = physicalGenerals 
      ? (typeof physicalGenerals === 'string' ? JSON.parse(physicalGenerals) : physicalGenerals) 
      : defaultPhysicalGenerals;
  } catch (e) {
    sanitizedPhysicalGenerals = defaultPhysicalGenerals;
  }

  try {
    sanitizedMenstrualHistory = sex === 'Female' && menstrualHistory 
      ? (typeof menstrualHistory === 'string' ? JSON.parse(menstrualHistory) : menstrualHistory) 
      : defaultMenstrualHistory;
  } catch (e) {
    sanitizedMenstrualHistory = defaultMenstrualHistory;
  }

  try {
    sanitizedFoodAndHabit = foodAndHabit 
      ? (typeof foodAndHabit === 'string' ? JSON.parse(foodAndHabit) : foodAndHabit) 
      : defaultFoodAndHabit;
  } catch (e) {
    sanitizedFoodAndHabit = defaultFoodAndHabit;
  }

  return {
    valid: true,
    sanitizedData: {
      name,
      guardianName: guardianName || null,
      address,
      age: parseInt(age),
      sex,
      occupation: occupation || null,
      mobileNumber,
      chiefComplaints,
      stringifiedMedicalHistory: JSON.stringify(sanitizedMedicalHistory),
      stringifiedPhysicalGenerals: JSON.stringify(sanitizedPhysicalGenerals),
      stringifiedMenstrualHistory: sex === 'Female' ? JSON.stringify(sanitizedMenstrualHistory) : null,
      stringifiedFoodAndHabit: JSON.stringify(sanitizedFoodAndHabit)
    }
  };
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const patients = await prisma.patient.findMany({
          where: {
            userId: session.user.id
          },
          include: {
            investigations: true,
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Transform data to match frontend expectations
        const transformedPatients = patients.map(patient => {
          // Parse JSON fields stored as strings
          const medicalHistory = patient.medicalHistory ? JSON.parse(patient.medicalHistory) : {
            pastHistory: {
              allergy: false,
              anemia: false,
              arthritis: false,
              asthma: false,
              cancer: false,
              diabetes: false,
              heartDisease: false,
              hypertension: false,
              thyroid: false,
              tuberculosis: false,
            },
            familyHistory: {
              diabetes: false,
              hypertension: false,
              thyroid: false,
              tuberculosis: false,
              cancer: false,
            }
          };
          
          const physicalGenerals = patient.physicalGenerals ? JSON.parse(patient.physicalGenerals) : {
            appetite: '',
            bowel: '',
            urine: '',
            sweating: '',
            sleep: '',
            thirst: '',
            addictions: '',
          };
          
          const menstrualHistory = patient.menstrualHistory ? JSON.parse(patient.menstrualHistory) : 
            (patient.sex === 'Female' ? {
              menses: '',
              menopause: 'No',
              leucorrhoea: '',
              gonorrhea: 'No',
              otherDischarges: '',
            } : null);
            
          const foodAndHabit = patient.foodAndHabit ? JSON.parse(patient.foodAndHabit) : {
            foodHabit: '',
            addictions: '',
          };
          
          return {
            id: patient.id,
            name: patient.name,
            guardianName: patient.guardianName,
            address: patient.address,
            age: patient.age,
            sex: patient.sex,
            occupation: patient.occupation || '',
            mobileNumber: patient.mobileNumber,
            chiefComplaints: patient.chiefComplaints,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            userId: patient.userId,
            medicalHistory,
            physicalGenerals,
            menstrualHistory,
            foodAndHabit,
            investigations: patient.investigations || [],
            user: patient.user
          };
        });

        return res.status(200).json(transformedPatients);

      case 'POST':
        // Validate and sanitize patient data
        const validationResult = validateAndSanitizePatientData(req.body);
        
        // If validation fails, return error
        if (!validationResult.valid) {
          return res.status(400).json({
            error: 'Validation error',
            message: 'Please check the form for errors',
            details: validationResult.errors.join(', ')
          });
        }
        
        const {
          name,
          guardianName,
          address,
          age,
          sex,
          occupation,
          mobileNumber,
          chiefComplaints,
          stringifiedMedicalHistory,
          stringifiedPhysicalGenerals,
          stringifiedMenstrualHistory,
          stringifiedFoodAndHabit
        } = validationResult.sanitizedData;
        
        const newPatient = await prisma.patient.create({
          data: {
            name,
            guardianName,
            address,
            age,
            sex,
            occupation,
            mobileNumber,
            chiefComplaints,
            medicalHistory: stringifiedMedicalHistory,
            physicalGenerals: stringifiedPhysicalGenerals,
            menstrualHistory: stringifiedMenstrualHistory,
            foodAndHabit: stringifiedFoodAndHabit,
            userId: session.user.id
          },
          include: {
            investigations: true
          }
        });
        
        // Parse the JSON fields back for the response
        const transformedNewPatient = {
          ...newPatient,
          medicalHistory: stringifiedMedicalHistory ? JSON.parse(stringifiedMedicalHistory) : null,
          physicalGenerals: stringifiedPhysicalGenerals ? JSON.parse(stringifiedPhysicalGenerals) : null,
          menstrualHistory: stringifiedMenstrualHistory ? JSON.parse(stringifiedMenstrualHistory) : null,
          foodAndHabit: stringifiedFoodAndHabit ? JSON.parse(stringifiedFoodAndHabit) : null
        };

        return res.status(201).json(transformedNewPatient);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Database error:', error);
    // Enhanced error logging
    const errorMessage = error.message || 'Unknown database error';
    const errorDetails = error.meta && error.meta.cause ? error.meta.cause : 'No additional details';
    const errorCode = error.code || 'UNKNOWN_ERROR';
    
    console.log('Request body:', req.body);
    console.log('Error details:', {
      message: errorMessage,
      details: errorDetails,
      code: errorCode,
      stack: error.stack
    });
    
    return res.status(400).json({ 
      error: 'Invalid request data',
      message: errorMessage,
      details: errorDetails,
      code: errorCode
    });
  } finally {
    await prisma.$disconnect();
  }
}
