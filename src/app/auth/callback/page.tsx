// File: app/auth/callback/page.tsx
// This page handles the redirect after login and gets the token

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authClient from "@/lib/auth/authClient";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Check if we're authenticated and get the token
        const result = await authClient.checkAuthentication();

        if (result.authenticated && result.user) {
          setStatus("success");
          setMessage("Authentication successful! Redirecting...");

          // Get the callback URL from search params
          const callbackUrl = searchParams.get("callbackUrl") || "/profile";

          // Small delay to show success message
          setTimeout(() => {
            // Redirect to the original destination or profile
            window.location.href = callbackUrl;
          }, 1500);
        } else {
          setStatus("error");
          setMessage("Authentication failed. Please try again.");

          setTimeout(() => {
            authClient.redirectToLogin();
          }, 3000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("An error occurred during authentication.");

        setTimeout(() => {
          authClient.redirectToLogin();
        }, 3000);
      }
    }

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === "loading" && "Authenticating..."}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Failed"}
          </h2>

          <div className="mt-4">
            {status === "loading" && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            )}
            {status === "success" && (
              <div className="text-green-600">
                <svg
                  className="w-8 h-8 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {status === "error" && (
              <div className="text-red-600">
                <svg
                  className="w-8 h-8 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
