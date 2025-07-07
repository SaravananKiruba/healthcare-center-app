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
import { UserService } from '../../lib/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { AUTH_CONFIG } from '../../config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { hasRole } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: AUTH_CONFIG.roles.DOCTOR,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UserService.getAllUsers();
      setUsers(data);
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
    if (hasRole(AUTH_CONFIG.roles.ADMIN)) {
      fetchUsers();
    }
  }, [hasRole, fetchUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedUser) {
        // Update user
        await UserService.updateUser(selectedUser.id, formData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new user
        await UserService.createUser(formData);
        toast({
          title: 'Success',
          description: 'User created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      fetchUsers();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
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
      fullName: user.fullName,
      password: '',
      role: user.role,
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      fullName: '',
      password: '',
      role: AUTH_CONFIG.roles.DOCTOR,
    });
    onClose();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case AUTH_CONFIG.roles.ADMIN: return 'red';
      case AUTH_CONFIG.roles.DOCTOR: return 'green';
      default: return 'gray';
    }
  };

  if (!hasRole(AUTH_CONFIG.roles.ADMIN)) {
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
                    <Td>{user.fullName}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={getRoleBadgeColor(user.role)} size="sm">
                        {user.role.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.isActive ? 'green' : 'red'} size="sm">
                        {user.isActive ? 'Active' : 'Inactive'}
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
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                    <option value={AUTH_CONFIG.roles.DOCTOR}>Doctor</option>
                    <option value={AUTH_CONFIG.roles.ADMIN}>Admin</option>
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
