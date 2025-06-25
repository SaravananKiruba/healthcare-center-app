import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
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
  FiPrinter,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Placeholder components for tabs - these would be imported from their own files in a complete implementation

const PatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { patients, doctors, deletePatient, updatePatient, currentUser } = useAppContext();
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  
  // Find the patient with the given ID
  const patient = patients.find(p => p.id === id);
  
  // Check if patient exists
  if (!patient) {
    return (
      <Box textAlign="center" py="10">
        <Heading size="lg" mb="4">Patient Not Found</Heading>
        <Text mb="6">The patient you're looking for doesn't exist or has been removed.</Text>
        <Button as={RouterLink} to="/patients" leftIcon={<FiArrowLeft />}>
          Back to Patient List
        </Button>
      </Box>
    );
  }
    // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original string if invalid
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      return dateString || "N/A";
    }
  };
  
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
    
    navigate('/patients');
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

  // Check user permissions
  const canEdit = ['admin', 'doctor'].includes(currentUser.role);
  const canDelete = currentUser.role === 'admin';
  
  return (
    <Box>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }}
        mb="6"
      >
        <HStack mb={{ base: 4, md: 0 }}>
          <Button
            as={RouterLink}
            to="/patients"
            variant="outline"
            leftIcon={<FiArrowLeft />}
            size="sm"
          >
            Back
          </Button>
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
          
          <Button
            as={RouterLink}
            to={`/billing/new/${patient.id}`}
            colorScheme="brand"
            leftIcon={<FiDollarSign />}
            size={{ base: 'sm', md: 'md' }}
          >
            Create Invoice
          </Button>
          
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
                  <Text fontWeight="semibold" fontFamily="mono">{patient.id}</Text>
                </HStack>
                <HStack mt="1">
                  <Badge colorScheme="blue">{patient.sex}</Badge>
                  <Text fontWeight="semibold">{patient.age} years</Text>
                </HStack>
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
      <Tabs isLazy colorScheme="brand">
        <TabList overflowX="auto" flexWrap="nowrap" py="2">
          <Tab>Medical History</Tab>
          <Tab>Physical Generals</Tab>
          {patient.sex === 'Female' && <Tab>Menstrual History</Tab>}
          <Tab>Food & Habits</Tab>
          <Tab>Investigations</Tab>
          <Tab>Treatment Details</Tab>
          <Tab>Billing</Tab>
        </TabList>
        
        <TabPanels mt="4">
          <TabPanel p="0">
            <MedicalHistoryTab patient={patient} canEdit={canEdit} />
          </TabPanel>
          
          <TabPanel p="0">
            <PhysicalGeneralsTab patient={patient} canEdit={canEdit} />
          </TabPanel>
          
          {patient.sex === 'Female' && (
            <TabPanel p="0">
              <MenstrualHistoryTab patient={patient} canEdit={canEdit} />
            </TabPanel>
          )}
          
          <TabPanel p="0">
            <FoodHabitsTab patient={patient} canEdit={canEdit} />
          </TabPanel>
          
          <TabPanel p="0">
            <InvestigationsTab patient={patient} canEdit={canEdit} />
          </TabPanel>
          
          <TabPanel p="0">
            <TreatmentTab patient={patient} doctors={doctors} canEdit={canEdit} />
          </TabPanel>
          
          <TabPanel p="0">
            <BillingTab patient={patient} />
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
              This will permanently remove all their data including medical history, 
              treatments, and billing information.
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

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      name: patient.name || '',
      guardianName: patient.guardianName || '',
      address: patient.address || '',
      age: patient.age || '',
      sex: patient.sex || '',
      occupation: patient.occupation || '',
      mobileNumber: patient.mobileNumber || '',
      chiefComplaints: patient.chiefComplaints || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const updatedPatient = {
          ...patient,
          name: values.name,
          guardianName: values.guardianName,
          address: values.address,
          age: parseInt(values.age),
          sex: values.sex,
          occupation: values.occupation || '',
          mobileNumber: values.mobileNumber,
          chiefComplaints: values.chiefComplaints,
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
          </form>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            leftIcon={<FiSave />} 
            isLoading={formik.isSubmitting}
            onClick={formik.handleSubmit}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Placeholder components for tabs
// These would be moved to their own files in a complete implementation
const MedicalHistoryTab = ({ patient, canEdit }) => {
  const { updatePatient } = useAppContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle toggling of medical history values
  const handleToggle = (category, condition) => {
    setMedicalHistory(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [condition]: !prev[category][condition]
      }
    }));
  };
  
  // Save changes to medical history
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Update patient with new medical history
      await updatePatient(patient.id, {
        ...patient,
        medicalHistory
      });
      
      toast({
        title: 'Medical history updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update medical history',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader bg="gray.50" py="3">
        <Flex justify="space-between" align="center">
          <Heading size="md">Medical History</Heading>
          {canEdit && (
            <Button size="sm" leftIcon={<FiEdit />} variant="ghost" onClick={onOpen}>
              Edit
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <Heading size="sm" mb="3">Past History</Heading>
            <SimpleGrid columns={2} spacing={3}>
              {Object.entries(patient.medicalHistory.pastHistory).map(([condition, value]) => (
                <HStack key={condition}>
                  <Icon 
                    as={value ? FiCheck : FiX} 
                    color={value ? 'green.500' : 'red.500'} 
                  />
                  <Text>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                </HStack>
              ))}
            </SimpleGrid>
          </Box>
          
          <Box>
            <Heading size="sm" mb="3">Family History</Heading>
            <SimpleGrid columns={2} spacing={3}>
              {Object.entries(patient.medicalHistory.familyHistory).map(([condition, value]) => (
                <HStack key={condition}>
                  <Icon 
                    as={value ? FiCheck : FiX} 
                    color={value ? 'green.500' : 'red.500'} 
                  />
                  <Text>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                </HStack>
              ))}
            </SimpleGrid>
          </Box>
        </SimpleGrid>
        
        {/* Medical History Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Medical History</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Heading size="sm" mb="3">Past History</Heading>
                  {Object.entries(medicalHistory.pastHistory).map(([condition, value]) => (
                    <HStack key={condition} mb={2}>
                      <Button 
                        size="sm" 
                        colorScheme={value ? 'green' : 'gray'}
                        onClick={() => handleToggle('pastHistory', condition)}
                        leftIcon={value ? <FiCheck /> : <FiX />}
                        variant={value ? 'solid' : 'outline'}
                      >
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </Button>
                    </HStack>
                  ))}
                </Box>
                
                <Box>
                  <Heading size="sm" mb="3">Family History</Heading>
                  {Object.entries(medicalHistory.familyHistory).map(([condition, value]) => (
                    <HStack key={condition} mb={2}>
                      <Button 
                        size="sm" 
                        colorScheme={value ? 'green' : 'gray'}
                        onClick={() => handleToggle('familyHistory', condition)}
                        leftIcon={value ? <FiCheck /> : <FiX />}
                        variant={value ? 'solid' : 'outline'}
                      >
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </Button>
                    </HStack>
                  ))}
                </Box>
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                leftIcon={<FiSave />} 
                onClick={handleSave}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

const PhysicalGeneralsTab = ({ patient, canEdit }) => {
  const { updatePatient } = useAppContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState(patient.physicalGenerals);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Update patient with new physical generals data
      await updatePatient(patient.id, {
        ...patient,
        physicalGenerals: formData
      });
      
      toast({
        title: 'Physical generals updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update physical generals',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader bg="gray.50" py="3">
        <Flex justify="space-between" align="center">
          <Heading size="md">Physical Generals</Heading>
          {canEdit && (
            <Button size="sm" leftIcon={<FiEdit />} variant="ghost" onClick={onOpen}>
              Edit
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {Object.entries(patient.physicalGenerals).map(([key, value]) => (
            <Box key={key}>
              <Text fontWeight="medium">{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text>{value || 'Not recorded'}</Text>
            </Box>
          ))}
        </SimpleGrid>
        
        {/* Physical Generals Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Physical Generals</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {Object.keys(formData).map((key) => (
                  <FormControl key={key} mb={3}>
                    <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
                    <Input 
                      name={key}
                      value={formData[key] || ''}
                      onChange={handleChange}
                    />
                  </FormControl>
                ))}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                leftIcon={<FiSave />} 
                onClick={handleSave}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

const MenstrualHistoryTab = ({ patient, canEdit }) => {
  const { updatePatient } = useAppContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState(patient.menstrualHistory || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Update patient with new menstrual history data
      await updatePatient(patient.id, {
        ...patient,
        menstrualHistory: formData
      });
      
      toast({
        title: 'Menstrual history updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update menstrual history',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader bg="gray.50" py="3">
        <Flex justify="space-between" align="center">
          <Heading size="md">Menstrual & Discharge History</Heading>
          {canEdit && (
            <Button size="sm" leftIcon={<FiEdit />} variant="ghost" onClick={onOpen}>
              Edit
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        {patient.menstrualHistory ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {Object.entries(patient.menstrualHistory).map(([key, value]) => (
              <Box key={key}>
                <Text fontWeight="medium">{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <Text>{value || 'Not recorded'}</Text>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text>No menstrual history recorded for this patient.</Text>
        )}
        
        {/* Menstrual History Edit Modal */}
        {patient.menstrualHistory && (
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Menstrual History</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Menses</FormLabel>
                    <Textarea
                      name="menses"
                      value={formData.menses || ''}
                      onChange={handleChange}
                      placeholder="Details about menses"
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Menopause</FormLabel>
                    <Select
                      name="menopause"
                      value={formData.menopause || 'No'}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                      <option value="In Progress">In Progress</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Leucorrhoea</FormLabel>
                    <Textarea
                      name="leucorrhoea"
                      value={formData.leucorrhoea || ''}
                      onChange={handleChange}
                      placeholder="Details about leucorrhoea"
                      rows={3}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Gonorrhea</FormLabel>
                    <Select
                      name="gonorrhea"
                      value={formData.gonorrhea || 'No'}
                      onChange={handleChange}
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
                      value={formData.otherDischarges || ''}
                      onChange={handleChange}
                      placeholder="Details about other discharges"
                      rows={3}
                    />
                  </FormControl>
                </SimpleGrid>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="brand" 
                  leftIcon={<FiSave />} 
                  onClick={handleSave}
                  isLoading={isSubmitting}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </CardBody>
    </Card>
  );
};

const FoodHabitsTab = ({ patient, canEdit }) => {
  const { updatePatient } = useAppContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState(patient.foodAndHabit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Update patient with new food and habit data
      await updatePatient(patient.id, {
        ...patient,
        foodAndHabit: formData
      });
      
      toast({
        title: 'Food & habits updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update food & habits',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader bg="gray.50" py="3">
        <Flex justify="space-between" align="center">
          <Heading size="md">Food & Habit</Heading>
          {canEdit && (
            <Button size="sm" leftIcon={<FiEdit />} variant="ghost" onClick={onOpen}>
              Edit
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {Object.entries(patient.foodAndHabit).map(([key, value]) => (
            <Box key={key}>
              <Text fontWeight="medium">{key === 'foodHabit' ? 'Food Habit' : key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text>{value || 'Not recorded'}</Text>
            </Box>
          ))}
        </SimpleGrid>
        
        {/* Food & Habits Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Food & Habits</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Food Habit</FormLabel>
                  <Select
                    name="foodHabit"
                    value={formData.foodHabit || ''}
                    onChange={handleChange}
                  >
                    <option value="">Select food habit</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-vegetarian">Non-vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Addictions</FormLabel>
                  <Textarea
                    name="addictions"
                    value={formData.addictions || ''}
                    onChange={handleChange}
                    placeholder="Enter details about habits, addictions, etc."
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                leftIcon={<FiSave />} 
                onClick={handleSave}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

const InvestigationsTab = ({ patient, canEdit }) => {
  const { addInvestigation, updateInvestigation } = useAppContext();
  const toast = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentInvestigation, setCurrentInvestigation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initial form values for new investigation
  const initialValues = {
    type: '',
    date: new Date().toISOString().split('T')[0],
    details: '',
    fileUrl: '',
    patientId: patient.id
  };
  
  // Form validation schema
  const validationSchema = Yup.object({
    type: Yup.string().required('Investigation type is required'),
    date: Yup.date().required('Date is required'),
    details: Yup.string().required('Details are required'),
  });
  
  // Formik for add/edit investigation
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        if (currentInvestigation) {
          // Update existing investigation
          await updateInvestigation(
            currentInvestigation.id, 
            patient.id, 
            {
              ...values,
              date: new Date(values.date).toISOString()
            }
          );
          
          toast({
            title: 'Investigation updated',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          setIsEditModalOpen(false);
        } else {
          // Add new investigation
          await addInvestigation({
            ...values,
            date: new Date(values.date).toISOString()
          });
          
          toast({
            title: 'Investigation added',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          setIsAddModalOpen(false);
        }
        
        formik.resetForm();
      } catch (error) {
        toast({
          title: currentInvestigation ? 'Failed to update investigation' : 'Failed to add investigation',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  // Open view modal
  const handleViewInvestigation = (investigation) => {
    setCurrentInvestigation(investigation);
    setIsViewModalOpen(true);
  };
  
  // Open edit modal
  const handleEditInvestigation = (investigation) => {
    setCurrentInvestigation(investigation);
    formik.setValues({
      type: investigation.type,
      date: new Date(investigation.date).toISOString().split('T')[0],
      details: investigation.details,
      fileUrl: investigation.fileUrl || '',
      patientId: patient.id
    });
    setIsEditModalOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString || 'N/A';
    }
  };
  
  // Handle modal close actions
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    formik.resetForm();
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentInvestigation(null);
  };
  
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setCurrentInvestigation(null);
  };
  
  // Open add modal
  const openAddModal = () => {
    formik.setValues(initialValues);
    setIsAddModalOpen(true);
  };
  
  return (
    <Card>
      <CardHeader bg="gray.50" py="3">
        <Flex justify="space-between" align="center">
          <Heading size="md">Investigations</Heading>
          {canEdit && (
            <Button 
              size="sm" 
              leftIcon={<FiPlusCircle />} 
              colorScheme="brand"
              onClick={openAddModal}
            >
              Add Investigation
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody p={0}>
        <TableContainer>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Details</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {patient.investigations && patient.investigations.length > 0 ? (
                patient.investigations.map(investigation => (
                  <Tr key={investigation.id}>
                    <Td>{formatDate(investigation.date)}</Td>
                    <Td>{investigation.type}</Td>
                    <Td>{investigation.details.length > 50 ? 
                         investigation.details.substring(0, 50) + '...' : 
                         investigation.details}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="blue"
                          onClick={() => handleViewInvestigation(investigation)}
                        >
                          View
                        </Button>
                        {canEdit && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            colorScheme="brand"
                            onClick={() => handleEditInvestigation(investigation)}
                          >
                            Edit
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={4}>
                    No investigations recorded
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        
        {/* Add Investigation Modal */}
        <Modal isOpen={isAddModalOpen} onClose={closeAddModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Investigation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={formik.touched.type && formik.errors.type}>
                  <FormLabel>Investigation Type</FormLabel>
                  <Input
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Blood Test, X-ray, MRI"
                  />
                  <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.date && formik.errors.date}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    name="date"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.details && formik.errors.details}>
                  <FormLabel>Details</FormLabel>
                  <Textarea
                    name="details"
                    value={formik.values.details}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Investigation details, results, etc."
                    rows={5}
                  />
                  <FormErrorMessage>{formik.errors.details}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>File URL (optional)</FormLabel>
                  <Input
                    name="fileUrl"
                    value={formik.values.fileUrl}
                    onChange={formik.handleChange}
                    placeholder="Link to investigation file"
                  />
                  <FormErrorMessage>{formik.errors.fileUrl}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeAddModal}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                isLoading={isSubmitting}
                onClick={formik.handleSubmit}
              >
                Save Investigation
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Edit Investigation Modal */}
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Investigation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={formik.touched.type && formik.errors.type}>
                  <FormLabel>Investigation Type</FormLabel>
                  <Input
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{formik.errors.type}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.date && formik.errors.date}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    name="date"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.details && formik.errors.details}>
                  <FormLabel>Details</FormLabel>
                  <Textarea
                    name="details"
                    value={formik.values.details}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={5}
                  />
                  <FormErrorMessage>{formik.errors.details}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>File URL (optional)</FormLabel>
                  <Input
                    name="fileUrl"
                    value={formik.values.fileUrl || ''}
                    onChange={formik.handleChange}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeEditModal}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                isLoading={isSubmitting}
                onClick={formik.handleSubmit}
              >
                Update Investigation
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* View Investigation Modal */}
        {currentInvestigation && (
          <Modal isOpen={isViewModalOpen} onClose={closeViewModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{currentInvestigation.type}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold">Investigation Date</Text>
                    <Text>{formatDate(currentInvestigation.date)}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Details</Text>
                    <Text whiteSpace="pre-wrap">{currentInvestigation.details}</Text>
                  </Box>
                  
                  {currentInvestigation.fileUrl && (
                    <Box>
                      <Text fontWeight="semibold">Attached File</Text>
                      <Button 
                        as="a" 
                        href={currentInvestigation.fileUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        colorScheme="blue" 
                        size="sm"
                        leftIcon={<FiFileText />}
                      >
                        View File
                      </Button>
                    </Box>
                  )}
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={closeViewModal}>
                  Close
                </Button>
                {canEdit && (
                  <Button 
                    ml={3} 
                    colorScheme="brand" 
                    leftIcon={<FiEdit />}
                    onClick={() => {
                      closeViewModal();
                      handleEditInvestigation(currentInvestigation);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </CardBody>
    </Card>
  );
};

const TreatmentTab = ({ patient, doctors, canEdit }) => {
  const { addTreatment, updateTreatment } = useAppContext();
  const toast = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initial form values for new treatment
  const initialValues = {
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    observations: '',
    medications: '',
    patientId: patient.id
  };
  
  // Form validation schema
  const validationSchema = Yup.object({
    date: Yup.date().required('Date is required'),
    doctor: Yup.string().required('Doctor name is required'),
    observations: Yup.string().required('Observations are required'),
    medications: Yup.string().required('Medications are required'),
  });
  
  // Formik for add/edit treatment
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        if (currentTreatment) {
          // Update existing treatment
          await updateTreatment(
            currentTreatment.id, 
            patient.id, 
            {
              ...values,
              date: new Date(values.date).toISOString()
            }
          );
          
          toast({
            title: 'Treatment updated',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          setIsEditModalOpen(false);
        } else {
          // Add new treatment
          await addTreatment({
            ...values,
            date: new Date(values.date).toISOString()
          });
          
          toast({
            title: 'Treatment added',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          setIsAddModalOpen(false);
        }
        
        formik.resetForm();
      } catch (error) {
        toast({
          title: currentTreatment ? 'Failed to update treatment' : 'Failed to add treatment',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });
  
  // Open view modal
  const handleViewTreatment = (treatment) => {
    setCurrentTreatment(treatment);
    setIsViewModalOpen(true);
  };
  
  // Open edit modal
  const handleEditTreatment = (treatment) => {
    setCurrentTreatment(treatment);
    formik.setValues({
      date: new Date(treatment.date).toISOString().split('T')[0],
      doctor: treatment.doctor,
      observations: treatment.observations,
      medications: treatment.medications,
      patientId: patient.id
    });
    setIsEditModalOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString || 'N/A';
    }
  };
  
  // Handle modal close actions
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    formik.resetForm();
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentTreatment(null);
  };
  
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setCurrentTreatment(null);
  };
  
  // Open add modal
  const openAddModal = () => {
    formik.setValues(initialValues);
    setIsAddModalOpen(true);
  };
  
  return (
    <Card>
      <CardHeader bg="gray.50" py="3">
        <Flex justify="space-between" align="center">
          <Heading size="md">Treatment Details</Heading>
          {canEdit && (
            <Button 
              size="sm" 
              leftIcon={<FiPlusCircle />} 
              colorScheme="brand"
              onClick={openAddModal}
            >
              Add Treatment
            </Button>
          )}
        </Flex>
      </CardHeader>
      <CardBody p={0}>
        <TableContainer>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Date</Th>
                <Th>Doctor</Th>
                <Th>Observations</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {patient.treatments && patient.treatments.length > 0 ? (
                patient.treatments.map(treatment => (
                  <Tr key={treatment.id}>
                    <Td>{formatDate(treatment.date)}</Td>
                    <Td>{treatment.doctor}</Td>
                    <Td>{treatment.observations.length > 50 ? 
                         treatment.observations.substring(0, 50) + '...' : 
                         treatment.observations}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="blue"
                          onClick={() => handleViewTreatment(treatment)}
                        >
                          View
                        </Button>
                        {canEdit && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            colorScheme="brand"
                            onClick={() => handleEditTreatment(treatment)}
                          >
                            Edit
                          </Button>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={4}>
                    No treatments recorded
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
        
        {/* Add Treatment Modal */}
        <Modal isOpen={isAddModalOpen} onClose={closeAddModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Treatment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={formik.touched.date && formik.errors.date}>
                  <FormLabel>Treatment Date</FormLabel>
                  <Input
                    name="date"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.doctor && formik.errors.doctor}>
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    name="doctor"
                    placeholder="Select doctor"
                    value={formik.values.doctor}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} ({doctor.specialty})
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{formik.errors.doctor}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.observations && formik.errors.observations}>
                  <FormLabel>Observations</FormLabel>
                  <Textarea
                    name="observations"
                    value={formik.values.observations}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Clinical observations, symptoms, etc."
                    rows={5}
                  />
                  <FormErrorMessage>{formik.errors.observations}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.medications && formik.errors.medications}>
                  <FormLabel>Medications & Treatment Plan</FormLabel>
                  <Textarea
                    name="medications"
                    value={formik.values.medications}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Prescribed medications, dosage, and treatment plan"
                    rows={5}
                  />
                  <FormErrorMessage>{formik.errors.medications}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeAddModal}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                isLoading={isSubmitting}
                onClick={formik.handleSubmit}
              >
                Save Treatment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* Edit Treatment Modal */}
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Treatment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={formik.touched.date && formik.errors.date}>
                  <FormLabel>Treatment Date</FormLabel>
                  <Input
                    name="date"
                    type="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{formik.errors.date}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.doctor && formik.errors.doctor}>
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    name="doctor"
                    placeholder="Select doctor"
                    value={formik.values.doctor}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name} ({doctor.specialty})
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{formik.errors.doctor}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.observations && formik.errors.observations}>
                  <FormLabel>Observations</FormLabel>
                  <Textarea
                    name="observations"
                    value={formik.values.observations}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={5}
                  />
                  <FormErrorMessage>{formik.errors.observations}</FormErrorMessage>
                </FormControl>
                
                <FormControl isRequired isInvalid={formik.touched.medications && formik.errors.medications}>
                  <FormLabel>Medications & Treatment Plan</FormLabel>
                  <Textarea
                    name="medications"
                    value={formik.values.medications}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={5}
                  />
                  <FormErrorMessage>{formik.errors.medications}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={closeEditModal}>
                Cancel
              </Button>
              <Button 
                colorScheme="brand" 
                isLoading={isSubmitting}
                onClick={formik.handleSubmit}
              >
                Update Treatment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        
        {/* View Treatment Modal */}
        {currentTreatment && (
          <Modal isOpen={isViewModalOpen} onClose={closeViewModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Treatment Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="semibold">Treatment Date</Text>
                    <Text>{formatDate(currentTreatment.date)}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Doctor</Text>
                    <Text>{currentTreatment.doctor}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Observations</Text>
                    <Text whiteSpace="pre-wrap">{currentTreatment.observations}</Text>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="semibold">Medications & Treatment Plan</Text>
                    <Text whiteSpace="pre-wrap">{currentTreatment.medications}</Text>
                  </Box>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={closeViewModal}>
                  Close
                </Button>
                {canEdit && (
                  <Button 
                    ml={3} 
                    colorScheme="brand" 
                    leftIcon={<FiEdit />}
                    onClick={() => {
                      closeViewModal();
                      handleEditTreatment(currentTreatment);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </CardBody>
    </Card>
  );
};

const BillingTab = ({ patient }) => {
  const { isOpen: isViewModalOpen, onOpen: onOpenViewModal, onClose: onCloseViewModal } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { updateInvoice, isLoading } = useAppContext();
  const toast = useToast();
  const [paymentFormErrors, setPaymentFormErrors] = useState({});
  
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    onOpenViewModal();
  };
  
  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentFormErrors({});
    onOpenEditModal();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; 
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString || "N/A";
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };
  
  // Sort invoices by date (newest first)
  const sortedInvoices = [...(patient.invoices || [])].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Validate payment form
  const validatePaymentForm = (formData) => {
    const errors = {};
    const status = formData.get('paymentStatus');
    const mode = formData.get('paymentMode');
    const amountPaid = parseFloat(formData.get('amountPaid'));
    
    if (status === 'Paid' && amountPaid < selectedInvoice.total) {
      errors.amountPaid = "Amount paid must equal or exceed total amount for Paid status";
    }
    
    if (status === 'Partial' && (!amountPaid || amountPaid <= 0 || amountPaid >= selectedInvoice.total)) {
      errors.amountPaid = "For partial payment, amount must be greater than 0 and less than total";
    }
    
    if ((status === 'Paid' || status === 'Partial') && !mode) {
      errors.paymentMode = "Payment mode is required";
    }
    
    setPaymentFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle payment update
  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const status = formData.get('paymentStatus');
    const mode = formData.get('paymentMode');
    const transactionId = formData.get('transactionId');
    const amountPaid = parseFloat(formData.get('amountPaid'));
    
    // Validate form
    if (!validatePaymentForm(formData)) {
      return;
    }
    
    try {
      // Update invoice
      await updateInvoice(patient.id, selectedInvoice.id, {
        paymentStatus: status,
        paymentMode: mode,
        transactionId,
        amountPaid,
      });
      
      toast({
        title: 'Invoice Updated',
        description: `Payment status updated to ${status}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onCloseEditModal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || "Failed to update payment status",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader bg="gray.50" py="3">
          <Flex justify="space-between" align="center">
            <Heading size="md">Invoices</Heading>
            <Button 
              as={RouterLink}
              to={`/billing/new/${patient.id}`}
              size="sm" 
              leftIcon={<FiPlusCircle />} 
              colorScheme="brand"
            >
              Create Invoice
            </Button>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          <TableContainer>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Invoice ID</Th>
                  <Th>Date</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedInvoices.length > 0 ? (
                  sortedInvoices.map(invoice => (
                    <Tr key={invoice.id}>
                      <Td fontFamily="mono">{invoice.id}</Td>
                      <Td>{formatDate(invoice.date)}</Td>
                      <Td isNumeric>{formatCurrency(invoice.total)}</Td>
                      <Td>
                        <Badge colorScheme={
                          invoice.paymentStatus === 'Paid' ? 'green' : 
                          invoice.paymentStatus === 'Partial' ? 'yellow' : 'red'
                        }>
                          {invoice.paymentStatus}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            View
                          </Button>
                          {invoice.paymentStatus !== 'Paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              colorScheme="blue"
                              as={RouterLink}
                              to={`/billing/edit/${patient.id}/${invoice.id}`}
                            >
                              Edit
                            </Button>
                          )}
                          <IconButton 
                            size="sm" 
                            variant="ghost"
                            colorScheme="red" 
                            icon={<FiPrinter />} 
                            onClick={() => {
                              toast({
                                title: 'Print Invoice',
                                description: 'Printing feature will be implemented soon.',
                                status: 'info',
                                duration: 3000,
                                isClosable: true
                              });
                            }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={4}>
                      No invoices created yet
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
      
      {/* Invoice View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={onCloseViewModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Invoice Details
            <Badge ml={2} colorScheme={
              selectedInvoice?.paymentStatus === 'Paid' ? 'green' : 
              selectedInvoice?.paymentStatus === 'Partial' ? 'yellow' : 'red'
            }>
              {selectedInvoice?.paymentStatus}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInvoice && (
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Invoice ID</Text>
                    <Text fontFamily="mono">{selectedInvoice.id}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Date</Text>
                    <Text>{formatDate(selectedInvoice.date)}</Text>
                  </Box>
                </SimpleGrid>

                <Divider />
                
                <Box>
                  <Text fontWeight="bold" mb={3}>Invoice Items</Text>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Description</Th>
                          <Th isNumeric>Amount</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedInvoice.items && selectedInvoice.items.map((item, index) => (
                          <Tr key={item.id || index}>
                            <Td>{item.description}</Td>
                            <Td isNumeric>{formatCurrency(item.amount)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
                
                <Divider />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Payment Mode</Text>
                    <Text>{selectedInvoice.paymentMode || 'N/A'}</Text>
                  </Box>
                  {selectedInvoice.transactionId && (
                    <Box>
                      <Text fontWeight="bold" mb={1}>Transaction ID</Text>
                      <Text>{selectedInvoice.transactionId}</Text>
                    </Box>
                  )}
                </SimpleGrid>
                
                <Divider />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Subtotal</Text>
                    <Text>{formatCurrency(selectedInvoice.subtotal)}</Text>
                  </Box>
                  {selectedInvoice.discount > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={1}>Discount ({selectedInvoice.discount}%)</Text>
                      <Text color="green.500">
                        -{formatCurrency((selectedInvoice.subtotal * selectedInvoice.discount) / 100)}
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>
                
                {selectedInvoice.tax > 0 && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Tax ({selectedInvoice.tax}%)</Text>
                    <Text>{formatCurrency((selectedInvoice.subtotal * (1 - selectedInvoice.discount / 100) * selectedInvoice.tax) / 100)}</Text>
                  </Box>
                )}
                
                <Divider />
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" mb={1}>Total Amount</Text>
                    <Text fontSize="lg">{formatCurrency(selectedInvoice.total)}</Text>
                  </Box>
                  
                  {selectedInvoice.paymentStatus !== 'Unpaid' && (
                    <Box>
                      <Text fontWeight="bold" mb={1}>Amount Paid</Text>
                      <Text color="green.500">{formatCurrency(selectedInvoice.amountPaid)}</Text>
                    </Box>
                  )}
                  
                  {selectedInvoice.paymentStatus === 'Partial' && (
                    <Box>
                      <Text fontWeight="bold" mb={1}>Balance Due</Text>
                      <Text color="red.500">{formatCurrency(selectedInvoice.total - selectedInvoice.amountPaid)}</Text>
                    </Box>
                  )}
                </SimpleGrid>
                
                {selectedInvoice.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" mb={1}>Notes</Text>
                      <Text>{selectedInvoice.notes}</Text>
                    </Box>
                  </>
                )}
                
                {selectedInvoice.paymentHistory && selectedInvoice.paymentHistory.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Text fontWeight="bold" mb={3}>Payment History</Text>
                      <TableContainer>
                        <Table size="sm" variant="simple">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th>Date</Th>
                              <Th>Amount</Th>
                              <Th>Mode</Th>
                              <Th>Status</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {selectedInvoice.paymentHistory.map((payment, index) => (
                              <Tr key={index}>
                                <Td>{formatDate(payment.date)}</Td>
                                <Td>{formatCurrency(payment.amount)}</Td>
                                <Td>{payment.mode || 'N/A'}</Td>
                                <Td>
                                  <Badge colorScheme={
                                    payment.status === 'Paid' ? 'green' : 
                                    payment.status === 'Partial' ? 'yellow' : 'red'
                                  }>
                                    {payment.status}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onCloseViewModal}>Close</Button>
            <Button 
              leftIcon={<FiPrinter />}
              colorScheme="brand" 
              onClick={() => {
                toast({
                  title: 'Invoice Print',
                  description: 'Print feature will be implemented soon.',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              Print Invoice
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Invoice Edit Modal - For updating payment status */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Payment Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInvoice && (
              <Box as="form" id="edit-invoice-form" onSubmit={handlePaymentUpdate}>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={paymentFormErrors.paymentStatus}>
                    <FormLabel>Payment Status</FormLabel>
                    <Select 
                      name="paymentStatus"
                      defaultValue={selectedInvoice.paymentStatus}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial Payment</option>
                      <option value="Paid">Paid</option>
                    </Select>
                    {paymentFormErrors.paymentStatus && <FormErrorMessage>{paymentFormErrors.paymentStatus}</FormErrorMessage>}
                  </FormControl>
                  
                  <FormControl isInvalid={paymentFormErrors.paymentMode}>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select 
                      name="paymentMode"
                      defaultValue={selectedInvoice.paymentMode || ''}
                    >
                      <option value="">Select payment mode</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Other">Other</option>
                    </Select>
                    {paymentFormErrors.paymentMode && <FormErrorMessage>{paymentFormErrors.paymentMode}</FormErrorMessage>}
                  </FormControl>
                  
                  <FormControl isInvalid={paymentFormErrors.transactionId}>
                    <FormLabel>Transaction ID (Optional)</FormLabel>
                    <Input 
                      name="transactionId"
                      defaultValue={selectedInvoice.transactionId || ''}
                      placeholder="Enter reference number"
                    />
                    {paymentFormErrors.transactionId && <FormErrorMessage>{paymentFormErrors.transactionId}</FormErrorMessage>}
                  </FormControl>
                  
                  <FormControl isInvalid={paymentFormErrors.amountPaid}>
                    <FormLabel>Amount Paid</FormLabel>
                    <Input 
                      name="amountPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedInvoice.total}
                      defaultValue={selectedInvoice.amountPaid || 0}
                    />
                    {paymentFormErrors.amountPaid && <FormErrorMessage>{paymentFormErrors.amountPaid}</FormErrorMessage>}
                    <Text fontSize="sm" color="gray.500">
                      Total Invoice Amount: {formatCurrency(selectedInvoice.total)}
                    </Text>
                  </FormControl>
                  
                  <Box pt={2}>
                    <Text fontWeight="bold">Balance after payment:</Text>
                    <Text>{formatCurrency(selectedInvoice.total - (selectedInvoice.amountPaid || 0))}</Text>
                  </Box>
                </VStack>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onCloseEditModal}>
              Cancel
            </Button>
            <Button 
              colorScheme="brand" 
              type="submit"
              form="edit-invoice-form"
              isLoading={isLoading}
            >
              Update Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PatientView;
