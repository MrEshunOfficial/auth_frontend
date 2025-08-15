"use client";
import React, { useEffect } from "react";
import LoadingSpinner from "@/components/ui/Loading-spinner";
import { withAuth } from "@/components/AuthWrapper";
import DashboardNavigation, {
  QuickActions,
} from "@/components/DashBoardNavigation";
import { useProfile } from "@/hook/useProfile";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    user,
    loading,
    error,
    fetchUserProfile,
    clearProfileError,
    needsRefresh,
    isAuthenticated,
  } = useProfile();

  // Fetch user profile if needed
  useEffect(() => {
    if (isAuthenticated && needsRefresh && !loading) {
      fetchUserProfile().catch(console.error);
    }
  }, [isAuthenticated, needsRefresh, loading, fetchUserProfile]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error && error !== "AUTHENTICATION_ERROR") {
        clearProfileError();
      }
    };
  }, [error, clearProfileError]);

  const handleRetryFetch = () => {
    fetchUserProfile().catch(console.error);
  };

  return (
    <div className="container max-w-7xl mx-auto min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Content */}
      <main className="flex-1 w-full pb-2">
        <div className="flex gap-4 h-full">
          {/* Sidebar */}
          <aside className="w-76 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  Navigation
                </h3>
              </div>
              <div className="flex-1 p-4 min-h-0 flex flex-col">
                <DashboardNavigation />
                <QuickActions />
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <section className="flex-1 min-w-0">
            {/* Error Display */}
            {error && error !== "AUTHENTICATION_ERROR" && (
              <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error loading profile
                    </h3>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={handleRetryFetch}
                        className="text-sm bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State for Content */}
            {loading && !user ? (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Loading your dashboard...
                </p>
              </div>
            ) : (
              <div className="h-full">{children}</div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Errand Mate - All rights reserved
        </div>
      </footer>
    </div>
  );
};

// Export with authentication wrapper
export default withAuth(DashboardLayout, {
  fallback: (
    <div className="max-h-screen overflow-auto flex flex-col items-center justify-center p-2 bg-gray-50 dark:bg-gray-900">
      <p className="text-center mb-2 text-gray-700 dark:text-gray-300">
        Errand mate welcomes you, please wait while we load your profile...
      </p>
      <LoadingSpinner />
    </div>
  ),
});
