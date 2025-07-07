import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  HStack,
  VStack,
  Divider,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  IconButton,
  Switch,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiUser,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiFileText,
  FiEdit,
  FiDollarSign,
  FiTrash2,
  FiArrowLeft,
  FiPlusCircle,
  FiCheck,
  FiX,
  FiSave,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import { formatDate } from '../../utils/dataTransform';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Placeholder components for tabs - these would be imported from their own files in a complete implementation

const PatientView = ({ patientId }) => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { patients, doctors, deletePatient, updatePatient, currentUser } = useAppContext();
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  
  // Use patientId prop or id from router
  const currentPatientId = patientId || id;
  
  // Find the patient with the given ID
  const patient = patients.find(p => p.id === currentPatientId);
  
  // Check if current user can edit patient data - admins and doctors can edit, plus the user who created the patient
  const canEdit = currentUser && (['admin', 'doctor'].includes(currentUser.role) || (patient && patient.userId === currentUser.id));
  
  // Check if patient exists or if we're still waiting for data
  if (!currentPatientId || !patient) {
    return (
      <Box textAlign="center" py="10">
        <Heading size="lg" mb="4">Patient Not Found</Heading>
        <Text mb="6">The patient you're looking for doesn't exist or has been removed.</Text>
        <Link href="/patients" passHref>
          <Button as="a" leftIcon={<FiArrowLeft />}>
            Back to Patient List
          </Button>
        </Link>
      </Box>
    );
  }
  
  // Using the imported formatDate function from utils/dataTransform.js
  
  // Handle delete patient
  const handleDeletePatient = () => {
    deletePatient(patient.id);
    
    toast({
      title: 'Patient deleted.',
      description: `${patient.name}'s records have been removed.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    router.push('/patients');
  };
  
  // Handle save patient edit
  const handleSavePatient = async (updatedPatient) => {
    try {
      await updatePatient(patient.id, updatedPatient);
      
      toast({
        title: 'Patient updated.',
        description: `${updatedPatient.name}'s information has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update failed.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Check delete permissions - only admins can delete
  const canDelete = currentUser.role === 'admin';
  
  // Return component
  return (
    <Box>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }}
        mb="6"
      >
        <HStack mb={{ base: 4, md: 0 }}>
          <Link href="/patients" passHref>
            <Button
              as="a"
              variant="outline"
              leftIcon={<FiArrowLeft />}
              size="sm"
            >
              Back
            </Button>
          </Link>
          <Heading size="lg">Patient Detail</Heading>
        </HStack>
        
        <HStack spacing="3">
          {canEdit && (
            <Button
              leftIcon={<FiEdit />}
              variant="outline"
              size={{ base: 'sm', md: 'md' }}
              onClick={onOpenEditModal}
            >
              Edit Patient
            </Button>
          )}
          

          
          {canDelete && (
            <Button
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              variant="ghost"
              size={{ base: 'sm', md: 'md' }}
              onClick={onOpenDeleteModal}
            >
              Delete
            </Button>
          )}
        </HStack>
      </Flex>
      
      {/* Patient Overview Card */}
      <Card mb="6">
        <CardHeader bg="brand.50" py="3">
          <Heading size="md">Patient Overview</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <HStack align="start" spacing="4">
              <Avatar 
                size="xl" 
                name={patient.name} 
                bg="brand.500" 
              />
              <Box>
                <Heading size="md">{patient.name}</Heading>
                <HStack mt="1">
                  <Text color="gray.600">ID: </Text>
                  <Text fontWeight="semibold" fontFamily="mono">{patient.id.substring(0, 8)}</Text>
                </HStack>
                <HStack mt="1">
                  <Badge colorScheme="blue">{patient.sex}</Badge>
                  <Text fontWeight="semibold">{patient.age} years</Text>
                </HStack>
                {patient.investigations && patient.investigations.length > 0 && (
                  <Badge colorScheme="green" mt={1}>
                    {patient.investigations.length} Investigation(s)
                  </Badge>
                )}
              </Box>
            </HStack>
            
            <VStack align="start" spacing="2">
              <HStack>
                <Icon as={FiMapPin} color="gray.500" />
                <Text fontWeight="medium">Address</Text>
              </HStack>
              <Text>{patient.address}</Text>
              
              <HStack>
                <Icon as={FiPhone} color="gray.500" />
                <Text>{patient.mobileNumber}</Text>
              </HStack>
            </VStack>
            
            <VStack align="start" spacing="2">
              <HStack>
                <Icon as={FiUser} color="gray.500" />
                <Text fontWeight="medium">Guardian</Text>
              </HStack>
              <Text>{patient.guardianName || 'Not specified'}</Text>
              
              <HStack>
                <Icon as={FiCalendar} color="gray.500" />
                <Text>Registered on {formatDate(patient.createdAt)}</Text>
              </HStack>
            </VStack>
            
            <Box gridColumn={{ md: "1 / -1" }}>
              <Divider my="2" />
              <Text fontWeight="medium" mb="1">
                <Icon as={FiFileText} mr="2" />
                Chief Complaints
              </Text>
              <Text>{patient.chiefComplaints}</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
      
      {/* Patient Tabs */}
      <Tabs isLazy colorScheme="brand" defaultIndex={0}>
        <TabList overflowX="auto" flexWrap="nowrap" py="2">
          <Tab fontWeight="medium">Investigations & Reports</Tab>
          <Tab>Medical History</Tab>
          <Tab>Physical Generals</Tab>
          {patient.sex === 'Female' && <Tab>Menstrual History</Tab>}
          <Tab>Food & Habits</Tab>
        </TabList>
        
        <TabPanels mt="4">
          <TabPanel p="0">
            <InvestigationsTab patient={patient} canEdit={canEdit} />
          </TabPanel>
          
          <TabPanel p="0">
            <MedicalHistoryTab patient={patient} />
          </TabPanel>
          
          <TabPanel p="0">
            <PhysicalGeneralsTab patient={patient} />
          </TabPanel>
          
          {patient.sex === 'Female' && (
            <TabPanel p="0">
              <MenstrualHistoryTab patient={patient} />
            </TabPanel>
          )}
          
          <TabPanel p="0">
            <FoodHabitsTab patient={patient} />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="red.500">Delete Patient Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete <strong>{patient.name}'s</strong> record?
              This will permanently remove all their data including medical history.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCloseDeleteModal}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeletePatient}>
              Delete Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Edit Patient Modal */}
      <PatientEditModal 
        isOpen={isEditModalOpen} 
        onClose={onCloseEditModal} 
        patient={patient} 
        onSave={handleSavePatient}
      />
    </Box>
  );
};

