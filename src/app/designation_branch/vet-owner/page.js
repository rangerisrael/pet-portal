'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const VetOwnerPage = () => {
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
              Veterinary Owner Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome to the Veterinary Owner management system
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
                <strong>Role:</strong> Veterinary Owner
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Owner Access
              </h2>
              <p className="text-gray-600">
                You have owner-level access to the veterinary management system based on your designation.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Next Steps
              </h2>
              <p className="text-gray-600">
                Access your owner dashboard to manage all branches and oversee operations.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard/vet-owner')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go to Vet Owner Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetOwnerPage;