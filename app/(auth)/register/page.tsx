'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { register, type RegisterActionState } from '../actions';
import DistrictForm from '@/components/DistrictForm';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'user_exists') {
      toast.error('Account already exists');
    } else if (state.status === 'failed') {
      toast.error('Failed to create account');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      toast.success('Account created successfully');
      setIsSuccessful(true);
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
  
    const name = formData.get('name') as string;
    const gender = formData.get('gender') as string;
    const dob = formData.get('dob') as string;
    const time = formData.get('time') as string;
    const place = formData.get('place') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const timezone = formData.get('timezone') as string;
  
    // Create a new FormData object and append values
    const newFormData = new FormData();
    newFormData.append('email', formData.get('email') as string);
    newFormData.append('password', formData.get('password') as string);
    newFormData.append('name', name);
    newFormData.append('gender', gender);
    newFormData.append('dob', dob);
    newFormData.append('time', time);
    newFormData.append('place', place);
    newFormData.append('latitude', latitude);
    newFormData.append('longitude', longitude);
    newFormData.append('timezone', timezone);
  
    // Submit the new FormData object
    formAction(newFormData);
  };
  

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account with your email and password
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
            <div className="flex flex-col gap-4">
            {/* Name */}
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Name
              <input
              type="text"
              name="name"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
              />
            </label>
            {/* Gender */}
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Gender
              <select
                name="gender"
                required
                defaultValue=""
                className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
              >
                <option value="" disabled>
                  Select your gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

            </label>
            {/* Date of Birth */}
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Date of Birth
              <input
              type="date"
              name="dob"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
              />
            </label>

            {/* Time Selection */}
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Time of Birth
              <input
              type="time"
              name="time"
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 dark:bg-zinc-800 dark:border-zinc-600"
              />
            </label>

            {/* Location Input */}
            <DistrictForm />
            </div>

          <SubmitButton isSuccessful={isSuccessful}>Sign Up</SubmitButton>

          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Already have an account? '}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign in
            </Link>
            {' instead.'}
          </p>
        </AuthForm>

      </div>
    </div>
  );
}
