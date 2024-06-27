import { Suspense } from 'react';
import { AuthCallback } from '@/components/auth/AuthCallback';

const AuthCallbackPage = () => {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
};

export default AuthCallbackPage;
