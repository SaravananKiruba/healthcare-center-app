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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiUsers, 
  FiDollarSign, 
  FiCalendar, 
  FiClock,
  FiBell,
  FiActivity,
} from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
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
  
  // Get today's patients (using mock data)
  const today = new Date().toISOString().split('T')[0];
  const todaysPatients = patients.filter((patient) => {
    const patientDate = new Date(patient.createdAt).toISOString().split('T')[0];
    return patientDate === today;
  });
  
  // Mock data for dashboard
  const todaysPayments = patients.reduce((total, patient) => {
    const todaysInvoices = patient.invoices?.filter((invoice) => {
      const invoiceDate = new Date(invoice.date).toISOString().split('T')[0];
      return invoiceDate === today;
    }) || [];
    
    return total + todaysInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  }, 0);
  
  // Mock appointments
  const appointments = [
    { id: 'a1', patientName: 'John Doe', patientId: 'p1', time: '10:00 AM', doctor: 'Dr. Smith', status: 'confirmed' },
    { id: 'a2', patientName: 'Jane Smith', patientId: 'p2', time: '11:30 AM', doctor: 'Dr. Johnson', status: 'confirmed' },
    { id: 'a3', patientName: 'Michael Brown', patientId: 'p3', time: '02:00 PM', doctor: 'Dr. Davis', status: 'pending' },
  ];
  
  // Mock alerts
  const alerts = [
    { id: 'al1', type: 'payment', message: 'Jane Smith has an unpaid balance of $150', patientId: 'p2' },
    { id: 'al2', type: 'follow-up', message: 'Follow-up appointment required for John Doe', patientId: 'p1' },
    { id: 'al3', type: 'inventory', message: 'Low stock alert: Paracetamol (10 units remaining)' },
  ];
  
  return (
    <Box>
      <Heading size="lg" mb="6">Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }}>
        <StatCard
          title="Total Patients Today"
          stat={todaysPatients.length}
          icon={FiUsers}
          accentColor="brand.500"
        />
        <StatCard
          title="Payments Today"
          stat={`$${todaysPayments}`}
          icon={FiDollarSign}
          accentColor="green.500"
        />
        <StatCard
          title="Appointments Today"
          stat={appointments.length}
          icon={FiCalendar}
          accentColor="purple.500"
        />
        <StatCard
          title="Pending Follow-ups"
          stat="2"
          icon={FiClock}
          accentColor="orange.500"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, lg: 2 }} spacing="6" mt="8">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader bg="brand.50" py="3">
            <Flex align="center">
              <Icon as={FiCalendar} mr="2" color="brand.500" />
              <Heading size="md">Today's Appointments</Heading>
            </Flex>
          </CardHeader>
          <CardBody p="0">
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Patient</Th>
                    <Th>Time</Th>
                    <Th>Doctor</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appointments.map((appointment) => (
                    <Tr key={appointment.id}>
                      <Td>
                        <Text as={RouterLink} to={`/patient/${appointment.patientId}`} color="brand.600" fontWeight="medium">
                          {appointment.patientName}
                        </Text>
                      </Td>
                      <Td>{appointment.time}</Td>
                      <Td>{appointment.doctor}</Td>
                      <Td>
                        <Badge colorScheme={appointment.status === 'confirmed' ? 'green' : 'yellow'}>
                          {appointment.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader bg="brand.50" py="3">
            <Flex align="center">
              <Icon as={FiBell} mr="2" color="brand.500" />
              <Heading size="md">Alerts</Heading>
            </Flex>
          </CardHeader>
          <CardBody p="0">
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Type</Th>
                    <Th>Message</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {alerts.map((alert) => (
                    <Tr key={alert.id}>
                      <Td>
                        <Badge colorScheme={
                          alert.type === 'payment' ? 'red' : 
                          alert.type === 'follow-up' ? 'orange' : 'blue'
                        }>
                          {alert.type}
                        </Badge>
                      </Td>
                      <Td>
                        {alert.patientId ? (
                          <Text as={RouterLink} to={`/patient/${alert.patientId}`}>
                            {alert.message}
                          </Text>
                        ) : (
                          <Text>{alert.message}</Text>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Activity Graph - Would be implemented with a charting library in a real app */}
      <Card mt="8">
        <CardHeader bg="brand.50" py="3">
          <Flex align="center">
            <Icon as={FiActivity} mr="2" color="brand.500" />
            <Heading size="md">Activity Overview</Heading>
          </Flex>
        </CardHeader>
        <CardBody>
          <Text color="gray.500" fontSize="sm">
            In a real application, this section would show charts for patient visits, 
            revenue trends, and other important metrics using a library like Chart.js, 
            Recharts, or Nivo.
          </Text>
          <Flex
            h="200px"
            bg="gray.100"
            mt="4"
            borderRadius="md"
            justify="center"
            align="center"
          >
            <Text fontWeight="medium" color="gray.500">
              Activity Graph Placeholder
            </Text>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
