'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from '../../components/LoginForm';
import { LoginSchema } from '../../utils/validation';

function LoginContent() {
  const { login, isLoading, error } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';

  const handleSubmit = async (data: LoginSchema) => {
    await login(data);
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          No account?{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
      {registered && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">Account created!</p>
          <p className="text-sm text-green-600 mt-1">
            Check your email for a confirmation link, then sign in.
          </p>
        </div>
      )}
      <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="max-w-md w-full text-center text-gray-500">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
