"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api"; // Adjust path as needed
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (needsVerification) setNeedsVerification(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setNeedsVerification(false);

    try {
      const response = await apiClient.login(formData);

      if (response.requiresVerification) {
        setNeedsVerification(true);
        setVerificationEmail(response.email || formData.email);
      } else {
        router.push("/profile");
      }
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: string }).message === "string" &&
        (error as { message: string }).message.includes("verification")
      ) {
        setNeedsVerification(true);
        setVerificationEmail(formData.email);
      } else {
        setError(
          typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof (error as { message: string }).message === "string"
            ? (error as { message: string }).message
            : "Login failed"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await apiClient.resendVerification(verificationEmail);
      setError("");
      alert("Verification email sent! Please check your inbox.");
    } catch (error: unknown) {
      setError(
        typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: string }).message === "string"
          ? (error as { message: string }).message
          : "Failed to resend verification email"
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check if Google Sign-In is available
      if (typeof window !== "undefined" && window.google) {
        setIsLoading(true);

        // Initialize with FedCM support and proper configuration
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: { credential: string }) => {
            try {
              await apiClient.googleAuth(response.credential);
              router.push("/profile");
            } catch (error) {
              setError(
                typeof error === "object" &&
                  error !== null &&
                  "message" in error &&
                  typeof (error as { message: string }).message === "string"
                  ? (error as { message: string }).message
                  : "Google sign-in failed"
              );
            } finally {
              setIsLoading(false);
            }
          },
          // Add these FedCM-specific configurations
          use_fedcm_for_prompt: true,
          auto_select: false,
          cancel_on_tap_outside: true,
          // Prevent conflicts with button-based sign in
          prompt_parent_id: undefined,
        });

        // Use renderButton instead of prompt to avoid FedCM conflicts
        const googleButtonContainer = document.getElementById(
          "google-signin-button"
        );
        if (googleButtonContainer) {
          window.google.accounts.id.renderButton(googleButtonContainer, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
          });
        } else {
          // Fallback to prompt if button container not found
          window.google.accounts.id.prompt();
        }
      } else {
        setError(
          "Google Sign-In not available. Please refresh the page and try again."
        );
        setIsLoading(false);
      }
    } catch (error: unknown) {
      setError(
        typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: string }).message === "string"
          ? (error as { message: string }).message
          : "Google sign-in failed"
      );
      setIsLoading(false);
    }
  };

  type AppleIDAuthorization = {
    id_token: string;
    [key: string]: unknown;
  };

  type AppleIDResponse = {
    authorization: AppleIDAuthorization;
    user?: unknown;
    [key: string]: unknown;
  };

  const handleAppleSignIn = async () => {
    try {
      if (typeof window !== "undefined" && window.AppleID) {
        const response: unknown = await window.AppleID.auth.signIn();

        if (
          typeof response === "object" &&
          response !== null &&
          "authorization" in response &&
          typeof (response as AppleIDResponse).authorization === "object" &&
          (response as AppleIDResponse).authorization !== null &&
          "id_token" in (response as AppleIDResponse).authorization &&
          typeof (response as AppleIDResponse).authorization.id_token ===
            "string"
        ) {
          setIsLoading(true);
          const appleResponse = response as AppleIDResponse;
          await apiClient.appleAuth(
            appleResponse.authorization.id_token,
            appleResponse.user
          );
          router.push("/profile");
        }
      } else {
        setError("Apple Sign-In not available");
      }
    } catch (error: unknown) {
      setError(
        typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message: string }).message === "string"
          ? (error as { message: string }).message
          : "Apple sign-in failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl p-8 transition-all duration-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 transition-colors duration-200">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Verification Required Message */}
          {needsVerification && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg transition-colors duration-200">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                  Email Verification Required
                </p>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                Please verify your email address before logging in. Check your
                inbox for a verification email.
              </p>
              <button
                onClick={handleResendVerification}
                className="text-yellow-800 dark:text-yellow-200 text-sm underline hover:no-underline transition-colors duration-200">
                Resend verification email
              </button>
            </div>
          )}

          {/* Social Sign-In Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-black dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Continue with Apple
            </Button>
          </div>

          {/* Divider */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition duration-200 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors duration-200">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push("/signup")}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200">
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
