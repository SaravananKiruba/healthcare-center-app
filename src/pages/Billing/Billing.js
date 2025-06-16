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
  Select,  HStack,
  Grid,
  GridItem,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiSearch, FiPlus, FiFilter, FiDownload, FiEye, FiDollarSign } from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Billing = () => {
  const toast = useToast();
  const { patients } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Collect all invoices from all patients
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
    // Filter by search query
    const matchesSearch = 
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());    // Filter by payment status
    const matchesStatus = 
      statusFilter === 'all' || 
      invoice.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
    
    // Filter by date (simplified for this demo)
    try {
      if (!invoice.date) return matchesSearch && matchesStatus;
      
      const invoiceDate = new Date(invoice.date);
      if (isNaN(invoiceDate.getTime())) return matchesSearch && matchesStatus;
      
      const today = new Date();
      const isToday = 
        invoiceDate.getDate() === today.getDate() &&
        invoiceDate.getMonth() === today.getMonth() &&
        invoiceDate.getFullYear() === today.getFullYear();
      
      const isThisWeek = () => {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return invoiceDate >= startOfWeek;
      };
      
      const isThisMonth = 
        invoiceDate.getMonth() === today.getMonth() &&
        invoiceDate.getFullYear() === today.getFullYear();
      
      const matchesDate = 
        dateFilter === 'all' ||
        (dateFilter === 'today' && isToday) ||
        (dateFilter === 'week' && isThisWeek()) ||
        (dateFilter === 'month' && isThisMonth);
      
      return matchesSearch && matchesStatus && matchesDate;
    } catch (error) {
      return matchesSearch && matchesStatus;
    }
  });
    // Format date for display
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original string if invalid
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      return dateString || "N/A";
    }
  };
  
  // Calculate total amounts
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.paymentStatus === 'Paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const unpaidAmount = filteredInvoices
    .filter(invoice => invoice.paymentStatus === 'Unpaid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const partialAmount = filteredInvoices
    .filter(invoice => invoice.paymentStatus === 'Partial')
    .reduce((sum, invoice) => sum + (invoice.total - (invoice.amountPaid || 0)), 0);
  
  // Handle mock invoice download
  const handleDownloadInvoice = (invoiceId) => {
    toast({
      title: 'Invoice Downloaded',
      description: `Invoice ${invoiceId} has been downloaded.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', md: 'center' }}
        mb="6"
      >
        <Heading size="lg" mb={{ base: 4, md: 0 }}>Billing & Invoices</Heading>
      </Flex>
      
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(4, 1fr)" }} gap={6} mb="6">
        <GridItem colSpan={1}>
          <Card bg="white">
            <CardBody textAlign="center">
              <Text fontSize="sm" color="gray.500" mb="1">Total Invoices</Text>
              <Text fontSize="2xl" fontWeight="bold">{filteredInvoices.length}</Text>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem colSpan={1}>
          <Card bg="green.50">
            <CardBody textAlign="center">
              <Text fontSize="sm" color="green.600" mb="1">Paid Amount</Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">${paidAmount}</Text>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem colSpan={1}>
          <Card bg="red.50">
            <CardBody textAlign="center">
              <Text fontSize="sm" color="red.600" mb="1">Unpaid Amount</Text>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">${unpaidAmount + partialAmount}</Text>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem colSpan={1}>
          <Card bg="purple.50">
            <CardBody textAlign="center">
              <Text fontSize="sm" color="purple.600" mb="1">Total Amount</Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">${totalAmount}</Text>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      <Card mb="6">
        <CardHeader bg="brand.50" py="3">
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between" 
            align={{ base: 'stretch', md: 'center' }}
            gap={3}
          >
            <Heading size="md">Invoice Records</Heading>
            
            <HStack spacing="3">
              <InputGroup maxW={{ base: 'full', md: '200px' }}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search invoices" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                maxW={{ base: 'full', md: '150px' }}
                icon={<FiFilter />}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
              </Select>
              
              <Select 
                maxW={{ base: 'full', md: '150px' }}
                icon={<FiFilter />}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Select>
              
              <Button
                leftIcon={<FiPlus />}
                colorScheme="brand"
                as={RouterLink}
                to="/patients"
              >
                New Invoice
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody p="0">
          <TableContainer>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Invoice ID</Th>
                  <Th>Patient</Th>
                  <Th display={{ base: 'none', md: 'table-cell' }}>Date</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Status</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Payment Mode</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <Tr key={invoice.id} _hover={{ bg: 'gray.50' }}>
                      <Td fontFamily="mono">{invoice.id}</Td>
                      <Td>
                        <Text 
                          as={RouterLink} 
                          to={`/patient/${invoice.patientId}`}
                          color="brand.600"
                          fontWeight="medium"
                        >
                          {invoice.patientName}
                        </Text>
                      </Td>
                      <Td display={{ base: 'none', md: 'table-cell' }}>{formatDate(invoice.date)}</Td>
                      <Td isNumeric fontWeight="medium">${invoice.total}</Td>
                      <Td>
                        <Badge colorScheme={
                          invoice.paymentStatus === 'Paid' ? 'green' : 
                          invoice.paymentStatus === 'Partial' ? 'yellow' : 'red'
                        }>
                          {invoice.paymentStatus}
                        </Badge>
                      </Td>
                      <Td display={{ base: 'none', lg: 'table-cell' }}>{invoice.paymentMode || 'N/A'}</Td>
                      <Td>
                        <HStack spacing="2">
                          <IconButton
                            aria-label="View invoice"
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                          />
                          <IconButton
                            aria-label="Download invoice"
                            icon={<FiDownload />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          />
                          {invoice.paymentStatus !== 'Paid' && (
                            <IconButton
                              aria-label="Record payment"
                              icon={<FiDollarSign />}
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="7" textAlign="center" py="4">
                      {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                        ? 'No invoices matching your filters.' 
                        : 'No invoices have been created yet.'}
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Billing;
