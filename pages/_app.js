import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from '@/theme/theme';
import { AuthProvider } from '@/lib/auth';
import { AppProvider } from '@/context/AppContext';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <AppProvider>
            <Component {...pageProps} />
          </AppProvider>
        </AuthProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
