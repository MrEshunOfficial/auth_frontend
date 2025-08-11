// app/admin/layout.tsx (Optional: Admin-specific layout)
"use client";
import React from "react";
import { Shield } from "lucide-react";
import ProtectedRoute from "@/components/auth/AuthProtectedRoute";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLoadingComponent = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Shield className="h-12 w-12 animate-pulse text-orange-500" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Loading Admin Panel...</h2>
        <p className="text-muted-foreground">
          Verifying administrative privileges
        </p>
      </div>
    </div>
  </div>
);

const AdminUnauthorizedComponent = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center space-y-4">
      <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto">
        <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Admin Access Required</h2>
        <p className="text-muted-foreground">
          You need administrator privileges to access this area. Please contact
          your system administrator if you believe this is an error.
        </p>
      </div>
    </div>
  </div>
);

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute
      level="admin"
      loadingComponent={<AdminLoadingComponent />}
      unauthorizedComponent={<AdminUnauthorizedComponent />}>
      {children}
    </ProtectedRoute>
  );
}
