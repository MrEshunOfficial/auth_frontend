"use client";
import React, { useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  User,
  MapPin,
  Settings,
  Shield,
  Calendar,
  Mail,
  Phone,
  Edit,
} from "lucide-react";
import { withAuth } from "@/components/AuthWrapper";
import Image from "next/image";
import useProfile from "@/hook/useProfile";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
);

const ProfilePage: React.FC = () => {
  const {
    user,
    profile,
    loading,
    completeness,
    formatDate,
    getRoleDisplay,
    getProviderDisplay,
    isVerified,
    hasProfile,
    needsRefresh,
    fetchUserProfile,
  } = useProfile();

  // Fetch profile if data is stale
  useEffect(() => {
    if (needsRefresh && !loading) {
      fetchUserProfile().catch(console.error);
    }
  }, [needsRefresh, loading, fetchUserProfile]);

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    if (typeof user.avatar === "string") return user.avatar;
    return user.avatar.url;
  };

  // Show loading for initial load or when user data is not available yet
  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-2 text-center text-gray-700 dark:text-gray-300">
          Loading your profile...
        </p>
      </div>
    );
  }

  // This shouldn't happen due to AuthWrapper, but just in case
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-12 w-12 text-gray-400" />
        <p className="mt-2 text-center text-gray-700 dark:text-gray-300">
          Unable to load profile data.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="mb-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1">
                <Home size={14} />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Profile Header */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {getAvatarUrl() ? (
                <Image
                  src={getAvatarUrl()!}
                  alt={user.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <Shield size={12} className="text-white" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.name}
                </h1>
                {loading && <LoadingSpinner />}
              </div>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Mail size={14} />
                {user.email}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {getRoleDisplay(user.role)}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/profile/edit"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Edit size={14} className="mr-2" />
              Edit Profile
            </a>
          </div>
        </div>

        {/* Profile Completeness */}
        {completeness !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Profile Completeness</span>
              <span>{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Basic Info */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={18} />
            Account Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Type
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {getRoleDisplay(user.role)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sign-up Method
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {getProviderDisplay(user.provider)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Login
              </label>
              <p className="text-gray-900 dark:text-gray-100">
                {formatDate(user.lastLogin)}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={18} />
            Profile Details
          </h3>
          {hasProfile && profile ? (
            <div className="space-y-3">
              {profile.role && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Profile Role
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {getRoleDisplay(profile.role)}
                  </p>
                </div>
              )}
              {profile.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Bio
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {profile.bio}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profile Status
                </label>
                <p
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profile.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {formatDate(profile.updatedAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No profile details
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Complete your profile to get started.
              </p>
              <a
                href="/profile/edit"
                className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Complete Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Contact and Location Information */}
      {hasProfile && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Details */}
          {profile.contactDetails && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone size={18} />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Primary Contact
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {profile.contactDetails.primaryContact}
                  </p>
                </div>
                {profile.contactDetails.secondaryContact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Secondary Contact
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {profile.contactDetails.secondaryContact}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location Information */}
          {profile.location && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Location
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ghana Post GPS
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {profile.location.ghanaPostGPS}
                  </p>
                </div>
                {profile.location.region && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Region
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {profile.location.region}
                    </p>
                  </div>
                )}
                {profile.location.city && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      City
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {profile.location.city}
                    </p>
                  </div>
                )}
                {profile.location.nearbyLandmark && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nearby Landmark
                    </label>
                    <p className="text-gray-900 dark:text-gray-100">
                      {profile.location.nearbyLandmark}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Export with authentication wrapper
export default withAuth(ProfilePage, {
  fallback: (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
        Loading your profile...
      </p>
    </div>
  ),
});
