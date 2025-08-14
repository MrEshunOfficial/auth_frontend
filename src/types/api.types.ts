import { Types } from "mongoose";

// types/api.types.ts - Updated with compatibility fixes
export interface UserLocation {
  ghanaPostGPS: string;
  nearbyLandmark?: string;
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
  other?: string;
  gpsCoordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

export enum UserRole {
  CUSTOMER = "customer",
  PROVIDER = "service_provider",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

// Fixed: Renamed to match backend casing
export enum idType {
  NATIONAL_ID = "national_id",
  PASSPORT = "passport",
  VOTERS_ID = "voters_id",
  DRIVERS_LICENSE = "drivers_license",
  NHIS = "nhis",
  OTHER = "other",
}

export interface ProfilePicture {
  url?: string;
  fileName?: string;
}

export interface SocialMediaHandle {
  nameOfSocial: string;
  userName: string;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  language?: string;
  privacySettings?: {
    shareProfile?: boolean;
    shareLocation?: boolean;
    shareContactDetails?: boolean;
    preferCloseProximity?: {
      location?: boolean;
      radius?: number;
    };
  };
}

export interface ContactDetails {
  primaryContact: string;
  secondaryContact?: string;
}

export interface IdDetails {
  idType: idType;
  idNumber: string;
  idFile: {
    url: string;
    fileName: string;
  };
}

export interface UserProfile {
  _id: string;
  userId: Types.ObjectId;
  role?: UserRole;
  bio?: string;
  location?: UserLocation;
  preferences?: UserPreferences;
  socialMediaHandles?: SocialMediaHandle[];
  lastModified?: string;
  contactDetails?: ContactDetails;
  idDetails?: IdDetails;
  completeness?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  lastLogin: string;
  isVerified: boolean;
  userRole: "user" | "admin" | "super_admin";
  provider: "credentials" | "google" | "apple";
  providerId?: string;
  avatar?: ProfilePicture | string;
  systemAdminName?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  profileId?: Types.ObjectId; // Reference to user profile
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
export interface ApiResponse<T = unknown> {
  message: string;
  user?: User;
  profile?: UserProfile;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
  data?: T;
  completeness?: number;
  hasProfile?: boolean;
  profileRole?: UserRole | null;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Request body interfaces
export interface SignupRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface UpdateProfileRequestBody {
  name?: string;
  avatar?: string | ProfilePicture;
  profile?: Partial<UserProfile>;
}

export interface UpdateProfileRoleRequestBody {
  role: UserRole;
}

export interface UpdateProfileLocationRequestBody {
  location: UserLocation;
}

export interface GoogleAuthRequestBody {
  idToken: string;
}

export interface AppleAuthRequestBody {
  idToken: string;
  user?: {
    name?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface LinkProviderRequestBody {
  provider: "google" | "apple";
  idToken: string;
}

// Additional type guards and utilities for role checking
export const isSystemAdmin = (user: User): boolean => {
  return user.userRole === "admin" || user.userRole === "super_admin";
};

export const isServiceProvider = (profile?: UserProfile): boolean => {
  return profile?.role === UserRole.PROVIDER;
};

export const isCustomer = (profile?: UserProfile): boolean => {
  return profile?.role === UserRole.CUSTOMER;
};

export const canProvideServices = (user: User, profile?: UserProfile): boolean => {
  return isServiceProvider(profile) && !isSystemAdmin(user);
};

export const canAccessAdminPanel = (user: User): boolean => {
  return isSystemAdmin(user);
};

// Type for complete user context (system + profile roles)
export interface UserContext {
  user: User;
  profile?: UserProfile;
  systemRole: User['userRole'];
  profileRole?: UserRole;
  permissions: {
    isSystemAdmin: boolean;
    isServiceProvider: boolean;
    isCustomer: boolean;
    canProvideServices: boolean;
    canAccessAdminPanel: boolean;
  };
}

// Helper function to create user context
export const createUserContext = (user: User, profile?: UserProfile): UserContext => {
  return {
    user,
    profile,
    systemRole: user.userRole,
    profileRole: profile?.role,
    permissions: {
      isSystemAdmin: isSystemAdmin(user),
      isServiceProvider: isServiceProvider(profile),
      isCustomer: isCustomer(profile),
      canProvideServices: canProvideServices(user, profile),
      canAccessAdminPanel: canAccessAdminPanel(user),
    },
  };
};