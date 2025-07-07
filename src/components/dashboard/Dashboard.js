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
  Card,
  CardBody,
} from '@chakra-ui/react';
import { 
  FiUsers,
  FiActivity,
  FiCalendar,
  FiFileText,
} from 'react-icons/fi';

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
          color={accentColor || 'gray.500'}
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

// Admin Dashboard Component
const AdminDashboard = ({ stats }) => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Admin Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="Total Users"
          stat={stats.userCount || 0}
          icon={FiUsers}
          accentColor="blue.500"
        />
        <StatCard
          title="Total Patients"
          stat={stats.patientCount || 0}
          icon={FiUsers}
          accentColor="green.500"
        />
        <StatCard
          title="Investigations"
          stat={stats.investigationCount || 0}
          icon={FiFileText}
          accentColor="purple.500"
        />
        <StatCard
          title="Recent Activity"
          stat={stats.recentActivity || 0}
          icon={FiActivity}
          helpText="Last 30 days"
          accentColor="orange.500"
        />
      </SimpleGrid>
      
      <Card mt={8}>
        <CardBody>
          <Heading size="md" mb={4}>System Status</Heading>
          <Text>Database: Connected</Text>
          <Text>Storage: 2.3GB / 10GB (23%)</Text>
          <Text>Last Backup: 2 days ago</Text>
        </CardBody>
      </Card>
    </Box>
  );
};

// Doctor Dashboard Component
const DoctorDashboard = ({ stats }) => {
  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>Doctor Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <StatCard
          title="My Patients"
          stat={stats.myPatientCount || 0}
          icon={FiUsers}
          accentColor="green.500"
        />
        <StatCard
          title="Recent Cases"
          stat={stats.recentCases || 0}
          icon={FiCalendar}
          helpText="Last 30 days"
          accentColor="blue.500"
        />
        <StatCard
          title="Pending Reports"
          stat={stats.pendingReports || 0}
          icon={FiFileText}
          accentColor="red.500"
        />
        <StatCard
          title="Total Investigations"
          stat={stats.investigationCount || 0}
          icon={FiActivity}
          accentColor="purple.500"
        />
      </SimpleGrid>
    </Box>
  );
};

export { AdminDashboard, DoctorDashboard };
