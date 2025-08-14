"use client";
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  MapPin,
  Phone,
  Mail,
  Shield,
  Clock,
  ExternalLink,
  AlertCircle,
  Home,
  Calendar,
  UserCircle,
  Group,
} from "lucide-react";
import { useProfile } from "@/hook/useProfile";
import Link from "next/link";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    y: -1,
    transition: { duration: 0.15 },
  },
};

// Components
const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 dark:border-red-300"></div>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/20 ${className}`}
    {...props}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`p-3 pb-1 ${className}`}>{children}</div>
);

const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`p-3 pt-1 ${className}`}>{children}</div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => (
  <h3
    className={`text-base font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
    {children}
  </h3>
);

const Avatar: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`relative inline-flex items-center justify-center ${className}`}>
    {children}
  </div>
);

const AvatarFallback: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-600 dark:from-blue-400 dark:to-teal-500 text-white font-medium ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "success" | "outline";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default:
      "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
    secondary:
      "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
    success:
      "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700",
    outline:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className = "" }) => (
  <div
    className={`w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 ${className}`}>
    <div
      className="bg-gradient-to-r from-red-400 to-red-500 dark:from-red-500 dark:to-red-400 h-1.5 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const variants = {
    default:
      "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white",
    outline:
      "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
  };

  const sizes = {
    default: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}>
      {children}
    </button>
  );
};

// Info item component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
  icon,
  label,
  value,
  className = "",
}) => (
  <motion.div
    variants={itemVariants}
    className={`flex items-start gap-2 py-1.5 ${className}`}>
    <div className="flex-shrink-0 mt-0.5 text-gray-400 dark:text-gray-500 w-4 h-4">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
        {label}
      </p>
      <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
        {value}
      </div>
    </div>
  </motion.div>
);

// Status badge component
interface StatusBadgeProps {
  role: string;
  variant?: "profile" | "system";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  role,
  variant = "profile",
}) => {
  const getVariant = (role: string): "default" | "secondary" | "outline" => {
    if (role.includes("admin")) return "secondary";
    if (role.includes("provider")) return "default";
    return "outline";
  };

  const colors =
    variant === "system"
      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
      : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";

  return (
    <Badge variant={getVariant(role)} className={colors}>
      {variant === "system" && <Shield className="w-3 h-3 mr-1" />}
      {role}
    </Badge>
  );
};

// Breadcrumb components
const Breadcrumb: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <nav className="flex">{children}</nav>
);

const BreadcrumbList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ol className="flex items-center gap-1">{children}</ol>;

const BreadcrumbItem: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <li className="flex items-center">{children}</li>;

interface BreadcrumbLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({
  href,
  children,
  className = "",
}) => (
  <a
    href={href}
    className={`flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${className}`}>
    {children}
  </a>
);

const BreadcrumbSeparator: React.FC = () => (
  <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
);

const BreadcrumbPage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
    {children}
  </span>
);

const ProfilePage: React.FC = () => {
  const {
    user,
    profile,
    loading,
    error,
    completeness,
    needsRefresh,
    fetchUserProfile,
    isAuthenticated,
    formatDate,
    getRoleDisplay,
    getProviderDisplay,
  } = useProfile();

  console.log("system role: ", user?.userRole);

  useEffect(() => {
    if (needsRefresh && !loading && isAuthenticated) {
      fetchUserProfile().catch(console.error);
    }
  }, [needsRefresh, loading, fetchUserProfile, isAuthenticated]);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && !user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Loading your profile...
        </motion.p>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-900">
        <User className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unable to load profile data.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-6xl mx-auto p-2 space-y-3">
      {/* Breadcrumb */}
      <motion.div variants={itemVariants}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center gap-1">
                <Home className="w-3 h-3" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-2">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <motion.div variants={cardVariants} whileHover="hover">
        <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-white dark:ring-gray-900 shadow-md rounded-full">
                    <AvatarFallback className="text-lg dark:text-gray-200">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {user.name}
                    </h1>
                    {loading && <LoadingSpinner />}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user.email}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {user.userRole !== "user" && (
                      <StatusBadge
                        role={getRoleDisplay(user.userRole)}
                        variant="system"
                      />
                    )}
                    {profile?.role && (
                      <StatusBadge
                        role={getRoleDisplay(profile.role)}
                        variant="profile"
                      />
                    )}
                  </div>
                </div>
              </div>
              {(() => {
                const roleActions: Record<
                  string,
                  { label: string; href: string }
                > = {
                  service_provider: {
                    label: "Register Services",
                    href: "/service-registration",
                  },
                  customer: {
                    label: "Request a Service",
                    href: "/service-request",
                  },
                };

                const action = roleActions[profile?.role || ""] || null;
                return action ? (
                  <Link href={action.href} passHref>
                    <Button
                      size="lg"
                      className="flex items-center gap-1.5 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
                      <Group className="w-4 h-4" />
                      {action.label}
                    </Button>
                  </Link>
                ) : null;
              })()}
            </div>

            {/* Profile Completeness */}
            {completeness !== undefined && completeness !== 100 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Profile Completeness
                  </span>
                  <span className="text-base font-bold text-teal-600 dark:text-teal-400">
                    {completeness}%
                  </span>
                </div>
                <Progress value={completeness ?? 0} />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Account Information */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCircle className="w-4 h-4 text-blue-600" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-0">
                {user.userRole !== "user" && (
                  <InfoItem
                    icon={<Shield className="w-4 h-4" />}
                    label="System Role"
                    value={getRoleDisplay(user.userRole)}
                  />
                )}

                <InfoItem
                  icon={<ExternalLink className="w-4 h-4" />}
                  label="Sign-up Method"
                  value={getProviderDisplay(user.provider)}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Member Since"
                  value={formatDate(user.createdAt)}
                />
                <InfoItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Last Login"
                  value={formatDate(user.lastLogin)}
                />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <motion.div variants={cardVariants} whileHover="hover">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4 text-red-600" />
                Profile Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-0">
                  {profile.role && (
                    <InfoItem
                      icon={<User className="w-4 h-4" />}
                      label="Profile Role"
                      value={getRoleDisplay(profile.role)}
                    />
                  )}
                  {profile.bio && (
                    <InfoItem
                      icon={<Settings className="w-4 h-4" />}
                      label="Bio"
                      value={profile.bio}
                    />
                  )}
                  <InfoItem
                    icon={<Calendar className="w-4 h-4" />}
                    label="Last Updated"
                    value={formatDate(profile.updatedAt)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6">
                  <User className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <h4 className="text-base font-medium text-gray-900 mb-1">
                    No profile details
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Complete your profile to get started.
                  </p>
                  <Button>Complete Profile</Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Contact and Location */}
      {(profile?.contactDetails || profile?.location) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Contact Details */}
          {profile.contactDetails && (
            <motion.div variants={cardVariants} whileHover="hover">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Phone className="w-4 h-4 text-teal-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-0">
                    <InfoItem
                      icon={<Phone className="w-4 h-4" />}
                      label="Primary Contact"
                      value={profile.contactDetails.primaryContact}
                    />
                    {profile.contactDetails.secondaryContact && (
                      <InfoItem
                        icon={<Phone className="w-4 h-4" />}
                        label="Secondary Contact"
                        value={profile.contactDetails.secondaryContact}
                      />
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Location Information */}
          {profile.location && (
            <motion.div variants={cardVariants} whileHover="hover">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-0">
                    <InfoItem
                      icon={<MapPin className="w-4 h-4" />}
                      label="Ghana Post GPS"
                      value={profile.location.ghanaPostGPS}
                    />
                    {profile.location.region && (
                      <InfoItem
                        icon={<MapPin className="w-4 h-4" />}
                        label="Region"
                        value={profile.location.region}
                      />
                    )}
                    {profile.location.city && (
                      <InfoItem
                        icon={<MapPin className="w-4 h-4" />}
                        label="City"
                        value={profile.location.city}
                      />
                    )}
                    {profile.location.nearbyLandmark && (
                      <InfoItem
                        icon={<MapPin className="w-4 h-4" />}
                        label="Nearby Landmark"
                        value={profile.location.nearbyLandmark}
                      />
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Social Media */}
      {profile?.socialMediaHandles && profile.socialMediaHandles.length > 0 && (
        <motion.div variants={cardVariants} whileHover="hover">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {profile.socialMediaHandles.map((social, index) => (
                  <InfoItem
                    key={index}
                    icon={<ExternalLink className="w-4 h-4" />}
                    label={social.nameOfSocial}
                    value={`@${social.userName}`}
                  />
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfilePage;
