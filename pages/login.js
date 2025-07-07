import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Login } from '@/components/Auth';
import { AUTH_CONFIG } from '@/config/index';
import { Box, Spinner, Center } from '@chakra-ui/react';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (session && status === 'authenticated') {
      const redirectTo = router.query.callbackUrl || 
                        (session.user.role === AUTH_CONFIG.roles.ADMIN 
                          ? AUTH_CONFIG.routes.admin 
                          : AUTH_CONFIG.routes.doctor);
      router.push(redirectTo);
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (session) {
    return (
      <Center minH="100vh">
        <Box>Redirecting...</Box>
      </Center>
    );
  }

  return <Login />;
}
