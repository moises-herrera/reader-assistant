import { Suspense } from 'react';
import { AuthCallback } from '@/components';

const AuthCallbackPage = () => {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
};

export default AuthCallbackPage;
