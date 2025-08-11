// app/profile/layout.tsx (Fixed version)
"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Home,
  Settings,
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  User,
  Shield,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleBasedComponent from "@/components/auth/RoleBasedComponent";
import { useAuth, useUserRole } from "@/hook/useProfile";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

// Custom loading component for the profile layout
const ProfileLoadingState = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Loading your profile...</h2>
        <p className="text-muted-foreground">
          Please wait while we verify your access
        </p>
      </div>
    </div>
  </div>
);

// Custom unauthorized component for the profile layout
const ProfileUnauthorizedState = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center space-y-4">
      <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto">
        <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Email Verification Required</h2>
        <p className="text-muted-foreground">
          You need to verify your email address to access your profile. Please
          check your email for a verification link.
        </p>
      </div>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Didn&apos;t receive an email? Check your spam folder or contact
          support.
        </AlertDescription>
      </Alert>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
        <Button onClick={() => (window.location.href = "/resend-verification")}>
          Resend Email
        </Button>
      </div>
    </div>
  </div>
);

// Inner layout component (only rendered when authenticated)
const ProfileLayoutContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { isAdmin, isSuperAdmin, roleDisplay } = useUserRole();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Logo/Brand with user indicator */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h2>
            {/* Role indicator */}
            <div className="flex items-center space-x-1">
              {isSuperAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
              {isAdmin && !isSuperAdmin && (
                <Shield className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
          {user && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {user.name} • {roleDisplay}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => (window.location.href = "/dashboard")}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>

            <Button
              variant="secondary"
              className="w-full justify-start bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => (window.location.href = "/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>

            {/* Admin-only navigation items */}
            <RoleBasedComponent requireAdmin={true}>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => (window.location.href = "/admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Button>
              </div>
            </RoleBasedComponent>

            {/* Super Admin-only navigation items */}
            <RoleBasedComponent requireSuperAdmin={true}>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => (window.location.href = "/system-admin")}>
                <Crown className="mr-2 h-4 w-4" />
                System Admin
              </Button>
            </RoleBasedComponent>
          </div>
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm">
                <Sun className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Breadcrumb */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                </Button>

                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href="/dashboard"
                        className="flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium">
                        Profile
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Title Section */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Profile
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Manage your account settings and personal information
                </p>
              </div>

              {/* Profile status indicators */}
              <div className="flex items-center space-x-2">
                {user?.isVerified ? (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Unverified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="text-center text-sm text-muted-foreground">
              <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Main layout component with authentication
export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <AuthGuard
      requireAuth={true}
      requireVerification={true}
      redirectTo="/login"
      loadingComponent={<ProfileLoadingState />}
      unauthorizedComponent={<ProfileUnauthorizedState />}>
      <ProfileLayoutContent>{children}</ProfileLayoutContent>
    </AuthGuard>
  );
}
