'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { startTransition } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { forgotPassword, type ForgotPasswordActionState } from '../actions';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const [isSuccessful, setIsSuccessful] = useState(false);
  const [state, formAction] = useActionState<ForgotPasswordActionState, FormData>(
    forgotPassword,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error('Failed to send email');
    } else if (state.status === 'invalid_data') {
      toast.error('Please enter a valid email address');
    } else if (state.status === 'success') {
      toast.success('Password reset email sent');
      setIsSuccessful(false);
      router.push('/forgot-password');
    }
  }, [state, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
  
    const formData = new FormData();
    formData.append('email', email);
  
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Forgot Password</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email to receive a password reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-muted text-md md:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <SubmitButton isSuccessful={isSuccessful}>
            Send Verification Email
          </SubmitButton>

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
