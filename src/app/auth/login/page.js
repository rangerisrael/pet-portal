'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, isAuthenticated, user, clearAuthError } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (typeof window !== 'undefined') {
      // Check veterinary staff status and redirect accordingly
      if (user?.email) {
        authService.getLoginRedirectRoute(user.email, user.id).then(redirectRoute => {
          window.location.href = redirectRoute;
        });
      } else {
        window.location.href = '/user-role';
      }
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      // Set manual login flag to trigger redirect logic in ReduxProvider
      localStorage.setItem("manualLoginInProgress", "true");

      const result = await login(email, password);

      if (result.success) {
        console.log("✅ Login successful, redirect will be handled by Redux provider");
        // The redirect is now handled automatically by the ReduxProvider
        // No need for manual redirect here
      } else {
        // Clear the flag if login failed
        localStorage.removeItem("manualLoginInProgress");
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Clear the flag if login failed
      localStorage.removeItem("manualLoginInProgress");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-4">
            P
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Pet Portal account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-600 text-sm">
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={clearAuthError}
                    className="ml-auto text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-600/20 hover:shadow-orange-600/30 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/auth/register"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Sign up for free
              </a>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Demo Credentials</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Email:</strong> demo@petportal.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;