'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { resetPassword, type ResetPasswordActionState } from '../actions';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [formValues, setFormValues] = useState({
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{
    confirmPassword?: string;
  }>({});

  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, formAction] = useActionState<ResetPasswordActionState, FormData>(
    resetPassword,
    { status: 'idle' }
  );

  useEffect(() => {
    if (state.status === 'token_invalid') {
      toast.error('Invalid token');
    } else if (state.status === 'token_expired') {
      toast.error('Expired token');
    } else if (state.status === 'failed') {
      toast.error('Failed to reset password');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      toast.success('Password reset successfully');
      setIsSuccessful(true);
      router.push('/login');
    }
  }, [state, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    if (formValues.password !== formValues.confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', formValues.password);
    formData.append('confirm-password', formValues.confirmPassword);

    await formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Reset Password</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Set your new password</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          <input type="hidden" name="token" value={token} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              className="bg-muted text-md md:text-sm"
              required
              value={formValues.password}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-password" className="text-zinc-600 font-normal dark:text-zinc-400">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              className="bg-muted text-md md:text-sm"
              required
              value={formValues.confirmPassword}
              onChange={(e) =>
                setFormValues((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm">{formErrors.confirmPassword}</p>
            )}
          </div>

          {state.status === 'error' && state.message && (
            <p className="text-red-500 text-sm">{state.message}</p>
          )}

          <SubmitButton isSuccessful={isSuccessful}>
            Reset Password
          </SubmitButton>
        </form>
      </div>
    </div>
  );
};

export default function PageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
