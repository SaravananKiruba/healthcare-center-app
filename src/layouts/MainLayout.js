import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  VStack,
  HStack,
  Heading,
  useDisclosure,
  CloseButton,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Image,
  Tooltip,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiSearch,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiBarChart2,
  FiPlusCircle,
} from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

// Logo component
const Logo = () => {
  return (
    <Box p="4">
      <Heading size="md" color="brand.500">
        HealthCare Center
      </Heading>
    </Box>
  );
};

// Navigation items
const NavItems = [
  { name: 'Dashboard', icon: FiHome, path: '/' },
  { name: 'Patient Registration', icon: FiPlusCircle, path: '/patient/register' },
  { name: 'Patients', icon: FiUsers, path: '/patients' },
  { name: 'Billing', icon: FiDollarSign, path: '/billing' },
  { name: 'Reports', icon: FiBarChart2, path: '/reports' },
  { name: 'Search', icon: FiSearch, path: '/search' },
  { name: 'Settings', icon: FiSettings, path: '/settings' },
];

// NavItem component
const NavItem = ({ icon, children, path, active }) => {
  return (
    <Flex
      align="center"
      px="4"
      py="3"
      cursor="pointer"
      userSelect="none"
      role="group"
      fontWeight={active ? 'bold' : 'normal'}
      transition=".3s ease"
      bg={active ? 'brand.50' : 'transparent'}
      color={active ? 'brand.500' : undefined}
      borderLeft={active ? '3px solid' : '3px solid transparent'}
      borderColor={active ? 'brand.500' : 'transparent'}
      _hover={{
        bg: 'brand.50',
        color: 'brand.500',
      }}
      as={RouterLink}
      to={path}
    >
      <Box mr="3">
        {React.createElement(icon, { size: 18 })}
      </Box>
      {children}
    </Flex>
  );
};

// Sidebar component
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { currentUser, changeUserRole } = useAppContext();
  
  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
    >
      <Flex h="20" alignItems="center" justifyContent="space-between" mx="8">
        <Logo />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      
      <VStack align="stretch" spacing={0}>
        {NavItems.map((item) => (
          <NavItem
            key={item.name}
            icon={item.icon}
            path={item.path}
            active={location.pathname === item.path}
          >
            {item.name}
          </NavItem>
        ))}
      </VStack>
      
      <Box mt="10" px="4">
        <Text fontSize="sm" fontWeight="semibold" mb="2">
          Current Role
        </Text>
        <Menu>
          <MenuButton
            w="full"
            as={Box}
            py="2"
            px="3"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            cursor="pointer"
          >
            <HStack spacing="3">              <Badge colorScheme={
                currentUser?.role === 'admin' ? 'purple' : 
                currentUser?.role === 'doctor' ? 'green' : 'blue'
              }>
                {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'User'}
              </Badge>
              <Text flex="1" fontSize="sm">{currentUser?.name || 'User'}</Text>
              <FiChevronDown size={16} />
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => changeUserRole('admin')}>Admin</MenuItem>
            <MenuItem onClick={() => changeUserRole('doctor')}>Doctor</MenuItem>
            <MenuItem onClick={() => changeUserRole('clerk')}>Clerk</MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};

// Header component
const Header = ({ onOpen }) => {
  const { currentUser } = useAppContext();
  
  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      w="full"
      px="4"
      bg={useColorModeValue('white', 'gray.800')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      h="20"
    >
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />
      
      <Box display={{ base: 'flex', md: 'none' }}>
        <Logo />
      </Box>
      
      <HStack spacing="4">
        <Menu>
          <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: 'none' }}>
            <HStack>              <Avatar
                size="sm"
                name={currentUser?.name || 'User'}
                bg="brand.500"
              />
              <VStack
                display={{ base: 'none', md: 'flex' }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >                <Text fontSize="sm">{currentUser?.name || 'User'}</Text>
                <Text fontSize="xs" color="gray.600">
                  {currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'Guest'}
                </Text>
              </VStack>
              <Box display={{ base: 'none', md: 'flex' }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            <MenuItem icon={<FiSettings />}>Settings</MenuItem>
            <MenuItem icon={<FiLogOut />}>Sign out</MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Flex>
  );
};

// Main Layout component
const MainLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <Box ml={{ base: 0, md: 60 }} transition=".3s ease">
        <Header onOpen={onOpen} />
        <Box as="main" p="4">
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
