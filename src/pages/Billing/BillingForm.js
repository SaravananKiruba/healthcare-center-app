import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  NumberInput,
  NumberInputField,
  Divider,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiSave,
  FiPrinter,
  FiCheckCircle,
  FiEdit
} from 'react-icons/fi';
import { useAppContext } from '../../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

const BillingForm = () => {
  const { patientId, invoiceId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!invoiceId;
  const { patients, services, addInvoice, updateInvoice, isLoading, error } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [generatedInvoiceId, setGeneratedInvoiceId] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // Initialize with empty defaults, will be updated after we check the patient
  const [invoiceItems, setInvoiceItems] = useState([{ id: uuidv4(), description: '', amount: 0 }]);
  const [invoiceDetails, setInvoiceDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    discount: 0,
    tax: 0,
    paymentStatus: 'Unpaid',
    paymentMode: '',
    transactionId: '',
    amountPaid: 0,
    notes: '',
  });
  
  // Find the patient
  const patient = patients.find(p => p.id === patientId);
  
  // Update state if we're in edit mode and have an invoice
  useEffect(() => {
    if (isEditMode && patient) {
      const existingInvoice = patient.invoices?.find(inv => inv.id === invoiceId);
      
      if (existingInvoice) {
        // Update invoice items
        setInvoiceItems(
          existingInvoice.items.map(item => ({ ...item, id: uuidv4() }))
        );
        
        // Update invoice details
        setInvoiceDetails({
          date: new Date(existingInvoice.date).toISOString().split('T')[0],
          discount: existingInvoice.discount,
          tax: existingInvoice.tax,
          paymentStatus: existingInvoice.paymentStatus,
          paymentMode: existingInvoice.paymentMode || '',
          transactionId: existingInvoice.transactionId || '',
          amountPaid: existingInvoice.amountPaid || 0,
          notes: existingInvoice.notes || '',
        });
      }
    }
  }, [isEditMode, patient, invoiceId]);
  
  // Handle adding a new invoice item
  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: uuidv4(), description: '', amount: 0 }
    ]);
  };
  
  // Handle removing an invoice item
  const handleRemoveItem = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };
  
  // Handle item change
  const handleItemChange = (id, field, value) => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    
    // Clear error if exists
    if (formErrors.items) {
      setFormErrors({
        ...formErrors,
        items: null
      });
    }
  };
  
  // Handle service selection
  const handleServiceSelect = (id, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setInvoiceItems(invoiceItems.map(item => 
        item.id === id ? { 
          ...item, 
          description: service.name, 
          amount: service.price 
        } : item
      ));
      
      // Clear error if exists
      if (formErrors.items) {
        setFormErrors({
          ...formErrors,
          items: null
        });
      }
    }
  };
  
  // Handle invoice detail change
  const handleDetailChange = (field, value) => {
    setInvoiceDetails({
      ...invoiceDetails,
      [field]: value,
    });
    
    // Clear error if exists
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
    
    // If payment status is paid, set amount paid to total
    if (field === 'paymentStatus' && value === 'Paid') {
      setInvoiceDetails({
        ...invoiceDetails,
        [field]: value,
        amountPaid: calculateTotal()
      });
    } else if (field === 'paymentStatus' && value === 'Unpaid') {
      setInvoiceDetails({
        ...invoiceDetails,
        [field]: value,
        amountPaid: 0,
        paymentMode: ''
      });
    }
  };
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  };
  
  // Calculate total after discount and tax
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * Number(invoiceDetails.discount || 0)) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * Number(invoiceDetails.tax || 0)) / 100;
    return afterDiscount + taxAmount;
  };
  
  // Calculate balance
  const calculateBalance = () => {
    return calculateTotal() - Number(invoiceDetails.amountPaid || 0);
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Validate date
    if (!invoiceDetails.date) {
      errors.date = "Invoice date is required";
    }
    
    // Validate items
    const validItems = invoiceItems.filter(item => item.description && item.amount);
    if (validItems.length === 0) {
      errors.items = "At least one item with description and amount is required";
    }
    
    // Validate payment details
    if (invoiceDetails.paymentStatus === 'Paid') {
      if (!invoiceDetails.paymentMode) {
        errors.paymentMode = "Payment mode is required for paid invoices";
      }
      if (Number(invoiceDetails.amountPaid) < calculateTotal()) {
        errors.amountPaid = "Amount paid must equal or exceed total for Paid status";
      }
    } else if (invoiceDetails.paymentStatus === 'Partial') {
      if (!invoiceDetails.paymentMode) {
        errors.paymentMode = "Payment mode is required for partial payments";
      }
      if (Number(invoiceDetails.amountPaid) <= 0) {
        errors.amountPaid = "Amount paid must be greater than zero for Partial status";
      }
      if (Number(invoiceDetails.amountPaid) >= calculateTotal()) {
        errors.amountPaid = "Amount paid must be less than total for Partial status";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    const total = calculateTotal();
    const amountPaid = Number(invoiceDetails.amountPaid || 0);
    
    // Determine payment status based on amount paid if not set
    let paymentStatus = invoiceDetails.paymentStatus;
    if (paymentStatus === 'Unpaid' && amountPaid > 0) {
      paymentStatus = amountPaid >= total ? 'Paid' : 'Partial';
    }
    
    try {
      // Create invoice object
      const invoiceData = {
        ...invoiceDetails,
        items: invoiceItems.filter(item => item.description && item.amount),
        subtotal: calculateSubtotal(),
        total,
        paymentStatus,
        balance: total - amountPaid,
      };
      
      let result;
      
      if (isEditMode) {
        // Update existing invoice
        result = await updateInvoice(patientId, invoiceId, invoiceData);
        
        toast({
          title: 'Invoice updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Navigate back to patient view
        navigate(`/patient/${patientId}`);
      } else {
        // Add new invoice
        const newInvoiceId = await addInvoice(patientId, invoiceData);
        setGeneratedInvoiceId(newInvoiceId);
        
        toast({
          title: 'Invoice created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        onOpen(); // Open success modal
      }
    } catch (err) {
      console.error("Error handling invoice:", err);
      toast({
        title: 'Error',
        description: err.message || "An error occurred while processing the invoice",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  return (
    <Box>
      {isLoading && (
        <Flex justify="center" my="4">
          <Spinner size="lg" color="brand.500" />
        </Flex>
      )}
      
      {error && (
        <Alert status="error" mb="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* If patient not found, show error message */}
      {!patient ? (
        <Box textAlign="center" py="10">
          <Heading size="lg" mb="4">Patient Not Found</Heading>
          <Text mb="6">The patient you're billing doesn't exist or has been removed.</Text>
          <Button as={RouterLink} to="/billing" leftIcon={<FiArrowLeft />}>
            Back to Billing
          </Button>
        </Box>
      ) : (
        <>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'flex-start', md: 'center' }}
            mb="6"
          >
            <HStack mb={{ base: 4, md: 0 }}>
              <Button
                as={RouterLink}
                to={`/patient/${patientId}`}
                variant="outline"
                leftIcon={<FiArrowLeft />}
                size="sm"
              >
                Back to Patient
              </Button>
              <Heading size="lg">{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</Heading>
            </HStack>
          </Flex>
          
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb="6">
              <Card gridColumn={{ lg: "span 2" }}>
                <CardHeader bg="brand.50" py="3">
                  <Heading size="md">Patient Information</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Box>
                      <Text fontWeight="bold" mb="1">Patient Name</Text>
                      <Text>{patient.name}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb="1">Patient ID</Text>
                      <Text fontFamily="mono">{patient.id}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb="1">Contact</Text>
                      <Text>{patient.mobileNumber}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" mb="1">Age/Sex</Text>
                      <Text>{patient.age} years / {patient.sex}</Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader bg="brand.50" py="3">
                  <Heading size="md">Invoice Details</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={formErrors.date}>
                      <FormLabel>Invoice Date</FormLabel>
                      <Input 
                        type="date" 
                        value={invoiceDetails.date}
                        onChange={(e) => handleDetailChange('date', e.target.value)}
                      />
                      {formErrors.date && <FormErrorMessage>{formErrors.date}</FormErrorMessage>}
                    </FormControl>
                    
                    <FormControl isInvalid={formErrors.paymentStatus}>
                      <FormLabel>Payment Status</FormLabel>
                      <Select 
                        value={invoiceDetails.paymentStatus}
                        onChange={(e) => handleDetailChange('paymentStatus', e.target.value)}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </Select>
                      {formErrors.paymentStatus && <FormErrorMessage>{formErrors.paymentStatus}</FormErrorMessage>}
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Card mb="6">
              <CardHeader bg="brand.50" py="3">
                <Flex justify="space-between" align="center">
                  <Heading size="md">Invoice Items</Heading>
                  <Button 
                    size="sm" 
                    leftIcon={<FiPlus />}
                    onClick={handleAddItem}
                  >
                    Add Item
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody p="0">
                <FormControl isInvalid={formErrors.items}>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Item/Service</Th>
                        <Th isNumeric>Amount</Th>
                        <Th width="50px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {invoiceItems.map((item, index) => (
                        <Tr key={item.id}>
                          <Td>
                            <Flex direction="column" gap={2}>
                              <Select 
                                placeholder="Select or type service"
                                value=""
                                onChange={(e) => handleServiceSelect(item.id, e.target.value)}
                              >
                                {services.map(service => (
                                  <option key={service.id} value={service.id}>
                                    {service.name} - {formatCurrency(service.price)}
                                  </option>
                                ))}
                              </Select>
                              <Input 
                                placeholder="Custom description"
                                value={item.description}
                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              />
                            </Flex>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              min={0}
                              value={item.amount}
                              onChange={(valueString) => handleItemChange(item.id, 'amount', Number(valueString))}
                            >
                              <NumberInputField textAlign="right" />
                            </NumberInput>
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Remove item"
                              icon={<FiTrash2 />}
                              variant="ghost"
                              colorScheme="red"
                              size="sm"
                              isDisabled={invoiceItems.length <= 1}
                              onClick={() => handleRemoveItem(item.id)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {formErrors.items && (
                    <Box px="4" py="2">
                      <FormErrorMessage>{formErrors.items}</FormErrorMessage>
                    </Box>
                  )}
                </FormControl>
              </CardBody>
            </Card>
            
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb="6">
              <Card gridColumn={{ lg: 1 }}>
                <CardHeader bg="brand.50" py="3">
                  <Heading size="md">Payment Details</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={formErrors.paymentMode}>
                      <FormLabel>Payment Mode</FormLabel>
                      <Select 
                        placeholder="Select payment mode"
                        value={invoiceDetails.paymentMode}
                        onChange={(e) => handleDetailChange('paymentMode', e.target.value)}
                        isDisabled={invoiceDetails.paymentStatus === 'Unpaid'}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI">UPI</option>
                        <option value="Other">Other</option>
                      </Select>
                      {formErrors.paymentMode && <FormErrorMessage>{formErrors.paymentMode}</FormErrorMessage>}
                    </FormControl>
                    
                    <FormControl isInvalid={formErrors.transactionId}>
                      <FormLabel>Transaction ID (Optional)</FormLabel>
                      <Input 
                        placeholder="Enter transaction reference"
                        value={invoiceDetails.transactionId}
                        onChange={(e) => handleDetailChange('transactionId', e.target.value)}
                        isDisabled={invoiceDetails.paymentStatus === 'Unpaid'}
                      />
                      {formErrors.transactionId && <FormErrorMessage>{formErrors.transactionId}</FormErrorMessage>}
                    </FormControl>
                    
                    <FormControl isInvalid={formErrors.amountPaid}>
                      <FormLabel>Amount Paid</FormLabel>
                      <NumberInput
                        min={0}
                        max={calculateTotal()}
                        value={invoiceDetails.amountPaid}
                        isDisabled={invoiceDetails.paymentStatus === 'Unpaid'}
                        onChange={(valueString) => handleDetailChange('amountPaid', Number(valueString))}
                      >
                        <NumberInputField />
                      </NumberInput>
                      {formErrors.amountPaid && <FormErrorMessage>{formErrors.amountPaid}</FormErrorMessage>}
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <Textarea 
                        placeholder="Any additional notes for this invoice"
                        value={invoiceDetails.notes}
                        onChange={(e) => handleDetailChange('notes', e.target.value)}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card gridColumn={{ lg: 2 }}>
                <CardHeader bg="brand.50" py="3">
                  <Heading size="md">Invoice Summary</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text fontWeight="medium">{formatCurrency(calculateSubtotal())}</Text>
                    </Flex>
                    
                    <Flex>
                      <FormControl maxW="100px" mr="4">
                        <FormLabel fontSize="sm">Discount %</FormLabel>
                        <NumberInput
                          min={0}
                          max={100}
                          value={invoiceDetails.discount}
                          onChange={(valueString) => handleDetailChange('discount', Number(valueString))}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl maxW="100px">
                        <FormLabel fontSize="sm">Tax %</FormLabel>
                        <NumberInput
                          min={0}
                          max={100}
                          value={invoiceDetails.tax}
                          onChange={(valueString) => handleDetailChange('tax', Number(valueString))}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      
                      <Flex flex="1" justify="flex-end" align="flex-end">
                        <Text fontWeight="medium" fontSize="lg" color={invoiceDetails.discount > 0 ? "green.500" : undefined}>
                          {invoiceDetails.discount > 0 && "- "}
                          {formatCurrency((calculateSubtotal() * Number(invoiceDetails.discount || 0)) / 100)}
                        </Text>
                      </Flex>
                    </Flex>
                    
                    <Divider />
                    
                    <Flex justify="space-between" fontWeight="bold">
                      <Text>Total Amount:</Text>
                      <Text fontSize="xl">{formatCurrency(calculateTotal())}</Text>
                    </Flex>
                    
                    {invoiceDetails.paymentStatus !== 'Unpaid' && (
                      <>
                        <Flex justify="space-between">
                          <Text>Amount Paid:</Text>
                          <Text color="green.500">{formatCurrency(Number(invoiceDetails.amountPaid || 0))}</Text>
                        </Flex>
                        
                        <Flex justify="space-between">
                          <Text>Balance:</Text>
                          <Text color="red.500">{formatCurrency(calculateBalance())}</Text>
                        </Flex>
                        
                        <Flex justify="space-between" align="center">
                          <Text>Payment Status:</Text>
                          <Badge colorScheme={
                            invoiceDetails.paymentStatus === 'Paid' ? 'green' : 
                            invoiceDetails.paymentStatus === 'Partial' ? 'yellow' : 'red'
                          } px="2" py="1">
                            {invoiceDetails.paymentStatus}
                          </Badge>
                        </Flex>
                      </>
                    )}
                    
                    <Box pt="4">
                      <Button
                        type="submit"
                        colorScheme="brand"
                        size="lg"
                        width="full"
                        leftIcon={isEditMode ? <FiEdit /> : <FiSave />}
                        isLoading={isLoading}
                      >
                        {isEditMode ? 'Update Invoice' : 'Generate Invoice'}
                      </Button>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </form>
          
          {/* Success Modal */}
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader bg="green.50">Invoice Created Successfully</ModalHeader>
              <ModalBody py="6">
                <VStack spacing="4">
                  <Icon as={FiCheckCircle} color="green.500" boxSize="12" />
                  <Text fontSize="lg" fontWeight="bold">
                    Invoice has been generated!
                  </Text>
                  <Text textAlign="center" color="gray.600">
                    Invoice #{generatedInvoiceId} has been created for {patient?.name}
                  </Text>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button 
                  leftIcon={<FiPrinter />}
                  variant="outline" 
                  mr={3} 
                  onClick={onClose}
                >
                  Print Invoice
                </Button>
                <Button 
                  colorScheme="brand" 
                  onClick={() => navigate(`/patient/${patientId}`)}
                >
                  Back to Patient
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default BillingForm;
