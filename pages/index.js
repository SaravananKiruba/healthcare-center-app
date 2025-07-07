import React from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (session) {
      // Redirect based on role
      const redirectTo = session.user.role === 'admin' ? '/admin-dashboard' : '/doctor-dashboard';
      router.push(redirectTo);
    } else {
      // Not logged in, redirect to login
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Redirecting...
    </div>
  );
}
