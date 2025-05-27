import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { patientsAPI, investigationsAPI, treatmentsAPI, invoicesAPI } from '../services/api';

// Create context
const AppContext = createContext();

// Mock data for initial patients
const initialPatients = [
  {
    id: 'p1',
    name: 'John Doe',
    guardianName: 'Mary Doe',
    address: '123 Main St, Anytown',
    age: 45,
    sex: 'Male',
    occupation: 'Teacher',
    mobileNumber: '555-123-4567',
    chiefComplaints: 'Frequent headaches and fatigue',
    createdAt: new Date('2025-05-10').toISOString(),
    medicalHistory: {
      pastHistory: {
        allergy: true,
        anemia: false,
        arthritis: false,
        asthma: true,
        cancer: false,
        diabetes: false,
        heartDisease: false,
        hypertension: true,
        thyroid: false,
        tuberculosis: false,
      },
      familyHistory: {
        diabetes: true,
        hypertension: true,
        thyroid: false,
        tuberculosis: false,
        cancer: false,
      },
    },
    physicalGenerals: {
      appetite: 'Good',
      bowel: 'Regular',
      urine: 'Normal',
      sweating: 'Moderate',
      sleep: 'Disturbed',
      thirst: 'Increased',
      addictions: 'None',
    },
    menstrualHistory: null, // Male patient
    foodAndHabit: {
      foodHabit: 'Non-vegetarian',
      addictions: 'Occasional alcohol',
    },
    investigations: [
      {
        id: 'inv1',
        type: 'X-Ray',
        details: 'Chest X-Ray',
        date: '2025-04-20',
        fileUrl: null,
      },
      {
        id: 'inv2',
        type: 'Lab Report',
        details: 'Complete Blood Count',
        date: '2025-04-22',
        fileUrl: null,
      },
    ],
    treatments: [
      {
        id: 't1',
        date: '2025-05-10',
        doctor: 'Dr. Smith',
        observations: 'Patient shows signs of chronic stress',
        medications: 'Prescribed stress relievers',
      },
    ],
    invoices: [
      {
        id: 'inv1',
        date: '2025-05-10',
        items: [
          { id: 'item1', description: 'Consultation', amount: 150 },
          { id: 'item2', description: 'Blood Test', amount: 75 },
        ],
        subtotal: 225,
        discount: 0,
        tax: 0,
        total: 225,
        paymentStatus: 'Paid',
        paymentMode: 'Credit Card',
        transactionId: 'tx123456',
      },
    ],
  },
  {
    id: 'p2',
    name: 'Jane Smith',
    guardianName: 'Robert Smith',
    address: '456 Oak Ave, Somewhere',
    age: 32,
    sex: 'Female',
    occupation: 'Engineer',
    mobileNumber: '555-987-6543',
    chiefComplaints: 'Lower back pain and irregular periods',
    createdAt: new Date('2025-05-11').toISOString(),
    medicalHistory: {
      pastHistory: {
        allergy: false,
        anemia: true,
        arthritis: false,
        asthma: false,
        cancer: false,
        diabetes: false,
        heartDisease: false,
        hypertension: false,
        thyroid: true,
        tuberculosis: false,
      },
      familyHistory: {
        diabetes: false,
        hypertension: false,
        thyroid: true,
        tuberculosis: false,
        cancer: false,
      },
    },
    physicalGenerals: {
      appetite: 'Poor',
      bowel: 'Constipated',
      urine: 'Normal',
      sweating: 'Minimal',
      sleep: 'Irregular',
      thirst: 'Normal',
      addictions: 'None',
    },
    menstrualHistory: {
      menses: 'Irregular',
      menopause: 'No',
      leucorrhoea: 'Occasional',
      gonorrhea: 'No',
      otherDischarges: 'None',
    },
    foodAndHabit: {
      foodHabit: 'Vegetarian',
      addictions: 'None',
    },
    investigations: [
      {
        id: 'inv3',
        type: 'Scan',
        details: 'Lumbar MRI',
        date: '2025-05-05',
        fileUrl: null,
      },
    ],
    treatments: [
      {
        id: 't2',
        date: '2025-05-11',
        doctor: 'Dr. Johnson',
        observations: 'Lumbar strain and hormonal imbalance',
        medications: 'Prescribed anti-inflammatory and hormonal supplements',
      },
    ],
    invoices: [
      {
        id: 'inv2',
        date: '2025-05-11',
        items: [
          { id: 'item3', description: 'Consultation', amount: 150 },
          { id: 'item4', description: 'MRI Scan', amount: 350 },
        ],
        subtotal: 500,
        discount: 50,
        tax: 0,
        total: 450,
        paymentStatus: 'Partial',
        paymentMode: 'Cash',
        transactionId: 'tx789012',
        amountPaid: 300,
        balance: 150,
      },
    ],
  },
];

