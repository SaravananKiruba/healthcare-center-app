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
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

// Import components for each tab
import MedicalHistoryTab from '../../components/MedicalHistory/MedicalHistoryTab';
import PhysicalGeneralsTab from '../../components/PhysicalGenerals/PhysicalGeneralsTab';
import MenstrualHistoryTab from '../../components/MenstrualHistory/MenstrualHistoryTab';
import FoodHabitsTab from '../../components/FoodHabits/FoodHabitsTab';
import InvestigationsTab from '../../components/Investigations/InvestigationsTab';
import TreatmentTab from '../../components/Treatment/TreatmentTab';
import BillingTab from '../../components/Billing/BillingTab';

const PatientView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { patients, doctors, deletePatient, currentUser } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
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
              onClick={onOpen}
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
      <Modal isOpen={isOpen} onClose={onClose}>
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
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeletePatient}>
              Delete Patient
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Placeholder components for tabs
// These would be moved to their own files in a complete implementation
const MedicalHistoryTab = ({ patient, canEdit }) => (
  <Card>
    <CardHeader bg="gray.50" py="3">
      <Flex justify="space-between" align="center">
        <Heading size="md">Medical History</Heading>
        {canEdit && (
          <Button size="sm" leftIcon={<FiEdit />} variant="ghost">
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
    </CardBody>
  </Card>
);

const PhysicalGeneralsTab = ({ patient, canEdit }) => (
  <Card>
    <CardHeader bg="gray.50" py="3">
      <Flex justify="space-between" align="center">
        <Heading size="md">Physical Generals</Heading>
        {canEdit && (
          <Button size="sm" leftIcon={<FiEdit />} variant="ghost">
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
    </CardBody>
  </Card>
);

const MenstrualHistoryTab = ({ patient, canEdit }) => (
  <Card>
    <CardHeader bg="gray.50" py="3">
      <Flex justify="space-between" align="center">
        <Heading size="md">Menstrual & Discharge History</Heading>
        {canEdit && (
          <Button size="sm" leftIcon={<FiEdit />} variant="ghost">
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
    </CardBody>
  </Card>
);

const FoodHabitsTab = ({ patient, canEdit }) => (
  <Card>
    <CardHeader bg="gray.50" py="3">
      <Flex justify="space-between" align="center">
        <Heading size="md">Food & Habit</Heading>
        {canEdit && (
          <Button size="sm" leftIcon={<FiEdit />} variant="ghost">
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
    </CardBody>
  </Card>
);

const InvestigationsTab = ({ patient, canEdit }) => (
  <Card>
    <CardHeader bg="gray.50" py="3">
      <Flex justify="space-between" align="center">
        <Heading size="md">Investigations</Heading>
        {canEdit && (
          <Button size="sm" leftIcon={<FiPlusCircle />} colorScheme="brand">
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
              <Th>File</Th>
            </Tr>
          </Thead>
          <Tbody>
            {patient.investigations && patient.investigations.length > 0 ? (
              patient.investigations.map(investigation => (
                <Tr key={investigation.id}>
                  <Td>{investigation.date}</Td>
                  <Td>{investigation.type}</Td>
                  <Td>{investigation.details}</Td>
                  <Td>
                    {investigation.fileUrl ? (
                      <Button size="sm" variant="link">
                        View File
                      </Button>
                    ) : (
                      <Text fontSize="sm" color="gray.500">No file</Text>
                    )}
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
    </CardBody>
  </Card>
);

const TreatmentTab = ({ patient, doctors, canEdit }) => (
  <Card>
    <CardHeader bg="gray.50" py="3">
      <Flex justify="space-between" align="center">
        <Heading size="md">Treatment Details</Heading>
        {canEdit && (
          <Button size="sm" leftIcon={<FiPlusCircle />} colorScheme="brand">
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
              <Th>Medications</Th>
            </Tr>
          </Thead>
          <Tbody>
            {patient.treatments && patient.treatments.length > 0 ? (
              patient.treatments.map(treatment => (
                <Tr key={treatment.id}>
                  <Td>{treatment.date}</Td>
                  <Td>{treatment.doctor}</Td>
                  <Td>{treatment.observations}</Td>
                  <Td>{treatment.medications}</Td>
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
    </CardBody>
  </Card>
);

const BillingTab = ({ patient }) => (
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
            {patient.invoices && patient.invoices.length > 0 ? (
              patient.invoices.map(invoice => (
                <Tr key={invoice.id}>
                  <Td fontFamily="mono">{invoice.id}</Td>
                  <Td>{invoice.date}</Td>
                  <Td isNumeric>${invoice.total}</Td>
                  <Td>
                    <Badge colorScheme={
                      invoice.paymentStatus === 'Paid' ? 'green' : 
                      invoice.paymentStatus === 'Partial' ? 'yellow' : 'red'
                    }>
                      {invoice.paymentStatus}
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
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
);

export default PatientView;
