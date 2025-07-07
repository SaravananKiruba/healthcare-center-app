import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Card,
  CardHeader,
  CardBody,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext-nextjs';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const { login, isAuthenticated, user, getDashboardByRole } = useAuth();
  
  // Get color values for the theme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = router.query.callbackUrl || getDashboardByRole(user.role);
      router.push(from);
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, user, router, getDashboardByRole]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic form validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email and password are required');
      setIsLoading(false);
      return;
    }

    try {
      // Use the enhanced login function from AuthContext
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Clear form data after successful login
        setFormData({ email: '', password: '' });
        
        // Get the intended destination (if redirected from a protected route)
        // or use the default dashboard for the user's role
        const from = router.query.callbackUrl || result.redirectTo;
        
        // Navigate to the appropriate dashboard based on role or previous location
        router.push(from);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || (typeof err === 'object' ? 'An error occurred during login' : err || 'An unexpected error occurred during login'));
    } finally {
      setIsLoading(false);
    }
  };
    // Function to safely extract error message from error object
  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (!error) return 'An unknown error occurred';
    
    if (typeof error === 'object') {
      // If error has a msg property, use it
      if (error.msg) return error.msg;
      
      // If it has a message property (standard JS Error)
      if (error.message) return error.message;
      
      // If it has a type and might be a validation error
      if (error.type && error.loc) {
        return `Validation error: ${error.msg || 'Invalid input'}`;
      }
      
      // If we can't extract any specific message, convert the object to a string
      return JSON.stringify(error);
    }
    
    return 'Login failed. Please check your credentials.';
  };

  // If still checking authentication status, show loading spinner
  if (isCheckingAuth) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card maxW="md" w="full" bg={cardBg} shadow="xl">
        <CardHeader textAlign="center" pb={2}>
          <VStack spacing={4}>
            <Box
              w="60px"
              h="60px"
              bg="brand.500"
              rounded="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiLock size="24px" color="white" />
            </Box>
            <Heading size="lg" color="brand.500">
              Healthcare Center
            </Heading>
            <Box mt={2} p={3} bg="blue.50" borderRadius="md" w="100%" fontSize="sm">
              <Text fontWeight="bold" mb={1}>Default Credentials:</Text>
              <Text>Admin: admin@healthcare.com / admin123</Text>
              <Text>Doctor: doctor@healthcare.com / doctor123</Text>
            </Box>
            <Text color="gray.600" fontSize="sm">
              Sign in to your account
            </Text>
          </VStack>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  {typeof error === 'object' ? getErrorMessage(error) : error}
                </Alert>
              )}

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    bg="gray.50"
                    border={0}
                    _focus={{
                      bg: 'white',
                      outline: 'none',
                      borderColor: 'brand.500',
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    bg="gray.50"
                    border={0}
                    _focus={{
                      bg: 'white',
                      outline: 'none',
                      borderColor: 'brand.500',
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                w="full"
                isLoading={isLoading}
                loadingText="Signing in..."
                size="lg"
              >
                Sign In
              </Button>

              <Flex justifyContent="center" width="100%" mt={2}>
                <Text fontSize="sm" color="gray.500">
                  Your session data will be securely stored locally
                </Text>
              </Flex>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
