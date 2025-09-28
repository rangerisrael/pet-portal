'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const MainBranchPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Main Branch Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome to the Main Branch veterinary management system
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                User Information
              </h2>
              <p className="text-gray-600">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-gray-600">
                <strong>Role:</strong> Main Branch Staff
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Branch Access
              </h2>
              <p className="text-gray-600">
                You have been assigned to the Main Branch location based on your veterinary staff designation.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Next Steps
              </h2>
              <p className="text-gray-600">
                Access your branch-specific tools and manage veterinary operations from this dashboard.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard/main-branch')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go to Main Branch Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainBranchPage;