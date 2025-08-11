// components/UserProfile.tsx (Updated - remove redundant auth logic)
"use client";
import useProfile from "@/hook/useProfile";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LogOut,
  Shield,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Settings,
  Crown,
} from "lucide-react";

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = "" }) => {
  const {
    profile,
    loading,
    error,
    logout,
    clearProfileError,
    formatDate,
    getRoleDisplay,
    getProviderDisplay,
    isAdmin,
    isSuperAdmin,
    fetchUserProfile,
  } = useProfile();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Clear error when component unmounts or user wants to retry
  const handleRetry = () => {
    clearProfileError();
    fetchUserProfile().catch(console.error);
  };

  // Since layout handles auth, we can assume user is authenticated here
  // But still handle loading and error states gracefully

  if (loading && !profile) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <User className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No profile data available</p>
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage
                  src={profile.avatar}
                  alt={`${profile.name}'s avatar`}
                />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h1>
                  {isSuperAdmin && (
                    <Crown className="h-6 w-6 text-yellow-500" />
                  )}
                </div>

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {getRoleDisplay(profile.userRole)}
                  </Badge>
                  {isSuperAdmin && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Super Admin
                    </Badge>
                  )}
                  {isAdmin && !isSuperAdmin && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loading}
              className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800">
              <LogOut className="h-4 w-4 mr-2" />
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and system information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    User ID
                  </p>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {profile.id}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Account Type
                </p>
                <p className="text-sm">
                  {getProviderDisplay(profile.provider)}
                </p>
              </div>

              {profile.phone && (
                <>
                  <Separator />
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="text-sm">{profile.phone}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </p>
                    <p className="text-sm">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Login
                    </p>
                    <p className="text-sm">{formatDate(profile.lastLogin)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
            <CardDescription>
              Your personal details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.bio && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                <p className="text-sm bg-muted p-3 rounded-md">{profile.bio}</p>
              </div>
            )}

            {profile.address && (
              <>
                {profile.bio && <Separator />}
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Address
                    </p>
                    <div className="text-sm space-y-1">
                      {profile.address.street && (
                        <p>{profile.address.street}</p>
                      )}
                      <p>
                        {[profile.address.city, profile.address.zipCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {profile.address.country && (
                        <p>{profile.address.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {profile.preferences && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Preferences
                  </p>
                  <div className="space-y-2">
                    {profile.preferences.theme && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Theme
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {profile.preferences.theme}
                        </Badge>
                      </div>
                    )}
                    {profile.preferences.language && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Language
                        </span>
                        <Badge variant="outline">
                          {profile.preferences.language}
                        </Badge>
                      </div>
                    )}
                    {typeof profile.preferences.notifications === "boolean" && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Notifications
                        </span>
                        <Badge
                          variant={
                            profile.preferences.notifications
                              ? "default"
                              : "secondary"
                          }>
                          {profile.preferences.notifications
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="text-xs text-muted-foreground">
              Last updated: {formatDate(profile.updatedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Privileges Card */}
      {(isAdmin || isSuperAdmin) && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                {isSuperAdmin ? (
                  <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  {isSuperAdmin
                    ? "Super Administrator Access"
                    : "Administrator Access"}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This account has{" "}
                  {isSuperAdmin ? "full system" : "administrative"} privileges
                  and can perform advanced operations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
