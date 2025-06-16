import React, { useState } from 'react';
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
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FiLock } from 'react-icons/fi';
import { authAPI } from '../../services/api';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

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

    try {
      const response = await authAPI.login(formData.email, formData.password);
      const { access_token, user } = response.data;
      
      // Store token and user info
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.full_name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onLogin(user);
    } catch (err) {      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      // Ensure the error is a string, not an object
      setError(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

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
                  {typeof error === 'object' ? (error.msg || 'Login failed. Please check your credentials.') : error}
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
                    }}
                  />
                  <InputRightElement>
                    <IconButton
                      h="1.75rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
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

              <Box textAlign="center" pt={4}>
                <Text fontSize="sm" color="gray.600">
                  Default Admin: admin@healthcare.com / admin123
                </Text>
              </Box>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Login;
