import React from 'react';
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
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiDollarSign,
  FiSearch,
  FiSettings,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiBarChart2,
  FiPlusCircle,
}from 'react-icons/fi';
import { useAuth } from '../context/AuthContext-nextjs';

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

// Navigation items with role-based access
const getNavItems = (userRole) => {
  const baseItems = [
    { name: 'Dashboard', icon: FiHome, path: '/', roles: ['admin', 'doctor'] },
    { name: 'Search', icon: FiSearch, path: '/search', roles: ['admin', 'doctor'] },
  ];

  const roleBasedItems = [
    { name: 'Patient Registration', icon: FiPlusCircle, path: '/patient/register', roles: ['admin', 'doctor'] },
    { name: 'Patients', icon: FiUsers, path: '/patients', roles: ['admin', 'doctor'] },
    { name: 'Reports', icon: FiBarChart2, path: '/reports', roles: ['admin', 'doctor'] },
    { name: 'User Management', icon: FiSettings, path: '/user-management', roles: ['admin'] },
  ];

  return [
    ...baseItems,
    ...roleBasedItems.filter(item => item.roles.includes(userRole))
  ];
};

// NavItem component
const NavItem = ({ icon, children, path, active }) => {
  return (
    <Link href={path} passHref>
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
      >
        <Box mr="3">
          {React.createElement(icon, { size: 18 })}
        </Box>
        {children}
      </Flex>
    </Link>
  );
};

// Sidebar component
const Sidebar = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { user } = useAuth();
  const navItems = getNavItems(user?.role || 'doctor');
  
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
        {navItems.map((item) => (
          <NavItem
            key={item.name}
            icon={item.icon}
            path={item.path}
            active={router.pathname === item.path}
          >
            {item.name}
          </NavItem>
        ))}
      </VStack>
      
      <Box mt="10" px="4">
        <Text fontSize="sm" fontWeight="semibold" mb="2">
          Current User
        </Text>        <VStack align="start" spacing={1}>
          <Text fontSize="sm" color="gray.600">
            {user?.full_name}
          </Text>
          <Badge colorScheme="brand" size="sm">
            {user?.role?.toUpperCase()}
          </Badge>
        </VStack>
      </Box>
    </Box>
  );
};

// Header component
const Header = ({ onOpen }) => {
  const { user, logout } = useAuth();
  
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
            <HStack>
              <Avatar
                size="sm"
                name={user?.full_name || 'User'}
                bg="brand.500"
              />
              <VStack
                display={{ base: 'none', md: 'flex' }}
                alignItems="flex-start"
                spacing="1px"
                ml="2"
              >
                <Text fontSize="sm">{user?.full_name || 'User'}</Text>
                <Text fontSize="xs" color="gray.600">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest'}
                </Text>
              </VStack>
              <Box display={{ base: 'none', md: 'flex' }}>
                <FiChevronDown />
              </Box>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiUser />}>Profile</MenuItem>
            {user?.role === 'admin' && (
              <Link href="/user-management" passHref>
                <MenuItem icon={<FiSettings />}>User Management</MenuItem>
              </Link>
            )}
            <MenuItem icon={<FiLogOut />} onClick={logout}>Sign out</MenuItem>
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
