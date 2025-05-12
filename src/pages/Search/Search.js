import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  HStack,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FiSearch,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiEye,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Search = () => {
  const { patients, doctors } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [filterDoctor, setFilterDoctor] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Filter patients
  const filteredPatients = searchTerm.trim() === ''
    ? patients
    : patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mobileNumber?.includes(searchTerm) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  // Get all treatments from all patients
  const allTreatments = patients.reduce((acc, patient) => {
    if (patient.treatments && patient.treatments.length > 0) {
      const patientTreatments = patient.treatments.map(treatment => ({
        ...treatment,
        patientId: patient.id,
        patientName: patient.name,
      }));
      return [...acc, ...patientTreatments];
    }
    return acc;
  }, []);
  
  // Filter treatments
  const filteredTreatments = allTreatments.filter(treatment => {
    const matchesSearch = searchTerm.trim() === '' || 
      treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.observations.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.medications.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDoctor = filterDoctor === 'all' || treatment.doctor === filterDoctor;
    
    // Date filtering would be more sophisticated in a real app
    return matchesSearch && matchesDoctor;
  });
  
  // Get all invoices from all patients
  const allInvoices = patients.reduce((acc, patient) => {
    if (patient.invoices && patient.invoices.length > 0) {
      const patientInvoices = patient.invoices.map(invoice => ({
        ...invoice,
        patientId: patient.id,
        patientName: patient.name,
      }));
      return [...acc, ...patientInvoices];
    }
    return acc;
  }, []);
  
  // Filter invoices
  const filteredInvoices = allInvoices.filter(invoice => {
    return searchTerm.trim() === '' || 
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <Box>
      <Heading size="lg" mb="6">Search</Heading>
      
      <Card mb="6">
        <CardBody>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search patients, treatments, or invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>
      
      <Tabs 
        isLazy 
        colorScheme="brand" 
        index={activeTab} 
        onChange={(index) => setActiveTab(index)}
      >
        <TabList mb="1em">
          <Tab>
            <Icon as={FiUser} mr="2" />
            Patients
          </Tab>
          <Tab>
            <Icon as={FiFileText} mr="2" />
            Treatments
          </Tab>
          <Tab>
            <Icon as={FiDollarSign} mr="2" />
            Invoices
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Patients Tab */}
          <TabPanel p="0">
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Patient Results</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Patient ID</Th>
                        <Th>Name</Th>
                        <Th display={{ base: 'none', md: 'table-cell' }}>Age/Sex</Th>
                        <Th display={{ base: 'none', lg: 'table-cell' }}>Mobile</Th>
                        <Th display={{ base: 'none', xl: 'table-cell' }}>Registered On</Th>
                        <Th width="80px">View</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <Tr key={patient.id} _hover={{ bg: 'gray.50' }}>
                            <Td fontFamily="mono">{patient.id}</Td>
                            <Td fontWeight="medium">
                              <Text as={RouterLink} to={`/patient/${patient.id}`} color="brand.600">
                                {patient.name}
                              </Text>
                            </Td>
                            <Td display={{ base: 'none', md: 'table-cell' }}>
                              {patient.age}/{patient.sex.charAt(0)}
                            </Td>
                            <Td display={{ base: 'none', lg: 'table-cell' }}>{patient.mobileNumber}</Td>
                            <Td display={{ base: 'none', xl: 'table-cell' }}>
                              {formatDate(patient.createdAt)}
                            </Td>
                            <Td>
                              <IconButton
                                as={RouterLink}
                                to={`/patient/${patient.id}`}
                                icon={<FiEye />}
                                aria-label="View patient"
                                size="sm"
                                colorScheme="brand"
                                variant="ghost"
                              />
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan="6" textAlign="center" py="4">
                            {searchTerm.trim() !== '' ? 'No matching patients found.' : 'No patients in the system.'}
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Treatments Tab */}
          <TabPanel p="0">
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Flex 
                  direction={{ base: 'column', md: 'row' }}
                  justify="space-between" 
                  align={{ base: 'stretch', md: 'center' }}
                  gap={{ base: 2, md: 0 }}
                >
                  <Heading size="md">Treatment Results</Heading>
                  
                  <HStack spacing="3">
                    <Select 
                      maxW={{ base: 'full', md: '200px' }}
                      value={filterDoctor}
                      onChange={(e) => setFilterDoctor(e.target.value)}
                    >
                      <option value="all">All Doctors</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </Select>
                    
                    <Select 
                      maxW={{ base: 'full', md: '150px' }}
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </Select>
                  </HStack>
                </Flex>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Date</Th>
                        <Th>Patient</Th>
                        <Th display={{ base: 'none', md: 'table-cell' }}>Doctor</Th>
                        <Th>Observations</Th>
                        <Th width="80px">View</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredTreatments.length > 0 ? (
                        filteredTreatments.map((treatment) => (
                          <Tr key={treatment.id} _hover={{ bg: 'gray.50' }}>
                            <Td>{formatDate(treatment.date)}</Td>
                            <Td fontWeight="medium">
                              <Text as={RouterLink} to={`/patient/${treatment.patientId}`} color="brand.600">
                                {treatment.patientName}
                              </Text>
                            </Td>
                            <Td display={{ base: 'none', md: 'table-cell' }}>{treatment.doctor}</Td>
                            <Td>
                              <Text noOfLines={1}>{treatment.observations}</Text>
                            </Td>
                            <Td>
                              <IconButton
                                as={RouterLink}
                                to={`/patient/${treatment.patientId}`}
                                icon={<FiEye />}
                                aria-label="View patient"
                                size="sm"
                                colorScheme="brand"
                                variant="ghost"
                              />
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan="5" textAlign="center" py="4">
                            {searchTerm.trim() !== '' || filterDoctor !== 'all' ? 
                              'No matching treatments found.' : 
                              'No treatments in the system.'}
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Invoices Tab */}
          <TabPanel p="0">
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Invoice Results</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Invoice ID</Th>
                        <Th>Patient</Th>
                        <Th>Date</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Status</Th>
                        <Th width="80px">View</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice) => (
                          <Tr key={invoice.id} _hover={{ bg: 'gray.50' }}>
                            <Td fontFamily="mono">{invoice.id}</Td>
                            <Td fontWeight="medium">
                              <Text as={RouterLink} to={`/patient/${invoice.patientId}`} color="brand.600">
                                {invoice.patientName}
                              </Text>
                            </Td>
                            <Td>{formatDate(invoice.date)}</Td>
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
                              <IconButton
                                as={RouterLink}
                                to={`/patient/${invoice.patientId}`}
                                icon={<FiEye />}
                                aria-label="View patient"
                                size="sm"
                                colorScheme="brand"
                                variant="ghost"
                              />
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan="6" textAlign="center" py="4">
                            {searchTerm.trim() !== '' ? 'No matching invoices found.' : 'No invoices in the system.'}
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Search;
