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
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  HStack,
} from '@chakra-ui/react';
import {
  FiBarChart2,
  FiPieChart,
  FiUsers,
  FiDollarSign,
  FiCalendar,
  FiDownload,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Reports = () => {
  const { patients } = useAppContext();
  const [reportType, setReportType] = useState('patient');
  const [timeRange, setTimeRange] = useState('all');
  
  // Calculate patient statistics
  const totalPatients = patients.length;
  const malePatients = patients.filter(patient => patient.sex === 'Male').length;
  const femalePatients = patients.filter(patient => patient.sex === 'Female').length;
  const otherPatients = totalPatients - malePatients - femalePatients;
  
  // Collect all invoices
  const allInvoices = patients.reduce((acc, patient) => {
    if (patient.invoices && patient.invoices.length > 0) {
      return [...acc, ...patient.invoices];
    }
    return acc;
  }, []);
  
  // Calculate financial statistics
  const totalRevenue = allInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidRevenue = allInvoices
    .filter(invoice => invoice.paymentStatus === 'Paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const outstandingRevenue = totalRevenue - paidRevenue;
  
  // Collect all treatments
  const allTreatments = patients.reduce((acc, patient) => {
    if (patient.treatments && patient.treatments.length > 0) {
      return [...acc, ...patient.treatments];
    }
    return acc;
  }, []);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Render different report types
  const renderReport = () => {
    switch (reportType) {
      case 'patient':
        return (
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="6">
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Total Patients</StatLabel>
                    <StatNumber fontSize="2xl">{totalPatients}</StatNumber>
                  </Box>
                  <Box my="auto" color="brand.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Male Patients</StatLabel>
                    <StatNumber fontSize="2xl">{malePatients}</StatNumber>
                    <StatHelpText mb={0}>
                      {totalPatients ? Math.round((malePatients / totalPatients) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="blue.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Female Patients</StatLabel>
                    <StatNumber fontSize="2xl">{femalePatients}</StatNumber>
                    <StatHelpText mb={0}>
                      {totalPatients ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="pink.500">
                    <Icon as={FiUsers} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">New This Month</StatLabel>
                    <StatNumber fontSize="2xl">2</StatNumber>
                    <StatHelpText mb={0}>
                      Since {new Date().toLocaleString('default', { month: 'long' })} 1
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="green.500">
                    <Icon as={FiCalendar} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
            </SimpleGrid>
            
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Patient Demographics Report</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Parameter</Th>
                        <Th isNumeric>Count</Th>
                        <Th isNumeric>Percentage</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="medium">Total Patients</Td>
                        <Td isNumeric>{totalPatients}</Td>
                        <Td isNumeric>100%</Td>
                      </Tr>
                      <Tr>
                        <Td>Male</Td>
                        <Td isNumeric>{malePatients}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((malePatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Female</Td>
                        <Td isNumeric>{femalePatients}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((femalePatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Other</Td>
                        <Td isNumeric>{otherPatients}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((otherPatients / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 0-18</Td>
                        <Td isNumeric>{patients.filter(p => p.age < 18).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age < 18).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 19-40</Td>
                        <Td isNumeric>{patients.filter(p => p.age >= 18 && p.age <= 40).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age >= 18 && p.age <= 40).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 41-60</Td>
                        <Td isNumeric>{patients.filter(p => p.age > 40 && p.age <= 60).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age > 40 && p.age <= 60).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Age 60+</Td>
                        <Td isNumeric>{patients.filter(p => p.age > 60).length}</Td>
                        <Td isNumeric>
                          {totalPatients ? Math.round((patients.filter(p => p.age > 60).length / totalPatients) * 100) : 0}%
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
            
            <Box mt="6">
              <Text fontSize="sm" color="gray.600">
                * In a real application, this section would include interactive charts and graphs 
                showing patient demographics, age distribution, and more detailed analytics.
              </Text>
            </Box>
          </Box>
        );
      
      case 'financial':
        return (
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6" mb="6">
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Total Revenue</StatLabel>
                    <StatNumber fontSize="2xl">{formatCurrency(totalRevenue)}</StatNumber>
                  </Box>
                  <Box my="auto" color="purple.500">
                    <Icon as={FiDollarSign} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Collected</StatLabel>
                    <StatNumber fontSize="2xl">{formatCurrency(paidRevenue)}</StatNumber>
                    <StatHelpText mb={0}>
                      {totalRevenue ? Math.round((paidRevenue / totalRevenue) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="green.500">
                    <Icon as={FiDollarSign} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Outstanding</StatLabel>
                    <StatNumber fontSize="2xl">{formatCurrency(outstandingRevenue)}</StatNumber>
                    <StatHelpText mb={0}>
                      {totalRevenue ? Math.round((outstandingRevenue / totalRevenue) * 100) : 0}%
                    </StatHelpText>
                  </Box>
                  <Box my="auto" color="red.500">
                    <Icon as={FiDollarSign} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Total Invoices</StatLabel>
                    <StatNumber fontSize="2xl">{allInvoices.length}</StatNumber>
                  </Box>
                  <Box my="auto" color="blue.500">
                    <Icon as={FiBarChart2} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
            </SimpleGrid>
            
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Financial Summary Report</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Type</Th>
                        <Th>Count</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Percentage</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="medium">Total Invoices</Td>
                        <Td>{allInvoices.length}</Td>
                        <Td isNumeric>{formatCurrency(totalRevenue)}</Td>
                        <Td isNumeric>100%</Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Badge colorScheme="green">Paid</Badge>
                        </Td>
                        <Td>{allInvoices.filter(inv => inv.paymentStatus === 'Paid').length}</Td>
                        <Td isNumeric>{formatCurrency(paidRevenue)}</Td>
                        <Td isNumeric>
                          {totalRevenue ? Math.round((paidRevenue / totalRevenue) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Badge colorScheme="yellow">Partial</Badge>
                        </Td>
                        <Td>{allInvoices.filter(inv => inv.paymentStatus === 'Partial').length}</Td>
                        <Td isNumeric>{
                          formatCurrency(
                            allInvoices
                              .filter(inv => inv.paymentStatus === 'Partial')
                              .reduce((sum, inv) => sum + (inv.total - (inv.amountPaid || 0)), 0)
                          )
                        }</Td>
                        <Td isNumeric>
                          {totalRevenue ? 
                            Math.round((
                              allInvoices
                                .filter(inv => inv.paymentStatus === 'Partial')
                                .reduce((sum, inv) => sum + (inv.total - (inv.amountPaid || 0)), 0) / totalRevenue
                            ) * 100) : 0}%
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Badge colorScheme="red">Unpaid</Badge>
                        </Td>
                        <Td>{allInvoices.filter(inv => inv.paymentStatus === 'Unpaid').length}</Td>
                        <Td isNumeric>{
                          formatCurrency(
                            allInvoices
                              .filter(inv => inv.paymentStatus === 'Unpaid')
                              .reduce((sum, inv) => sum + inv.total, 0)
                          )
                        }</Td>
                        <Td isNumeric>
                          {totalRevenue ? 
                            Math.round((
                              allInvoices
                                .filter(inv => inv.paymentStatus === 'Unpaid')
                                .reduce((sum, inv) => sum + inv.total, 0) / totalRevenue
                            ) * 100) : 0}%
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
            
            <Box mt="6">
              <Text fontSize="sm" color="gray.600">
                * In a real application, this section would include interactive charts showing revenue trends, 
                payment mode distribution, and monthly/quarterly financial analytics.
              </Text>
            </Box>
          </Box>
        );
      
      case 'treatment':
        return (
          <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6" mb="6">
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Total Treatments</StatLabel>
                    <StatNumber fontSize="2xl">{allTreatments.length}</StatNumber>
                  </Box>
                  <Box my="auto" color="blue.500">
                    <Icon as={FiCalendar} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Treatments This Month</StatLabel>
                    <StatNumber fontSize="2xl">1</StatNumber>
                  </Box>
                  <Box my="auto" color="green.500">
                    <Icon as={FiCalendar} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
              
              <Stat
                px="6"
                py="4"
                shadow="md"
                border="1px solid"
                borderColor="gray.200"
                rounded="lg"
                bg="white"
              >
                <Flex justifyContent="space-between">
                  <Box>
                    <StatLabel fontWeight="medium">Avg. Treatments per Patient</StatLabel>
                    <StatNumber fontSize="2xl">
                      {totalPatients ? (allTreatments.length / totalPatients).toFixed(1) : 0}
                    </StatNumber>
                  </Box>
                  <Box my="auto" color="purple.500">
                    <Icon as={FiPieChart} w={8} h={8} />
                  </Box>
                </Flex>
              </Stat>
            </SimpleGrid>
            
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Treatment Summary</Heading>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Date</Th>
                        <Th>Patient</Th>
                        <Th>Doctor</Th>
                        <Th>Observations</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {allTreatments.length > 0 ? (
                        allTreatments.map((treatment) => {
                          const patient = patients.find(p => 
                            p.treatments && p.treatments.some(t => t.id === treatment.id)
                          );
                          return (
                            <Tr key={treatment.id}>
                              <Td>{formatDate(treatment.date)}</Td>
                              <Td>{patient ? patient.name : 'Unknown'}</Td>
                              <Td>{treatment.doctor}</Td>
                              <Td>{treatment.observations}</Td>
                            </Tr>
                          );
                        })
                      ) : (
                        <Tr>
                          <Td colSpan="4" textAlign="center" py="4">
                            No treatments recorded yet.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
            
            <Box mt="6">
              <Text fontSize="sm" color="gray.600">
                * In a real application, this section would include charts showing treatment trends, 
                doctor-wise statistics, and common treatment patterns.
              </Text>
            </Box>
          </Box>
        );
      
      default:
        return <Text>Select a report type to view analytics</Text>;
    }
  };
  
  return (
    <Box>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'flex-start', md: 'center' }}
        mb="6"
      >
        <Heading size="lg" mb={{ base: 4, md: 0 }}>Reports & Analytics</Heading>
        
        <HStack spacing="3">
          <Select 
            maxW="200px" 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="patient">Patient Demographics</option>
            <option value="financial">Financial Summary</option>
            <option value="treatment">Treatment Analytics</option>
          </Select>
          
          <Select 
            maxW="150px"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Select>
          
          <Button leftIcon={<FiDownload />} variant="outline">
            Export Report
          </Button>
        </HStack>
      </Flex>
      
      {renderReport()}
    </Box>
  );
};

export default Reports;
