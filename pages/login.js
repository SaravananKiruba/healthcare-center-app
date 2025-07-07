import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Login from '../src/components/Auth/Login';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (session && status === 'authenticated') {
      const redirectTo = router.query.callbackUrl || 
                        (session.user.role === 'admin' ? '/admin-dashboard' : '/doctor-dashboard');
      router.push(redirectTo);
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session) {
    return <div>Redirecting...</div>;
  }

  return <Login />;
}