// Mock doctors data
const doctors = [
  { id: 'd1', name: 'Dr. Smith', specialization: 'General Medicine' },
  { id: 'd2', name: 'Dr. Johnson', specialization: 'Gynecology' },
  { id: 'd3', name: 'Dr. Davis', specialization: 'Orthopedics' },
  { id: 'd4', name: 'Dr. Wilson', specialization: 'Pediatrics' },
  { id: 'd5', name: 'Dr. Miller', specialization: 'Cardiology' },
];

// Mock services data
const services = [
  { id: 's1', name: 'General Consultation', price: 150 },
  { id: 's2', name: 'Specialist Consultation', price: 300 },
  { id: 's3', name: 'X-Ray', price: 100 },
  { id: 's4', name: 'Ultrasound', price: 250 },
  { id: 's5', name: 'MRI Scan', price: 350 },
  { id: 's6', name: 'CT Scan', price: 400 },
  { id: 's7', name: 'Blood Test - Basic', price: 75 },
  { id: 's8', name: 'Blood Test - Comprehensive', price: 150 },
  { id: 's9', name: 'Urine Analysis', price: 50 },
  { id: 's10', name: 'ECG', price: 150 },
];

// Provider component
export const AppProvider = ({ children }) => {
  // Initialize state with data from localStorage or default to initial values
  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem('patients');
    return savedPatients ? JSON.parse(savedPatients) : initialPatients;
  });
  
  const [currentUser, setCurrentUser] = useState({
    id: 'user1',
    name: 'Admin User',
    role: 'admin',
  });
  
  // Save to localStorage whenever patients state changes
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);
  
  // Add new patient
  const addPatient = (patientData) => {
    const newPatient = {
      ...patientData,
      id: `p${uuidv4()}`,
      createdAt: new Date().toISOString(),
      invoices: [],
      treatments: [],
      investigations: [],
    };
    
    setPatients([...patients, newPatient]);
    return newPatient.id;
  };
  
  // Update existing patient
  const updatePatient = (id, patientData) => {
    const updatedPatients = patients.map(patient => 
      patient.id === id ? { ...patient, ...patientData } : patient
    );
    setPatients(updatedPatients);
  };
  
  // Add treatment record
  const addTreatment = (patientId, treatmentData) => {
    const newTreatment = {
      ...treatmentData,
      id: `t${uuidv4()}`,
      date: treatmentData.date || new Date().toISOString(),
    };
    
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          treatments: [...(patient.treatments || []), newTreatment],
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    return newTreatment.id;
  };
  
  // Add invoice
  const addInvoice = (patientId, invoiceData) => {
    const newInvoice = {
      ...invoiceData,
      id: `inv${uuidv4()}`,
      date: invoiceData.date || new Date().toISOString(),
    };
    
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          invoices: [...(patient.invoices || []), newInvoice],
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    return newInvoice.id;
  };
  
  // Add investigation report
  const addInvestigation = (patientId, investigationData) => {
    const newInvestigation = {
      ...investigationData,
      id: `inv${uuidv4()}`,
      date: investigationData.date || new Date().toISOString(),
    };
    
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        return {
          ...patient,
          investigations: [...(patient.investigations || []), newInvestigation],
        };
      }
      return patient;
    });
    
    setPatients(updatedPatients);
    return newInvestigation.id;
  };
  
  // Search patients
  const searchPatients = (searchTerm) => {
    if (!searchTerm.trim()) return patients;
    
    const term = searchTerm.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(term) ||
      patient.mobileNumber?.includes(term) ||
      patient.id.includes(term)
    );
  };
  
  // Delete patient
  const deletePatient = (patientId) => {
    setPatients(patients.filter(patient => patient.id !== patientId));
  };
  
  // Change user role (for demo purposes)
  const changeUserRole = (role) => {
    setCurrentUser({ ...currentUser, role });
  };
  
  // Export context value
  const contextValue = {
    patients,
    doctors,
    services,
    currentUser,
    addPatient,
    updatePatient,
    addTreatment,
    addInvoice,
    addInvestigation,
    searchPatients,
    deletePatient,
    changeUserRole,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
