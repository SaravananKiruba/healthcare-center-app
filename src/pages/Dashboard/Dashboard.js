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
  
  // No payment calculations needed
  
  return (
    <Box>
      <Heading size="lg" mb="6">Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 5, lg: 8 }}>
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
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
