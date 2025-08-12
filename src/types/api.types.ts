// types/api.types.ts
export interface UserLocation {
  ghanaPostGPS: string;
  nearbyLandmark?: string;
  region?: string;
  city?: string;
  district?: string;
  locality?: string;
  other?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export enum UserRole {
  CUSTOMER = "customer",
  PROVIDER = "service_provider",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum IdType {
  NATIONAL_ID = "national_id",
  PASSPORT = "passport",
  VOTERS_ID = "voters_id",
  DRIVERS_LICENSE = "drivers_license",
  OTHER = "other",
}

export interface ProfilePicture {
  url: string;
  fileName: string;
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
  secondaryContact: string;
}

export interface IdDetails {
  idType: IdType;
  idNumber: string;
  idFile: {
    url: string;
    fileName: string;
  };
}

export interface UserProfile {
  _id: string;
  userId: string;
  role?: UserRole;
  bio?: string;
  location?: UserLocation;
  preferences?: UserPreferences;
  socialMediaHandles?: SocialMediaHandle[];
  lastModified?: string;
  contactDetails?: ContactDetails;
  idDetails?: IdDetails;
  isActive: boolean;
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
  profileId?: string;
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
  profileRole?: string | null;
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
