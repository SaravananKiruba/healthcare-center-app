import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  useToast,
  Grid,
  GridItem,
  Divider,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Icon,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiSave, FiCheckCircle } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../../context/AppContext';

const PatientRegistration = () => {
  const toast = useToast();
  const router = useRouter();
  const { addPatient, isLoading, error } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [registeredPatientId, setRegisteredPatientId] = useState(null);
  const [formError, setFormError] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Patient name is required'),
    guardianName: Yup.string(),
    address: Yup.string().required('Address is required'),
    age: Yup.number()
      .required('Age is required')
      .positive('Age must be positive')
      .integer('Age must be a whole number'),
    sex: Yup.string().required('Sex is required'),
    occupation: Yup.string(),
    mobileNumber: Yup.string()
      .matches(/^[0-9-+()\\s]+$/, 'Invalid phone number')
      .required('Mobile number is required'),
    chiefComplaints: Yup.string().required('Chief complaints are required'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      name: '',
      guardianName: '',
      address: '',
      age: '',
      sex: '',
      occupation: '',
      mobileNumber: '',
      chiefComplaints: '',
    },
    validationSchema,    onSubmit: async (values) => {
      try {
        // Clear any previous errors
        setFormError(null);
        
        // Now we can send the data as is since our API interceptor will handle the conversion
        const newPatientData = {
          name: values.name,
          guardianName: values.guardianName,
          address: values.address,
          age: parseInt(values.age),
          sex: values.sex,
          occupation: values.occupation || '',
          mobileNumber: values.mobileNumber,
          chiefComplaints: values.chiefComplaints,
          medicalHistory: {
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
            },
          },
          physicalGenerals: {
            appetite: '',
            bowel: '',
            urine: '',
            sweating: '',
            sleep: '',
            thirst: '',
            addictions: '',
          },
          menstrualHistory: values.sex === 'Female' ? {
            menses: '',
            menopause: 'No',
            leucorrhoea: '',
            gonorrhea: 'No',
            otherDischarges: '',
          } : null,
          foodAndHabit: {
            foodHabit: '',
            addictions: '',
          }
        };

        // Add the patient to the context
        const result = await addPatient(newPatientData);
        setRegisteredPatientId(result.id);
        
        // Show success message
        toast({
          title: 'Patient registered successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onOpen(); // Open the success modal
      } catch (error) {
        console.error("Error registering patient:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Could not register patient';
        const errorDetails = error.response?.data?.details || '';
        
        console.log('Registration error details:', {
          message: errorMessage,
          details: errorDetails,
          response: error.response?.data
        });
        
        // Set formik status to show additional error details
        formik.setStatus(errorDetails);
        
        // Set form error for display
        setFormError(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
        
        toast({
          title: 'Registration failed',
          description: `${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  // Navigate to the patient's detail page or register another patient
  const handleNavigate = (path) => {
    onClose();
    router.push(path);
  };

  return (
    <Box>
      <Heading size="lg" mb="6">Patient Registration</Heading>
      
      <Card>
        <CardHeader bg="brand.50" py="3">
          <Heading size="md">Patient & Case Record</Heading>
        </CardHeader>
        <CardBody>
          <form onSubmit={formik.handleSubmit}>
            <VStack spacing="6" align="stretch">
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl isInvalid={formik.touched.name && formik.errors.name}>
                    <FormLabel>Patient Name</FormLabel>
                    <Input 
                      name="name" 
                      placeholder="Enter patient's full name" 
                      {...formik.getFieldProps('name')}
                    />
                    <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl>
                    <FormLabel>Guardian Name</FormLabel>
                    <Input 
                      name="guardianName" 
                      placeholder="Enter guardian's name (if applicable)" 
                      {...formik.getFieldProps('guardianName')}
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <FormControl isInvalid={formik.touched.address && formik.errors.address}>
                    <FormLabel>Address</FormLabel>
                    <Textarea 
                      name="address" 
                      placeholder="Enter complete address" 
                      rows={3}
                      {...formik.getFieldProps('address')}
                    />
                    <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={formik.touched.age && formik.errors.age}>
                    <FormLabel>Age</FormLabel>
                    <Input 
                      name="age" 
                      type="number" 
                      placeholder="Age in years"
                      {...formik.getFieldProps('age')}
                    />
                    <FormErrorMessage>{formik.errors.age}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={formik.touched.sex && formik.errors.sex}>
                    <FormLabel>Sex</FormLabel>
                    <Select 
                      name="sex" 
                      placeholder="Select sex"
                      {...formik.getFieldProps('sex')}
                      isRequired={true}
                      aria-required="true"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                    <FormErrorMessage>{formik.errors.sex}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>Occupation</FormLabel>
                    <Input 
                      name="occupation" 
                      placeholder="Patient's occupation"
                      {...formik.getFieldProps('occupation')}
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isInvalid={formik.touched.mobileNumber && formik.errors.mobileNumber}>
                    <FormLabel>Mobile Number</FormLabel>
                    <Input 
                      name="mobileNumber" 
                      placeholder="Enter contact number"
                      {...formik.getFieldProps('mobileNumber')}
                    />
                    <FormErrorMessage>{formik.errors.mobileNumber}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 1, md: 2 }}>
                  <Divider my="2" />
                  <FormControl isInvalid={formik.touched.chiefComplaints && formik.errors.chiefComplaints}>
                    <FormLabel>Chief Complaints</FormLabel>
                    <Textarea 
                      name="chiefComplaints" 
                      placeholder="Describe the main symptoms or complaints"
                      rows={4}
                      {...formik.getFieldProps('chiefComplaints')}
                    />
                    <FormErrorMessage>{formik.errors.chiefComplaints}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>              {(error || formError) && (
                <Alert status="error" mt={4} mb={2}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Error: {error || formError}</Text>
                    {formik.status && <Text mt={1}>{formik.status}</Text>}
                  </Box>
                </Alert>
              )}
              
              {/* Form validation summary */}
              {formik.touched.name && Object.keys(formik.errors).length > 0 && (
                <Alert status="warning" mt={4} mb={2}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Please fix the following errors:</Text>
                    <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                      {Object.entries(formik.errors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </Box>
                </Alert>
              )}
              
              <HStack justify="flex-end" pt="4">
                <Button 
                  type="submit" 
                  colorScheme="brand" 
                  leftIcon={<FiSave />} 
                  isLoading={formik.isSubmitting || isLoading}
                >
                  Register Patient
                </Button>
              </HStack>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bg="green.50">Registration Successful</ModalHeader>
          <ModalCloseButton />
          <ModalBody py="6">
            <VStack spacing="4">
              <Icon as={FiCheckCircle} color="green.500" boxSize="12" />
              <Text fontSize="lg" fontWeight="bold">
                Patient has been registered successfully
              </Text>
              <Text textAlign="center" color="gray.600">
                What would you like to do next?
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={() => {
                formik.resetForm();
                onClose();
              }}
            >
              Register Another Patient
            </Button>
            <Button 
              colorScheme="brand" 
              onClick={() => handleNavigate(`/patient/${registeredPatientId}`)}
            >
              View Patient Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientRegistration;
