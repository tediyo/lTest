'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
const TOKEN_KEY = 'auth_access_token';

interface UserProfile {
  id: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push('/login');
      return;
    }

    authService
      .getProfile(token)
      .then((response) => {
        if (response.success && response.data) {
          setUser(response.data as UserProfile);
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        await authService.logout(token);
      } catch {
        // proceed regardless
      }
    }
    sessionStorage.removeItem(TOKEN_KEY);
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">AuthApp</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Welcome banner */}
        <div className="bg-indigo-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="mt-1 text-indigo-200 text-sm">
            You are successfully authenticated via Supabase + NestJS.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Status', value: 'Active', color: 'text-green-600' },
            { label: 'Provider', value: 'Supabase', color: 'text-indigo-600' },
            { label: 'Session', value: 'Live', color: 'text-blue-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">Authenticated user</p>
              </div>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <dt className="text-xs font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-xs text-gray-800 font-mono break-all">{user?.id}</dd>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <dt className="text-xs font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-800">{user?.email}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              Supabase Dashboard →
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="http://localhost:3001/auth/profile"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              API Profile endpoint →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
