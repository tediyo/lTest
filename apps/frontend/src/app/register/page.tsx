'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { RegisterForm } from '../../components/RegisterForm';
import { RegisterSchema } from '../../utils/validation';

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();

  const handleSubmit = async (data: RegisterSchema) => {
    await register({ email: data.email, password: data.password });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
        </div>
      </div>
    </main>
  );
}
