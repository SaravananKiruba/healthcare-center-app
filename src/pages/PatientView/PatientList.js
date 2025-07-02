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
  Th,  Td,
  TableContainer,
  Text,
  HStack,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
  FiFileText,
  FiDollarSign,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const PatientList = () => {
  const toast = useToast();
  const { patients, deletePatient, currentUser } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [patientToDelete, setPatientToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  // Filter patients based on search query
  const filteredPatients = searchQuery.trim() === ''
    ? patients
    : patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mobileNumber?.includes(searchQuery) ||
        patient.id?.includes(searchQuery)
      );
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      // If it's already a proper Date object
      if (dateString instanceof Date) {
        if (!isNaN(dateString.getTime())) {
          return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(dateString);
        }
        return 'N/A';
      }

      // If it's a string that looks like an ISO date
      if (typeof dateString === 'string') {
        // Try to create a valid date
        const date = new Date(dateString);
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(date);
        }
        
        // If it's not a valid ISO date, maybe it's a timestamp in string format
        if (!isNaN(Number(dateString))) {
          const timestamp = Number(dateString);
          const timestampDate = new Date(timestamp);
          if (!isNaN(timestampDate.getTime())) {
            return new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(timestampDate);
          }
        }
      }
      
      // If it's a number (timestamp)
      if (typeof dateString === 'number') {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }).format(date);
        }
      }
      
      console.warn('Invalid date format:', dateString);
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error, 'Value:', dateString);
      return 'N/A';
    }
  };

  // Handle patient deletion
  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (patientToDelete) {
      deletePatient(patientToDelete.id);
      toast({
        title: 'Patient deleted',
        description: `${patientToDelete.name} has been removed from records.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setPatientToDelete(null);
    }
    onClose();
  };

  // Check if user has permission to delete
  const canDelete = currentUser.role === 'admin';

  return (
    <Box>
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        justify="space-between" 
        align={{ base: 'stretch', md: 'center' }}
        mb="6"
      >
        <Heading size="lg" mb={{ base: 4, md: 0 }}>Patient Records</Heading>
        
        <HStack spacing="4">
          <InputGroup maxW={{ base: 'full', md: '300px' }}>
            <InputLeftElement pointerEvents='none'>
              <FiSearch color='gray.300' />
            </InputLeftElement>
            <Input 
              placeholder='Search patients' 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </InputGroup>
          
          <Button
            as={RouterLink}
            to="/patient/register"
            colorScheme="brand"
            leftIcon={<FiPlus />}
            size={{ base: 'sm', md: 'md' }}
          >
            New Patient
          </Button>
        </HStack>
      </Flex>
      
      <Card>
        <CardHeader bg="brand.50" py="3">
          <Heading size="md">Patient List</Heading>
        </CardHeader>
        <CardBody p="0">
          <TableContainer>
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Patient ID</Th>
                  <Th>Name</Th>
                  <Th display={{ base: 'none', md: 'table-cell' }}>Age/Sex</Th>
                  <Th display={{ base: 'none', lg: 'table-cell' }}>Mobile</Th>
                  <Th display={{ base: 'none', xl: 'table-cell' }}>Registered On</Th>
                  <Th isNumeric>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <Tr key={patient.id} _hover={{ bg: 'gray.50' }}>
                      <Td fontFamily="mono">{patient.id}</Td>
                      <Td fontWeight="medium">                        <Text as={RouterLink} to={`/patient/${patient.id}`} color="brand.600">
                          {patient.name || 'Unnamed Patient'}
                        </Text>
                      </Td>                      <Td display={{ base: 'none', md: 'table-cell' }}>
                        {patient.age || '?'}/{patient.sex?.charAt(0) || '?'}
                      </Td>
                      <Td display={{ base: 'none', lg: 'table-cell' }}>{patient.mobileNumber || 'N/A'}</Td>                      <Td display={{ base: 'none', xl: 'table-cell' }}>
                        {formatDate(patient.createdAt || patient.created_at || '')}
                      </Td>
                      <Td isNumeric>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            aria-label="Actions"
                          />
                          <MenuList>
                            <MenuItem 
                              as={RouterLink} 
                              to={`/patient/${patient.id}`}
                              icon={<FiEye />}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem icon={<FiEdit />}>Edit Patient</MenuItem>

                            {canDelete && (
                              <MenuItem 
                                icon={<FiTrash2 />} 
                                color="red.500"
                                onClick={() => handleDeleteClick(patient)}
                              >
                                Delete Patient
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="6" textAlign="center" py="4">
                      {searchQuery.trim() !== '' ? 'No matching patients found.' : 'No patients in the system.'}
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Patient
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{patientToDelete?.name}</strong>? 
              This action cannot be undone and will remove all their records.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PatientList;
