import React from 'react';
import { TwoFactorVerify } from '@/features/auth/components/TwoFactorVerify';

interface PageProps {
  tempToken?: string;
  emailMasked?: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export const TwoFactorVerifyPage: React.FC<PageProps> = ({
  tempToken = '',
  emailMasked = 'u***@example.com',
  onSuccess = () => (window.location.href = '/vault'),
  onBackToLogin = () => (window.location.href = '/'),
}) => {
  return (
    <div className="min-h-screen w-full bg-[#0F1115] text-slate-100 flex items-center justify-center p-4">
      <TwoFactorVerify
        tempToken={tempToken}
        emailMasked={emailMasked}
        onSuccess={onSuccess}
        onBackToLogin={onBackToLogin}
      />
    </div>
  );
};

export default TwoFactorVerifyPage;
