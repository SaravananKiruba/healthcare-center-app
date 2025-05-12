import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  HStack,
  Select,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useToast,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiUser,
  FiUserPlus,
  FiSettings,
  FiDatabase,
  FiDownload,
  FiUpload,
  FiEdit,
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';

const Settings = () => {
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const { doctors, currentUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    centerName: 'Healthcare Center',
    address: '123 Medical Street, Healthville, HV 12345',
    contactNumber: '+1-555-123-4567',
    email: 'contact@healthcarecenter.com',
    taxId: 'TAX12345678',
    currency: 'USD',
    enableDarkMode: colorMode === 'dark',
    showPatientIds: true,
    enableSmsNotifications: false,
    enableEmailNotifications: true,
  });
  
  // Handle settings change
  const handleSettingChange = (field, value) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: value,
    });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    setIsLoading(true);
    
    // In a real app, this would save to a backend or localStorage
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };
  
  // Dark mode toggle
  const handleDarkModeToggle = () => {
    toggleColorMode();
    handleSettingChange('enableDarkMode', !generalSettings.enableDarkMode);
  };
  
  // Export data (mock)
  const handleExportData = () => {
    toast({
      title: 'Data exported',
      description: 'Your data has been exported successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Import data (mock)
  const handleImportData = () => {
    toast({
      title: 'Data imported',
      description: 'Your data has been imported successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  return (
    <Box>
      <Heading size="lg" mb="6">Settings</Heading>
      
      <Tabs isLazy colorScheme="brand">
        <TabList mb="6">
          <Tab>
            <Icon as={FiSettings} mr="2" />
            General
          </Tab>
          <Tab>
            <Icon as={FiUser} mr="2" />
            Users & Staff
          </Tab>
          <Tab>
            <Icon as={FiDatabase} mr="2" />
            Data Management
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* General Settings Tab */}
          <TabPanel p="0">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
              <Card mb="6">
                <CardHeader bg="brand.50" py="3">
                  <Heading size="md">Healthcare Center Information</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing="6">
                    <FormControl>
                      <FormLabel>Center Name</FormLabel>
                      <Input 
                        value={generalSettings.centerName}
                        onChange={(e) => handleSettingChange('centerName', e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Tax ID / Registration Number</FormLabel>
                      <Input 
                        value={generalSettings.taxId}
                        onChange={(e) => handleSettingChange('taxId', e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl gridColumn={{ md: "1 / -1" }}>
                      <FormLabel>Address</FormLabel>
                      <Input 
                        value={generalSettings.address}
                        onChange={(e) => handleSettingChange('address', e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Contact Number</FormLabel>
                      <Input 
                        value={generalSettings.contactNumber}
                        onChange={(e) => handleSettingChange('contactNumber', e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input 
                        value={generalSettings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        value={generalSettings.currency}
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>
              
              <Card mb="6">
                <CardHeader bg="brand.50" py="3">
                  <Heading size="md">System Preferences</Heading>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing="4">
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="medium">Dark Mode</Text>
                        <Text fontSize="sm" color="gray.600">
                          Switch between light and dark themes
                        </Text>
                      </Box>
                      <Switch 
                        isChecked={generalSettings.enableDarkMode}
                        onChange={handleDarkModeToggle}
                        colorScheme="brand"
                      />
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="medium">Show Patient IDs</Text>
                        <Text fontSize="sm" color="gray.600">
                          Display patient IDs in listings and reports
                        </Text>
                      </Box>
                      <Switch 
                        isChecked={generalSettings.showPatientIds}
                        onChange={(e) => handleSettingChange('showPatientIds', e.target.checked)}
                        colorScheme="brand"
                      />
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="medium">SMS Notifications</Text>
                        <Text fontSize="sm" color="gray.600">
                          Send SMS alerts for appointments and reminders
                        </Text>
                      </Box>
                      <Switch 
                        isChecked={generalSettings.enableSmsNotifications}
                        onChange={(e) => handleSettingChange('enableSmsNotifications', e.target.checked)}
                        colorScheme="brand"
                      />
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="medium">Email Notifications</Text>
                        <Text fontSize="sm" color="gray.600">
                          Send email alerts for reports and invoices
                        </Text>
                      </Box>
                      <Switch 
                        isChecked={generalSettings.enableEmailNotifications}
                        onChange={(e) => handleSettingChange('enableEmailNotifications', e.target.checked)}
                        colorScheme="brand"
                      />
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
              
              <Flex justify="flex-end">
                <Button
                  type="submit"
                  colorScheme="brand"
                  leftIcon={<FiSave />}
                  isLoading={isLoading}
                >
                  Save Settings
                </Button>
              </Flex>
            </form>
          </TabPanel>
          
          {/* Users & Staff Tab */}
          <TabPanel p="0">
            <Card mb="6">
              <CardHeader bg="brand.50" py="3">
                <Flex justify="space-between" align="center">
                  <Heading size="md">Doctors & Staff</Heading>
                  <Button leftIcon={<FiUserPlus />} size="sm" colorScheme="brand">
                    Add New
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Name</Th>
                        <Th>Specialization</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {doctors.map((doctor) => (
                        <Tr key={doctor.id}>
                          <Td fontWeight="medium">{doctor.name}</Td>
                          <Td>{doctor.specialization}</Td>
                          <Td>
                            <Text color="green.500">Active</Text>
                          </Td>
                          <Td>
                            <HStack>
                              <IconButton
                                icon={<FiEdit />}
                                aria-label="Edit doctor"
                                size="sm"
                                variant="ghost"
                              />
                              <IconButton
                                icon={<FiTrash2 />}
                                aria-label="Delete doctor"
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
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
            
            <Card>
              <CardHeader bg="brand.50" py="3">
                <Flex justify="space-between" align="center">
                  <Heading size="md">User Accounts</Heading>
                  <Button leftIcon={<FiPlus />} size="sm" colorScheme="brand">
                    Add User
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody p="0">
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Name</Th>
                        <Th>Role</Th>
                        <Th>Email</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="medium">{currentUser.name}</Td>
                        <Td>
                          <Text textTransform="capitalize">{currentUser.role}</Text>
                        </Td>
                        <Td>admin@healthcare.com</Td>
                        <Td>
                          <HStack>
                            <IconButton
                              icon={<FiEdit />}
                              aria-label="Edit user"
                              size="sm"
                              variant="ghost"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="medium">Doctor User</Td>
                        <Td>Doctor</Td>
                        <Td>doctor@healthcare.com</Td>
                        <Td>
                          <HStack>
                            <IconButton
                              icon={<FiEdit />}
                              aria-label="Edit user"
                              size="sm"
                              variant="ghost"
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              aria-label="Delete user"
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="medium">Clerk User</Td>
                        <Td>Clerk</Td>
                        <Td>clerk@healthcare.com</Td>
                        <Td>
                          <HStack>
                            <IconButton
                              icon={<FiEdit />}
                              aria-label="Edit user"
                              size="sm"
                              variant="ghost"
                            />
                            <IconButton
                              icon={<FiTrash2 />}
                              aria-label="Delete user"
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Data Management Tab */}
          <TabPanel p="0">
            <Card mb="6">
              <CardHeader bg="brand.50" py="3">
                <Heading size="md">Backup & Restore</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing="6">
                  <Box>
                    <Heading size="sm" mb="3">Export Data</Heading>
                    <Text mb="4">
                      Export all data from the system as a JSON file for backup purposes.
                    </Text>
                    <Button 
                      leftIcon={<FiDownload />} 
                      colorScheme="brand"
                      onClick={handleExportData}
                    >
                      Export All Data
                    </Button>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb="3">Import Data</Heading>
                    <Text mb="4">
                      Import data from a backup file. This will override existing data.
                    </Text>
                    <HStack>
                      <Button leftIcon={<FiUpload />} onClick={handleImportData}>
                        Import Data
                      </Button>
                      <Input type="file" display="none" id="import-file" />
                    </HStack>
                    <Text fontSize="sm" color="red.500" mt="2">
                      Warning: Importing data will replace all current records.
                    </Text>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb="3">Clear Data</Heading>
                    <Text mb="4">
                      Clear all data from the system. This action cannot be undone.
                    </Text>
                    <Button colorScheme="red" variant="outline">
                      Clear All Data
                    </Button>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;
