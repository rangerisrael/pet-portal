"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Heart,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Shield,
  Users,
  X,
  Locate,
} from "lucide-react";

import { InputField } from "@/components/ui/input-field";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { useRouter } from "next/navigation";
import { setAuthState } from "@/store/slices/authSlice";
import { useDropzone } from "react-dropzone";
import AddPhoto from "@/components/upload";
import { useSignInMutation, useSignUpMutation } from "@/hooks/useAuthQueries";
import { useDispatch } from "react-redux";
import useAuthUsers from "@/hooks/useAuthUsers";
import useAuth from "@/hooks/useAuth";
import useVeterinaryStaff from "@/hooks/useVeterinaryStaff";
import { authService } from "@/services/authService";
import { supabase } from "@/lib/supabase";

const AuthSignUser = () => {
  const [currentPage, setCurrentPage] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const dispatch = useDispatch();
  const { mutate: signUpUser, isPending } = useSignUpMutation();
  const { mutate: signInUser, isPending: isLoginPending } = useSignInMutation();

  // Use Redux for authentication
  const { user } = useAuth();

  // Form states
  const [signinForm, setSigninForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    role: "pet-owner",
    profilePhoto: profile?.name ?? "",
    password: "",
    confirmPassword: "",

    agreeToTerms: false,
  });

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // Get the hash part of the URL
      const hash = window.location.hash;

      if (hash) {
        // Remove the '#' and parse the parameters
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
          console.log(accessToken, "get-acess-token");

          setSuccessMessage(
            "🎉 Email verified successfully! You're all set to log in."
          );
        }
      }
    }
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateSigninForm = () => {
    const newErrors = {};

    if (!signinForm.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(signinForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!signinForm.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!signupForm.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!signupForm.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!signupForm.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(signupForm.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!signupForm.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!signupForm.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(signupForm.password)) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!signupForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!signupForm.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Supabase Auth Functions
  const handleSignin = () => {
    setErrors({});
    setSuccessMessage("");

    if (!validateSigninForm()) {
      return;
    }

    try {
      signInUser(
        { email: signinForm.email, password: signinForm.password },
        {
          onSuccess: async ({ user, session, profile }) => {
            console.log("Login successful:", { user, session, profile });
            console.log("get user", user);

            if (user) {
              // Update Redux state first
              dispatch(
                setAuthState({
                  user,
                  session,
                  profile: profile || user.user_metadata,
                })
              );

              const role = user?.user_metadata.role ?? "pet-owner";

              // Get the appropriate redirect route based on veterinary staff status
              try {
                const redirectRoute = await authService.getLoginRedirectRoute(
                  user.email,
                  user.id,
                  role
                );
                setSuccessMessage("Redirecting to dasboard");

                console.log("get redirectRoute", redirectRoute);

                router.push(redirectRoute);
              } catch (error) {
                console.error("Error determining redirect route:", error);

                // // Fallback to pet-owner dashboard if there's an error
                router.push(`/dashboard/${user.user_metadata.role}`);
              }

              setIsLoading(false);
            }
          },
          onError: (error) => {
            console.error("Sign in error:", error);

            // Clear manual login flag on error
            localStorage.removeItem("manualLoginInProgress");

            // Handle different types of errors
            let errorMessage = "An error occurred during sign in.";

            if (error?.message) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            }

            setErrors({ general: errorMessage });
          },
        }
      );
    } catch (error) {
      // Clear manual login flag on error
      localStorage.removeItem("manualLoginInProgress");

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error?.message) {
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage =
              "Invalid email or password. Please check your credentials.";
            break;
          case "Email not confirmed":
            errorMessage =
              "Please check your email and click the confirmation link.";
            break;
          case "Too many requests":
            errorMessage =
              "Too many login attempts. Please wait a moment and try again.";
            break;
          default:
            errorMessage = error.message;
        }
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    setErrors({});
    setSuccessMessage("");

    if (!validateSignupForm()) {
      return;
    }

    setIsLoading(true);

    try {
      signUpUser(
        {
          email: signupForm.email,
          password: signupForm.password,
          firstName: signupForm.firstName,
          lastName: signupForm.lastName,
          phone: signupForm.phone,
          role: signupForm.role,
          getProfile: profile,
          address: signinForm.address,
        },
        {
          onSuccess: () => {
            setSuccessMessage(
              "Account created successfully! Please check your email to verify your account."
            );

            setSignupForm({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              address: "",
              role: "veterinarian",
              password: "",
              confirmPassword: "",
              agreeToTerms: false,
            });
            setProfile(null);
          },
          onError: (error) => {
            setErrors(error);
          },
        }
      );
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error?.message) {
        switch (error.message) {
          case "User already registered":
            errorMessage =
              "An account with this email already exists. Please sign in instead.";
            break;
          case "Password should be at least 6 characters":
            errorMessage = "Password must be at least 6 characters long.";
            break;
          case "Invalid email":
            errorMessage = "Please enter a valid email address.";
            break;
          default:
            errorMessage = error.message;
        }
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Now we just conditionally render based on currentPage
  if (currentPage === "signin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Information */}
          <div className="hidden lg:block space-y-8 p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Petkho Portal
                  </h1>
                  <p className="text-orange-600 font-semibold">
                    Veterinary Management System
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  Welcome back to your
                  <span className="text-orange-600"> professional</span>{" "}
                  veterinary platform
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Streamline your veterinary practice with our comprehensive
                  management system. Access patient records, manage
                  appointments, and grow your practice efficiently.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    icon: Stethoscope,
                    title: "Patient Management",
                    desc: "Complete medical records and history tracking",
                  },
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    desc: "Multi-user access with role-based permissions",
                  },
                  {
                    icon: Shield,
                    title: "Secure & Compliant",
                    desc: "HIPAA-compliant data protection and privacy",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 bg-white/50 rounded-xl backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Sign In */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                  <Heart size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Petkho Portal
                  </h1>
                  <p className="text-orange-600 text-sm font-semibold">
                    Veterinary Management
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Sign in to your veterinary management account
                  </p>
                </div>

                {errors.general && (
                  <ErrorMessage
                    message={errors.general}
                    onClose={() => setErrors({})}
                  />
                )}

                {successMessage && (
                  <SuccessMessage
                    message={successMessage}
                    onClose={() => setSuccessMessage("")}
                  />
                )}

                <div className="space-y-6">
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="Email address"
                    value={signinForm.email}
                    onChange={(e) =>
                      setSigninForm({ ...signinForm, email: e.target.value })
                    }
                    required
                    error={errors.email}
                    name="email"
                  />

                  <InputField
                    icon={Lock}
                    type="password"
                    placeholder="Password"
                    value={signinForm.password}
                    onChange={(e) =>
                      setSigninForm({ ...signinForm, password: e.target.value })
                    }
                    required
                    error={errors.password}
                    name="password"
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signinForm.rememberMe}
                        onChange={(e) =>
                          setSigninForm({
                            ...signinForm,
                            rememberMe: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    onClick={handleSignin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoginPending ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setCurrentPage("signup");
                        setErrors({});
                        setSuccessMessage("");
                      }}
                      className="text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign Up Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Information */}
        <div className="hidden lg:block space-y-8 p-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <Heart size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Petkho Portal
                </h1>
                <p className="text-orange-600 font-semibold">
                  Veterinary Management System
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Join the future of
                <span className="text-orange-600"> veterinary care</span>{" "}
                management
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Transform your veterinary practice with our cutting-edge
                management platform. Get started today and experience the
                difference professional tools make.
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">
                Why Choose Petkho Portal?
              </h3>
              <div className="space-y-3">
                {[
                  "Complete patient record management",
                  "Automated appointment scheduling",
                  "Integrated billing and invoicing",
                  "Multi-branch support",
                  "Real-time analytics and reporting",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle
                      size={18}
                      className="text-orange-200 flex-shrink-0"
                    />
                    <span className="text-orange-50">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                <Heart size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Petkho Portal
                </h1>
                <p className="text-orange-600 text-sm font-semibold">
                  Veterinary Management
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-600">
                  Start your professional veterinary management journey
                </p>
              </div>

              {errors.general && (
                <ErrorMessage
                  message={errors.general}
                  onClose={() => setErrors({})}
                />
              )}

              {successMessage && (
                <SuccessMessage
                  message={successMessage}
                  onClose={() => setSuccessMessage("")}
                />
              )}

              <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                {/* upload */}
                <AddPhoto
                  setProfile={(profile) => setProfile(profile)}
                  profile={profile}
                />
                {/* end upload */}

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    icon={User}
                    placeholder="First name"
                    value={signupForm.firstName}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        firstName: e.target.value,
                      })
                    }
                    required
                    error={errors.firstName}
                    name="firstName"
                  />
                  <InputField
                    icon={User}
                    placeholder="Last name"
                    value={signupForm.lastName}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, lastName: e.target.value })
                    }
                    required
                    error={errors.lastName}
                    name="lastName"
                  />
                </div>

                <InputField
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                  required
                  error={errors.email}
                  name="email"
                />

                <InputField
                  icon={Phone}
                  type="tel"
                  placeholder="Phone number"
                  value={signupForm.phone}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, phone: e.target.value })
                  }
                  required
                  error={errors.phone}
                  name="phone"
                />

                <InputField
                  icon={Locate}
                  type="tel"
                  placeholder="Address"
                  value={signupForm.phone}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, address: e.target.value })
                  }
                  required
                  error={errors.phone}
                  name="phone"
                />

                <InputField
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  required
                  error={errors.password}
                  name="password"
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <InputField
                  icon={Lock}
                  type="password"
                  placeholder="Confirm password"
                  value={signupForm.confirmPassword}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  error={errors.confirmPassword}
                  name="confirmPassword"
                  showPassword={showConfirmPassword}
                  onTogglePassword={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={signupForm.agreeToTerms}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          agreeToTerms: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mt-1"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-orange-600 hover:text-orange-700 font-semibold"
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      <span>{errors.agreeToTerms}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSignup}
                disabled={isPending || !signupForm.agreeToTerms}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg shadow-orange-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isPending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setCurrentPage("signin");
                      setErrors({});
                      setSuccessMessage("");
                    }}
                    className="text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSignUser;