// Patient Edit Modal component
const PatientEditModal = ({ isOpen, onClose, patient, onSave }) => {
  const toast = useToast();
  
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

  // Initialize the form with all patient data
  const formik = useFormik({
    initialValues: {
      // Basic information
      name: patient.name || '',
      guardianName: patient.guardianName || '',
      address: patient.address || '',
      age: patient.age || '',
      sex: patient.sex || '',
      occupation: patient.occupation || '',
      mobileNumber: patient.mobileNumber || '',
      chiefComplaints: patient.chiefComplaints || '',
      
      // Medical History - Past History
      pastAllergy: patient.medicalHistory?.pastHistory?.allergy || false,
      pastAnemia: patient.medicalHistory?.pastHistory?.anemia || false,
      pastArthritis: patient.medicalHistory?.pastHistory?.arthritis || false,
      pastAsthma: patient.medicalHistory?.pastHistory?.asthma || false,
      pastCancer: patient.medicalHistory?.pastHistory?.cancer || false,
      pastDiabetes: patient.medicalHistory?.pastHistory?.diabetes || false,
      pastHeartDisease: patient.medicalHistory?.pastHistory?.heartDisease || false,
      pastHypertension: patient.medicalHistory?.pastHistory?.hypertension || false,
      pastThyroid: patient.medicalHistory?.pastHistory?.thyroid || false,
      pastTuberculosis: patient.medicalHistory?.pastHistory?.tuberculosis || false,
      
      // Medical History - Family History
      familyDiabetes: patient.medicalHistory?.familyHistory?.diabetes || false,
      familyHypertension: patient.medicalHistory?.familyHistory?.hypertension || false,
      familyThyroid: patient.medicalHistory?.familyHistory?.thyroid || false,
      familyTuberculosis: patient.medicalHistory?.familyHistory?.tuberculosis || false,
      familyCancer: patient.medicalHistory?.familyHistory?.cancer || false,
      
      // Physical Generals
      appetite: patient.physicalGenerals?.appetite || '',
      bowel: patient.physicalGenerals?.bowel || '',
      urine: patient.physicalGenerals?.urine || '',
      sweating: patient.physicalGenerals?.sweating || '',
      sleep: patient.physicalGenerals?.sleep || '',
      thirst: patient.physicalGenerals?.thirst || '',
      addictions: patient.physicalGenerals?.addictions || '',
      
      // Menstrual History (for female patients)
      menses: patient.menstrualHistory?.menses || '',
      menopause: patient.menstrualHistory?.menopause || 'No',
      leucorrhoea: patient.menstrualHistory?.leucorrhoea || '',
      gonorrhea: patient.menstrualHistory?.gonorrhea || 'No',
      otherDischarges: patient.menstrualHistory?.otherDischarges || '',
      
      // Food and Habits
      foodHabit: patient.foodAndHabit?.foodHabit || '',
      foodAddictions: patient.foodAndHabit?.addictions || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Build the updated patient object with all fields
        const updatedPatient = {
          ...patient,
          // Basic information
          name: values.name,
          guardianName: values.guardianName,
          address: values.address,
          age: parseInt(values.age),
          sex: values.sex,
          occupation: values.occupation || '',
          mobileNumber: values.mobileNumber,
          chiefComplaints: values.chiefComplaints,
          
          // Medical history
          medicalHistory: {
            pastHistory: {
              allergy: values.pastAllergy,
              anemia: values.pastAnemia,
              arthritis: values.pastArthritis,
              asthma: values.pastAsthma,
              cancer: values.pastCancer,
              diabetes: values.pastDiabetes,
              heartDisease: values.pastHeartDisease,
              hypertension: values.pastHypertension,
              thyroid: values.pastThyroid,
              tuberculosis: values.pastTuberculosis,
            },
            familyHistory: {
              diabetes: values.familyDiabetes,
              hypertension: values.familyHypertension,
              thyroid: values.familyThyroid,
              tuberculosis: values.familyTuberculosis,
              cancer: values.familyCancer,
            }
          },
          
          // Physical generals
          physicalGenerals: {
            appetite: values.appetite,
            bowel: values.bowel,
            urine: values.urine,
            sweating: values.sweating,
            sleep: values.sleep,
            thirst: values.thirst,
            addictions: values.addictions,
          },
          
          // Menstrual history (only for female patients)
          menstrualHistory: values.sex === 'Female' ? {
            menses: values.menses,
            menopause: values.menopause,
            leucorrhoea: values.leucorrhoea,
            gonorrhea: values.gonorrhea,
            otherDischarges: values.otherDischarges,
          } : null,
          
          // Food and habit
          foodAndHabit: {
            foodHabit: values.foodHabit,
            addictions: values.foodAddictions,
          }
        };
        
        await onSave(updatedPatient);
        
        toast({
          title: 'Patient updated',
          description: 'Patient information has been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onClose();
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to update patient: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Patient Information</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired isInvalid={formik.touched.name && formik.errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Guardian Name</FormLabel>
                <Input
                  name="guardianName"
                  value={formik.values.guardianName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </FormControl>
              
              <FormControl isRequired isInvalid={formik.touched.age && formik.errors.age}>
                <FormLabel>Age</FormLabel>
                <Input
                  name="age"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{formik.errors.age}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={formik.touched.sex && formik.errors.sex}>
                <FormLabel>Sex</FormLabel>
                <Select
                  name="sex"
                  value={formik.values.sex}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
                <FormErrorMessage>{formik.errors.sex}</FormErrorMessage>
              </FormControl>
              
              <FormControl>
                <FormLabel>Occupation</FormLabel>
                <Input
                  name="occupation"
                  value={formik.values.occupation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </FormControl>
              
              <FormControl isRequired isInvalid={formik.touched.mobileNumber && formik.errors.mobileNumber}>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  name="mobileNumber"
                  value={formik.values.mobileNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <FormErrorMessage>{formik.errors.mobileNumber}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={formik.touched.address && formik.errors.address} gridColumn={{ md: 'span 2' }}>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                />
                <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={formik.touched.chiefComplaints && formik.errors.chiefComplaints} gridColumn={{ md: 'span 2' }}>
                <FormLabel>Chief Complaints</FormLabel>
                <Textarea
                  name="chiefComplaints"
                  value={formik.values.chiefComplaints}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                />
                <FormErrorMessage>{formik.errors.chiefComplaints}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            
            {/* Tabs for additional patient information */}
            <Box gridColumn={{ md: 'span 2' }} mt={4}>
              <Tabs variant="enclosed" colorScheme="brand">
                <TabList>
                  <Tab>Medical History</Tab>
                  <Tab>Physical Generals</Tab>
                  {formik.values.sex === 'Female' && <Tab>Menstrual History</Tab>}
                  <Tab>Food & Habits</Tab>
                </TabList>
                
                <TabPanels>
                  {/* Medical History Tab */}
                  <TabPanel>
                    <Box>
                      <Heading size="sm" mb={3}>Past History</Heading>
                      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastAllergy"
                            name="pastAllergy"
                            checked={formik.values.pastAllergy}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastAllergy" mb={0}>Allergy</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastAnemia"
                            name="pastAnemia"
                            checked={formik.values.pastAnemia}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastAnemia" mb={0}>Anemia</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastArthritis"
                            name="pastArthritis"
                            checked={formik.values.pastArthritis}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastArthritis" mb={0}>Arthritis</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastAsthma"
                            name="pastAsthma"
                            checked={formik.values.pastAsthma}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastAsthma" mb={0}>Asthma</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastCancer"
                            name="pastCancer"
                            checked={formik.values.pastCancer}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastCancer" mb={0}>Cancer</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastDiabetes"
                            name="pastDiabetes"
                            checked={formik.values.pastDiabetes}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastDiabetes" mb={0}>Diabetes</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastHeartDisease"
                            name="pastHeartDisease"
                            checked={formik.values.pastHeartDisease}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastHeartDisease" mb={0}>Heart Disease</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastHypertension"
                            name="pastHypertension"
                            checked={formik.values.pastHypertension}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastHypertension" mb={0}>Hypertension</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastThyroid"
                            name="pastThyroid"
                            checked={formik.values.pastThyroid}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastThyroid" mb={0}>Thyroid</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="pastTuberculosis"
                            name="pastTuberculosis"
                            checked={formik.values.pastTuberculosis}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="pastTuberculosis" mb={0}>Tuberculosis</FormLabel>
                        </FormControl>
                      </SimpleGrid>
                      
                      <Divider my={4} />
                      
                      <Heading size="sm" mb={3}>Family History</Heading>
                      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="familyDiabetes"
                            name="familyDiabetes"
                            checked={formik.values.familyDiabetes}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="familyDiabetes" mb={0}>Diabetes</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="familyHypertension"
                            name="familyHypertension"
                            checked={formik.values.familyHypertension}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="familyHypertension" mb={0}>Hypertension</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="familyThyroid"
                            name="familyThyroid"
                            checked={formik.values.familyThyroid}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="familyThyroid" mb={0}>Thyroid</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="familyTuberculosis"
                            name="familyTuberculosis"
                            checked={formik.values.familyTuberculosis}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="familyTuberculosis" mb={0}>Tuberculosis</FormLabel>
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <input
                            type="checkbox"
                            id="familyCancer"
                            name="familyCancer"
                            checked={formik.values.familyCancer}
                            onChange={formik.handleChange}
                            style={{ marginRight: '8px' }}
                          />
                          <FormLabel htmlFor="familyCancer" mb={0}>Cancer</FormLabel>
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  </TabPanel>
                  
                  {/* Physical Generals Tab */}
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Appetite</FormLabel>
                        <Input
                          name="appetite"
                          value={formik.values.appetite}
                          onChange={formik.handleChange}
                          placeholder="Appetite details"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Thirst</FormLabel>
                        <Input
                          name="thirst"
                          value={formik.values.thirst}
                          onChange={formik.handleChange}
                          placeholder="Thirst details"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Sleep</FormLabel>
                        <Input
                          name="sleep"
                          value={formik.values.sleep}
                          onChange={formik.handleChange}
                          placeholder="Sleep patterns"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Bowel</FormLabel>
                        <Input
                          name="bowel"
                          value={formik.values.bowel}
                          onChange={formik.handleChange}
                          placeholder="Bowel habits"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Urine</FormLabel>
                        <Input
                          name="urine"
                          value={formik.values.urine}
                          onChange={formik.handleChange}
                          placeholder="Urinary habits"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Sweating</FormLabel>
                        <Input
                          name="sweating"
                          value={formik.values.sweating}
                          onChange={formik.handleChange}
                          placeholder="Sweating patterns"
                        />
                      </FormControl>
                      
                      <FormControl gridColumn={{ md: 'span 2' }}>
                        <FormLabel>Addictions</FormLabel>
                        <Input
                          name="addictions"
                          value={formik.values.addictions}
                          onChange={formik.handleChange}
                          placeholder="Any addictions"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </TabPanel>
                  
                  {/* Menstrual History Tab (Female only) */}
                  {formik.values.sex === 'Female' && (
                    <TabPanel>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Menses</FormLabel>
                          <Input
                            name="menses"
                            value={formik.values.menses}
                            onChange={formik.handleChange}
                            placeholder="Menstrual details"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Menopause</FormLabel>
                          <Select
                            name="menopause"
                            value={formik.values.menopause}
                            onChange={formik.handleChange}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="Perimenopause">Perimenopause</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Leucorrhoea</FormLabel>
                          <Input
                            name="leucorrhoea"
                            value={formik.values.leucorrhoea}
                            onChange={formik.handleChange}
                            placeholder="Leucorrhoea details"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Gonorrhea</FormLabel>
                          <Select
                            name="gonorrhea"
                            value={formik.values.gonorrhea}
                            onChange={formik.handleChange}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="Unknown">Unknown</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl gridColumn={{ md: 'span 2' }}>
                          <FormLabel>Other Discharges</FormLabel>
                          <Textarea
                            name="otherDischarges"
                            value={formik.values.otherDischarges}
                            onChange={formik.handleChange}
                            placeholder="Details of other discharges"
                          />
                        </FormControl>
                      </SimpleGrid>
                    </TabPanel>
                  )}
                  
                  {/* Food and Habits Tab */}
                  <TabPanel>
                    <SimpleGrid columns={1} spacing={4}>
                      <FormControl>
                        <FormLabel>Food Habit</FormLabel>
                        <Input
                          name="foodHabit"
                          value={formik.values.foodHabit}
                          onChange={formik.handleChange}
                          placeholder="Diet preferences, restrictions"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Food Addictions</FormLabel>
                        <Textarea
                          name="foodAddictions"
                          value={formik.values.foodAddictions}
                          onChange={formik.handleChange}
                          placeholder="Food cravings or addictions"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
            
            <Box mt={6} display="flex" justifyContent="flex-end">
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                leftIcon={<FiSave />}
                isLoading={formik.isSubmitting}
              >
                Save Changes
              </Button>
            </Box>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Tab components

const MedicalHistoryTab = ({ patient }) => {
  const medicalHistory = patient.medicalHistory || {
    pastHistory: {},
    familyHistory: {}
  };
  
  return (
    <Card>
      <CardHeader bg="brand.50" py="3">
        <Heading size="md">Medical History</Heading>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <Heading size="sm" mb={3}>Past Medical History</Heading>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Tbody>
                  {/*
                    { key: 'allergy', label: 'Allergy' },
                    { key: 'anemia', label: 'Anemia' },
                    { key: 'arthritis', label: 'Arthritis' },
                    { key: 'asthma', label: 'Asthma' },
                    { key: 'cancer', label: 'Cancer' },
                    { key: 'diabetes', label: 'Diabetes' },
                    { key: 'heartDisease', label: 'Heart Disease' },
                    { key: 'hypertension', label: 'Hypertension' },
                    { key: 'thyroid', label: 'Thyroid' },
                    { key: 'tuberculosis', label: 'Tuberculosis' }
                  */}
                  {Object.entries(medicalHistory.pastHistory).map(([key, value]) => (
                    <Tr key={key}>
                      <Td width="70%">{key.charAt(0).toUpperCase() + key.slice(1)}</Td>
                      <Td>
                        {value ? 
                          <Badge colorScheme="red">Yes</Badge> : 
                          <Badge colorScheme="green">No</Badge>
                        }
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
          
          <Box>
            <Heading size="sm" mb={3}>Family History</Heading>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Tbody>
                  {Object.entries(medicalHistory.familyHistory).map(([key, value]) => (
                    <Tr key={key}>
                      <Td width="70%">{key.charAt(0).toUpperCase() + key.slice(1)}</Td>
                      <Td>
                        {value ? 
                          <Badge colorScheme="red">Yes</Badge> : 
                          <Badge colorScheme="green">No</Badge>
                        }
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

const PhysicalGeneralsTab = ({ patient }) => {
  const physicalGenerals = patient.physicalGenerals || {};
  const fields = [
    { key: 'appetite', label: 'Appetite' },
    { key: 'thirst', label: 'Thirst' },
    { key: 'sleep', label: 'Sleep' },
    { key: 'bowel', label: 'Bowel Habits' },
    { key: 'urine', label: 'Urinary Habits' },
    { key: 'sweating', label: 'Sweating' },
    { key: 'addictions', label: 'Addictions' }
  ];
  
  return (
    <Card>
      <CardHeader bg="brand.50" py="3">
        <Heading size="md">Physical Generals</Heading>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="md">
            <Tbody>
              {fields.map((field) => (
                <Tr key={field.key}>
                  <Td fontWeight="medium" width="30%">{field.label}</Td>
                  <Td>{physicalGenerals[field.key] || 'Not specified'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
};

const MenstrualHistoryTab = ({ patient }) => {
  const menstrualHistory = patient.menstrualHistory || {};
  
  return (
    <Card>
      <CardHeader bg="brand.50" py="3">
        <Heading size="md">Menstrual History</Heading>
      </CardHeader>
      <CardBody>
        {patient.sex !== 'Female' ? (
          <Text fontStyle="italic">Not applicable for male patients</Text>
        ) : (
          <TableContainer>
            <Table variant="simple" size="md">
              <Tbody>
                <Tr>
                  <Td fontWeight="medium" width="30%">Menses</Td>
                  <Td>{menstrualHistory.menses || 'Not specified'}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Menopause</Td>
                  <Td>{menstrualHistory.menopause || 'No'}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Leucorrhoea</Td>
                  <Td>{menstrualHistory.leucorrhoea || 'Not specified'}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Gonorrhea</Td>
                  <Td>{menstrualHistory.gonorrhea || 'No'}</Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">Other Discharges</Td>
                  <Td>{menstrualHistory.otherDischarges || 'None'}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </CardBody>
    </Card>
  );
};

const FoodHabitsTab = ({ patient }) => {
  const foodAndHabit = patient.foodAndHabit || {};
  
  return (
    <Card>
      <CardHeader bg="brand.50" py="3">
        <Heading size="md">Food & Habits</Heading>
      </CardHeader>
      <CardBody>
        <TableContainer>
          <Table variant="simple" size="md">
            <Tbody>
              <Tr>
                <Td fontWeight="medium" width="30%">Food Habit</Td>
                <Td>{foodAndHabit.foodHabit || 'Not specified'}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="medium">Addictions</Td>
                <Td>{foodAndHabit.addictions || 'None'}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </CardBody>
    </Card>
  );
};

const InvestigationsTab = ({ patient, canEdit }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInvestigation, setCurrentInvestigation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // Filter for investigation types: 'all', 'blood', 'xray', etc.
  const [sortOrder, setSortOrder] = useState('desc'); // Sort order: 'asc' or 'desc'
  const toast = useToast();
  const { investigationsAPI, addInvestigation } = useAppContext();
  const [investigations, setInvestigations] = useState([]);
  
  // Fetch investigations when component mounts or patient changes
  useEffect(() => {
    if (patient && patient.id) {
      fetchInvestigations();
    }
  }, [patient]);

  // Fetch investigations for the patient
  const fetchInvestigations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching investigations for patient ID:', patient.id);
      const data = await investigationsAPI.getAllInvestigations(patient.id);
      console.log('Investigations fetched:', data);
      
      // Handle potential null or undefined data
      if (data && Array.isArray(data)) {
        setInvestigations(data);
      } else if (data && data.investigations && Array.isArray(data.investigations)) {
        setInvestigations(data.investigations);
      } else {
        console.warn('Invalid investigations data format:', data);
        setInvestigations([]);
      }
    } catch (error) {
      console.error('Error fetching investigations:', error);
      setError(error.message || 'Failed to load investigation data');
      toast({
        title: "Error fetching investigations",
        description: error.message || 'Failed to load investigation data',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get investigation types for filtering
  const investigationTypes = useMemo(() => {
    const types = investigations.map(inv => inv.type);
    return ['all', ...new Set(types)];
  }, [investigations]);
  
  // Filter and sort investigations based on current settings
  const filteredInvestigations = useMemo(() => {
    let filtered = [...investigations];
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(inv => inv.type === filter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
  }, [investigations, filter, sortOrder]);

  // Delete an investigation
  const handleDeleteInvestigation = async (id) => {
    if (window.confirm('Are you sure you want to delete this investigation?')) {
      try {
        await investigationsAPI.deleteInvestigation(id);
        setInvestigations(investigations.filter(inv => inv.id !== id));
        toast({
          title: "Investigation deleted",
          description: "The investigation has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error deleting investigation",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Edit an investigation
  const handleEditInvestigation = (investigation) => {
    setCurrentInvestigation(investigation);
    setIsEditModalOpen(true);
  };

  // Handle a new or updated investigation
  const handleInvestigationSaved = (investigation) => {
    if (currentInvestigation) {
      // Update existing investigation in the list
      setInvestigations(prev => 
        prev.map(inv => inv.id === investigation.id ? investigation : inv)
      );
    } else {
      // Add new investigation to the list
      setInvestigations(prev => [...prev, investigation]);
    }
    
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setCurrentInvestigation(null);
  };

  // Get count of each investigation type for the summary
  const investigationSummary = useMemo(() => {
    const summary = {};
    investigations.forEach(inv => {
      summary[inv.type] = (summary[inv.type] || 0) + 1;
    });
    return summary;
  }, [investigations]);
  
  return (
    <>
      <Card>
        <CardHeader bg="brand.50" py="3">
          <Flex justify="space-between" align="center">
            <Heading size="md">Investigations & Reports</Heading>
            {canEdit && (
              <Button 
                size="sm" 
                colorScheme="brand" 
                leftIcon={<FiPlusCircle />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Investigation
              </Button>
            )}
          </Flex>
        </CardHeader>
        <CardBody>
          {/* Summary of patient investigations */}
          {investigations.length > 0 && (
            <Box mb={6} p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
              <Heading size="sm" mb={3}>Investigation Summary</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <Box>
                  <Text fontWeight="bold">Total Investigations</Text>
                  <Text fontSize="2xl">{investigations.length}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Latest Investigation</Text>
                  <Text>{investigations.length > 0 ? 
                    `${investigations[0].type} (${formatDate(investigations[0].date)})` : 
                    'None'}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Types</Text>
                  <HStack flexWrap="wrap" spacing={2}>
                    {Object.entries(investigationSummary).map(([type, count]) => (
                      <Badge key={type} colorScheme="brand">
                        {type}: {count}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              </SimpleGrid>
            </Box>
          )}

          {/* Filters and controls */}
          {investigations.length > 0 && (
            <Flex mb={4} justify="space-between" align="center" flexWrap="wrap" gap={2}>
              <HStack>
                <Text fontWeight="medium">Filter by:</Text>
                <Select 
                  size="sm" 
                  width="150px" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {investigationTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </Select>
              </HStack>
              
              <HStack>
                <Text fontWeight="medium">Sort:</Text>
                <Select 
                  size="sm" 
                  width="120px"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </Select>
              </HStack>
            </Flex>
          )}

          {isLoading ? (
            <Flex justify="center" align="center" py="6">
              <Text>Loading investigations...</Text>
            </Flex>
          ) : error ? (
            <Box textAlign="center" py="6" color="red.500">
              <Text fontWeight="medium">Error: {error}</Text>
              <Button 
                mt={4} 
                size="sm" 
                onClick={fetchInvestigations} 
                colorScheme="brand"
              >
                Try Again
              </Button>
            </Box>
          ) : filteredInvestigations.length === 0 ? (
            <Text textAlign="center" py="6" color="gray.500">
              {investigations.length > 0 ? 
                'No investigations match the current filter.' : 
                'No investigation reports added yet.'}
            </Text>
          ) : (
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Details</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredInvestigations.map((investigation) => (
                    <Tr key={investigation.id}>
                      <Td>{formatDate(investigation.date)}</Td>
                      <Td>
                        <Badge colorScheme={getInvestigationColorScheme(investigation.type)}>
                          {investigation.type}
                        </Badge>
                      </Td>
                      <Td>{investigation.details}</Td>
                      <Td>
                        <HStack spacing="2">
                          {investigation.fileUrl && (
                            <IconButton
                              aria-label="View file"
                              icon={<FiFileText />}
                              size="sm"
                              variant="ghost"
                              as="a"
                              href={investigation.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="View Report Document"
                            />
                          )}
                          {canEdit && (
                            <>
                              <IconButton
                                aria-label="Edit investigation"
                                icon={<FiEdit />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditInvestigation(investigation)}
                                title="Edit Investigation"
                              />
                              <IconButton
                                aria-label="Delete investigation"
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteInvestigation(investigation.id)}
                                title="Delete Investigation"
                              />
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>
      
      {/* Add/Edit Investigation Modal */}
      <InvestigationFormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setCurrentInvestigation(null);
        }}
        patientId={patient.id}
        investigation={currentInvestigation}
        onSave={handleInvestigationSaved}
      />
    </>
  );
};

// Helper function to get color scheme based on investigation type
const getInvestigationColorScheme = (type) => {
  const typeMap = {
    'Blood Test': 'red',
    'Urine Test': 'yellow',
    'X-Ray': 'blue',
    'CT Scan': 'purple',
    'MRI': 'pink',
    'Ultrasound': 'cyan',
    'ECG': 'orange',
    'EEG': 'green'
  };
  
  return typeMap[type] || 'gray';
};

const InvestigationFormModal = ({ isOpen, onClose, patientId, investigation, onSave }) => {
  const toast = useToast();
  const { investigationsAPI, addInvestigation } = useAppContext();
  const isEditing = !!investigation;
  const [selectedType, setSelectedType] = useState(investigation?.type || '');
  
  // Initialize form validation schema
  const validationSchema = Yup.object({
    type: Yup.string().required('Investigation type is required'),
    details: Yup.string().required('Details are required'),
    date: Yup.date().required('Date is required').max(new Date(), 'Date cannot be in the future'),
    fileUrl: Yup.string().url('Must be a valid URL').nullable(),
    doctor: Yup.string(),
    results: Yup.string(),
    normalRange: Yup.string(),
    followUpNeeded: Yup.boolean(),
    followUpDate: Yup.date().nullable().when('followUpNeeded', {
      is: true,
      then: Yup.date().min(new Date(), 'Follow-up date must be in the future').required('Follow-up date is required'),
    }),
    notes: Yup.string()
  });
  
  // Initialize formik for form handling
  const formik = useFormik({
    initialValues: {
      type: investigation?.type || '',
      details: investigation?.details || '',
      date: investigation?.date ? new Date(investigation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fileUrl: investigation?.fileUrl || '',
      doctor: investigation?.doctor || '',
      results: investigation?.results || '',
      normalRange: investigation?.normalRange || '',
      followUpNeeded: investigation?.followUpNeeded || false,
      followUpDate: investigation?.followUpDate ? new Date(investigation.followUpDate).toISOString().split('T')[0] : '',
      notes: investigation?.notes || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        let result;
        
        if (isEditing) {
          // Update existing investigation
          result = await investigationsAPI.updateInvestigation(investigation.id, {
            ...values,
            patientId,
          });
          toast({
            title: "Investigation updated",
            description: "The investigation has been successfully updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          // Create new investigation using addInvestigation from context
          // This ensures consistent state management
          result = await addInvestigation({
            ...values,
            patientId,
          });
          toast({
            title: "Investigation added",
            description: "The investigation has been successfully added.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
        
        onSave(result);
      } catch (error) {
        toast({
          title: isEditing ? "Error updating investigation" : "Error adding investigation",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  // Update form fields based on investigation type
  useEffect(() => {
    if (formik.values.type !== selectedType) {
      setSelectedType(formik.values.type);
    }
  }, [formik.values.type]);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEditing ? 'Edit Investigation' : 'Add New Investigation'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired isInvalid={formik.touched.type && formik.errors.type}>
                  <FormLabel htmlFor="type">Investigation Type</FormLabel>
                  <Select
                    id="type"
                    placeholder="Select type"
                    {...formik.getFieldProps('type')}
                  >
                    <option value="Blood Test">Blood Test</option>
                    <option value="Urine Test">Urine Test</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="ECG">ECG</option>
                    <option value="EEG">EEG</option>
                    <option value="Biopsy">Biopsy</option>
                    <option value="Endoscopy">Endoscopy</option>
                    <option value="Colonoscopy">Colonoscopy</option>
                    <option value="Other">Other</option>
                  </Select>
                  <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.date && formik.errors.date}>
                  <FormLabel htmlFor="date">Date</FormLabel>
                  <Input
                    id="date"
                    type="date"
                    {...formik.getFieldProps('date')}
                  />
                  <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel htmlFor="doctor">Doctor</FormLabel>
                <Input
                  id="doctor"
                  placeholder="Doctor who ordered/performed the investigation"
                  {...formik.getFieldProps('doctor')}
                />
              </FormControl>
              
              <FormControl isRequired isInvalid={formik.touched.details && formik.errors.details}>
                <FormLabel htmlFor="details">Details</FormLabel>
                <Textarea
                  id="details"
                  placeholder="Enter investigation details"
                  rows={3}
                  {...formik.getFieldProps('details')}
                />
                <FormErrorMessage>{formik.errors.details}</FormErrorMessage>
              </FormControl>
              
              {/* Show different fields based on investigation type */}
              {['Blood Test', 'Urine Test'].includes(selectedType) && (
                <>
                  <FormControl>
                    <FormLabel htmlFor="results">Results</FormLabel>
                    <Textarea
                      id="results"
                      placeholder="Enter test results"
                      rows={2}
                      {...formik.getFieldProps('results')}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel htmlFor="normalRange">Normal Range</FormLabel>
                    <Input
                      id="normalRange"
                      placeholder="Normal reference ranges"
                      {...formik.getFieldProps('normalRange')}
                    />
                  </FormControl>
                </>
              )}
              
              {['X-Ray', 'CT Scan', 'MRI', 'Ultrasound'].includes(selectedType) && (
                <FormControl isInvalid={formik.touched.fileUrl && formik.errors.fileUrl}>
                  <FormLabel htmlFor="fileUrl">Image/Report URL</FormLabel>
                  <Input
                    id="fileUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    {...formik.getFieldProps('fileUrl')}
                  />
                  <FormErrorMessage>{formik.errors.fileUrl}</FormErrorMessage>
                </FormControl>
              )}
              
              {!['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Blood Test', 'Urine Test'].includes(selectedType) && (
                <FormControl isInvalid={formik.touched.fileUrl && formik.errors.fileUrl}>
                  <FormLabel htmlFor="fileUrl">File URL (Optional)</FormLabel>
                  <Input
                    id="fileUrl"
                    type="url"
                    placeholder="https://example.com/file.pdf"
                    {...formik.getFieldProps('fileUrl')}
                  />
                  <FormErrorMessage>{formik.errors.fileUrl}</FormErrorMessage>
                </FormControl>
              )}
              
              <FormControl>
                <FormLabel htmlFor="notes">Additional Notes</FormLabel>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes"
                  rows={2}
                  {...formik.getFieldProps('notes')}
                />
              </FormControl>
              
              <Box>
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="followUpNeeded" mb="0">
                    Follow-up Required?
                  </FormLabel>
                  <Switch
                    id="followUpNeeded"
                    isChecked={formik.values.followUpNeeded}
                    onChange={() => {
                      formik.setFieldValue('followUpNeeded', !formik.values.followUpNeeded);
                    }}
                  />
                </FormControl>
                
                {formik.values.followUpNeeded && (
                  <FormControl mt={3} isInvalid={formik.touched.followUpDate && formik.errors.followUpDate}>
                    <FormLabel htmlFor="followUpDate">Follow-up Date</FormLabel>
                    <Input
                      id="followUpDate"
                      type="date"
                      {...formik.getFieldProps('followUpDate')}
                    />
                    <FormErrorMessage>{formik.errors.followUpDate}</FormErrorMessage>
                  </FormControl>
                )}
              </Box>
            </VStack>
            
            <ModalFooter px={0} mt={6}>
              <Button mr={3} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button 
                type="submit" 
                colorScheme="brand" 
                isLoading={formik.isSubmitting}
                leftIcon={isEditing ? <FiSave /> : <FiPlusCircle />}
              >
                {isEditing ? 'Save Changes' : 'Add Investigation'}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};





export default PatientView;
