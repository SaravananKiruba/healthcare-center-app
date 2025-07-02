import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  useToast,
  Badge,
  IconButton,
  Text,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiUsers } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { hasRole } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'doctor',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (hasRole('admin')) {
      fetchUsers();
    }
  }, [hasRole, fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedUser) {
        // Update user (if implemented in backend)
        toast({
          title: 'Info',
          description: 'User update functionality coming soon',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new user
        await authAPI.createUser(formData);
        toast({
          title: 'Success',
          description: 'User created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
        handleClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save user',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: '',
      role: user.role,
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      full_name: '',
      password: '',
      role: 'doctor',
    });
    onClose();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'red';
      case 'doctor': return 'green';
      default: return 'gray';
    }
  };

  if (!hasRole('admin')) {
    return (
      <Box p={6}>
        <Card>
          <CardBody>
            <Text color="red.500">Access Denied: Admin privileges required</Text>
          </CardBody>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <FiUsers size={24} />
              <Heading size="lg">User Management</Heading>
            </HStack>
            <Button leftIcon={<FiPlus />} colorScheme="brand" onClick={onOpen}>
              Add New User
            </Button>
          </HStack>
        </CardHeader>

        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.full_name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={getRoleBadgeColor(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.is_active ? 'green' : 'red'} size="sm">
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <IconButton
                          icon={<FiEdit />}
                          size="sm"
                          onClick={() => handleEdit(user)}
                          aria-label="Edit user"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              {selectedUser ? 'Edit User' : 'Add New User'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    isDisabled={selectedUser} // Don't allow email change for existing users
                  />
                </FormControl>

                <FormControl isRequired={!selectedUser}>
                  <FormLabel>Password {selectedUser && '(leave blank to keep current)'}</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={loading}
                loadingText="Saving..."
              >
                {selectedUser ? 'Update' : 'Create'} User
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement;
