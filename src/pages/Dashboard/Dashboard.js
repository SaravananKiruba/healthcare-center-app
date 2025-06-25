import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Text,
  Icon,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiDollarSign, 
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

// Stat card component
const StatCard = ({ title, stat, icon, helpText, accentColor }) => {
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py="5"
      shadow="md"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.500')}
      rounded="lg"
      bg="white"
    >
      <Flex justifyContent="space-between">
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="medium">
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText mb={0}>
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={useColorModeValue(accentColor, `${accentColor}.400`)}
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

const Dashboard = () => {
  const { patients } = useAppContext();
  
  // Get today's date
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  
  // Get first day of the current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayISO = firstDayOfMonth.toISOString().split('T')[0];
  
  // Filter patients for today
  const todaysPatients = patients.filter((patient) => {
    try {
      if (!patient.createdAt) return false;
      const patientDate = new Date(patient.createdAt).toISOString().split('T')[0];
      return patientDate === todayISO;
    } catch (error) {
      return false;
    }
  });
  
  // Filter patients for this month
  const thisMonthPatients = patients.filter((patient) => {
    try {
      if (!patient.createdAt) return false;
      const patientDate = new Date(patient.createdAt);
      return patientDate >= firstDayOfMonth && patientDate <= today;
    } catch (error) {
      return false;
    }
  });
  
  // Calculate today's payments
  const todaysPayments = patients.reduce((total, patient) => {
    const todaysInvoices = patient.invoices?.filter((invoice) => {
      try {
        if (!invoice.date) return false;
        const invoiceDate = new Date(invoice.date).toISOString().split('T')[0];
        return invoiceDate === todayISO;
      } catch (error) {
        return false;
      }
    }) || [];
    
    return total + todaysInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }, 0);
  
  // Calculate this month's payments
  const thisMonthPayments = patients.reduce((total, patient) => {
    const thisMonthInvoices = patient.invoices?.filter((invoice) => {
      try {
        if (!invoice.date) return false;
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= firstDayOfMonth && invoiceDate <= today;
      } catch (error) {
        return false;
      }
    }) || [];
    
    return total + thisMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }, 0);
  
  return (
    <Box>
      <Heading size="lg" mb="6">Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={{ base: 5, lg: 8 }}>
        <StatCard
          title="Total Patients Today"
          stat={todaysPatients.length}
          icon={FiUsers}
          accentColor="brand.500"
        />
        <StatCard
          title="Total Patients This Month"
          stat={thisMonthPatients.length}
          icon={FiUsers}
          accentColor="blue.500"
        />
        <StatCard
          title="Total Payments Today"
          stat={`₹${todaysPayments}`}
          icon={FiDollarSign}
          accentColor="green.500"
        />
        <StatCard
          title="Total Payments This Month"
          stat={`₹${thisMonthPayments}`}
          icon={FiDollarSign}
          accentColor="purple.500"
        />
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
