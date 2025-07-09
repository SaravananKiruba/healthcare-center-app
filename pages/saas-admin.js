import React, { useState } from 'react';
import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FiUsers, FiHospital, FiMapPin, FiSettings } from 'react-icons/fi';
import MainLayout from '@/components/layout/MainLayout';
import { UserManagement, ClinicManagement, BranchManagement, BrandingManagement } from '@/components/admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// SaaS Admin Dashboard
export default function AdminDashboard({ initialStats }) {
  const [stats] = useState(initialStats || {
    clinicsCount: 0,
    branchesCount: 0,
    usersCount: 0,
    patientsCount: 0,
  });
  
  const { user } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.700');
  
  // Determine which tabs to show based on user role
  const showClinicTab = user?.role === 'superadmin';
  const showBranchTab = user?.role === 'superadmin' || user?.role === 'clinicadmin';
  const showBrandingTab = user?.role === 'superadmin' || user?.role === 'clinicadmin';
  
  return (
    <MainLayout>
      <Box p={4}>
        <Heading size="lg" mb={6}>SaaS Administration Dashboard</Heading>
        
        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiHospital} boxSize={8} mr={4} color="blue.500" />
                <Box>
                  <StatLabel>Total Clinics</StatLabel>
                  <StatNumber>{stats.clinicsCount}</StatNumber>
                  <StatHelpText>Active clinics on the platform</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiMapPin} boxSize={8} mr={4} color="green.500" />
                <Box>
                  <StatLabel>Total Branches</StatLabel>
                  <StatNumber>{stats.branchesCount}</StatNumber>
                  <StatHelpText>Clinic branches</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiUsers} boxSize={8} mr={4} color="purple.500" />
                <Box>
                  <StatLabel>Total Users</StatLabel>
                  <StatNumber>{stats.usersCount}</StatNumber>
                  <StatHelpText>Platform users</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
          
          <Box bg={cardBg} p={5} shadow="md" borderRadius="lg">
            <Stat>
              <Flex align="center">
                <Icon as={FiSettings} boxSize={8} mr={4} color="orange.500" />
                <Box>
                  <StatLabel>Total Patients</StatLabel>
                  <StatNumber>{stats.patientsCount}</StatNumber>
                  <StatHelpText>Managed patients</StatHelpText>
                </Box>
              </Flex>
            </Stat>
          </Box>
        </SimpleGrid>
        
        <Tabs variant="enclosed" colorScheme="blue" isLazy>
          <TabList>
            {showClinicTab && <Tab>Clinics</Tab>}
            {showBranchTab && <Tab>Branches</Tab>}
            <Tab>Users</Tab>
            {showBrandingTab && <Tab>Branding</Tab>}
          </TabList>
          
          <TabPanels>
            {/* Clinic Management Tab - Superadmin only */}
            {showClinicTab && (
              <TabPanel>
                <ClinicManagement />
              </TabPanel>
            )}
            
            {/* Branch Management Tab - Superadmin & Clinic Admin */}
            {showBranchTab && (
              <TabPanel>
                <BranchManagement />
              </TabPanel>
            )}
            
            {/* User Management Tab - All Admin Roles */}
            <TabPanel>
              <UserManagement />
            </TabPanel>
            
            {/* Branding Management Tab - Superadmin & Clinic Admin */}
            {showBrandingTab && (
              <TabPanel>
                <BrandingManagement clinicId={user?.role === 'clinicadmin' ? user?.clinicId : null} />
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // Redirect if not logged in
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  // Redirect if not an admin role
  if (!['superadmin', 'clinicadmin', 'branchadmin'].includes(session.user.role)) {
    return {
      redirect: {
        destination: '/doctor-dashboard',
        permanent: false,
      },
    };
  }
  
  // Fetch dashboard stats based on role
  const prisma = new PrismaClient();
  let stats = {
    clinicsCount: 0,
    branchesCount: 0,
    usersCount: 0,
    patientsCount: 0,
  };
  
  try {
    switch (session.user.role) {
      case 'superadmin':
        // Superadmin sees all stats
        stats.clinicsCount = await prisma.clinic.count();
        stats.branchesCount = await prisma.branch.count();
        stats.usersCount = await prisma.user.count();
        stats.patientsCount = await prisma.patient.count();
        break;
        
      case 'clinicadmin':
        // Clinic admin sees stats for their clinic
        if (session.user.clinicId) {
          stats.branchesCount = await prisma.branch.count({
            where: { clinicId: session.user.clinicId }
          });
          stats.usersCount = await prisma.user.count({
            where: { clinicId: session.user.clinicId }
          });
          stats.patientsCount = await prisma.patient.count({
            where: { branch: { clinicId: session.user.clinicId } }
          });
        }
        break;
        
      case 'branchadmin':
        // Branch admin sees stats for their branch
        if (session.user.branchId) {
          stats.usersCount = await prisma.user.count({
            where: { branchId: session.user.branchId }
          });
          stats.patientsCount = await prisma.patient.count({
            where: { branchId: session.user.branchId }
          });
        }
        break;
    }
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  return {
    props: {
      initialStats: stats,
    },
  };
}
