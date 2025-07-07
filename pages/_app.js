import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import theme from '../src/theme/theme';
import { AppProvider } from '../src/context/AppContext';
import { AuthProvider } from '../src/context/AuthContext-nextjs';

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
