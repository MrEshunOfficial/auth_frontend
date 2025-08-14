import { UserRole, idType } from "@/types/api.types";
import { z } from "zod";

// Ghana phone number regex pattern from your backend
const ghanaPhoneRegex = /^\+233[0-9]{9}$|^0[0-9]{9}$/;

// Ghana Post GPS regex pattern from your backend
const ghanaPostGPSRegex = /^[A-Z]{2}-\d{4}-\d{4}$/;

// GPS coordinates validation schema
const gpsCoordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),
  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
});

// Location schema matching your backend structure
const locationSchema = z.object({
  ghanaPostGPS: z
    .string()
    .trim()
    .regex(ghanaPostGPSRegex, "Ghana Post GPS must be in format XX-0000-0000")
    .min(1, "Ghana Post GPS is required"), // Fixed: Made required
  nearbyLandmark: z
    .string()
    .trim()
    .max(100, "Nearby landmark cannot exceed 100 characters")
    .optional(),
  region: z
    .string()
    .trim()
    .max(50, "Region cannot exceed 50 characters")
    .optional(),
  city: z
    .string()
    .trim()
    .max(50, "City cannot exceed 50 characters")
    .optional(),
  district: z
    .string()
    .trim()
    .max(50, "District cannot exceed 50 characters")
    .optional(),
  locality: z
    .string()
    .trim()
    .max(50, "Locality cannot exceed 50 characters")
    .optional(),
  other: z
    .string()
    .trim()
    .max(200, "Other location info cannot exceed 200 characters")
    .optional(),
  gpsCoordinates: gpsCoordinatesSchema.optional(),
});

// Social media handle schema
const socialMediaHandleSchema = z.object({
  nameOfSocial: z
    .string({ required_error: "Social media platform name is required" })
    .trim()
    .min(1, "Social media platform name is required")
    .max(50, "Social media name cannot exceed 50 characters"),
  userName: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(1, "Username is required")
    .max(100, "Username cannot exceed 100 characters"),
});

// Contact details schema
const contactDetailsSchema = z.object({
  primaryContact: z
    .string()
    .trim()
    .regex(ghanaPhoneRegex, "Please provide a valid Ghana phone number"),
  secondaryContact: z
    .string()
    .trim()
    .regex(ghanaPhoneRegex, "Please provide a valid Ghana phone number")
    .optional(),
});

// ID file schema
const idFileSchema = z.object({
  url: z.string().url("Invalid file URL").trim(),
  fileName: z.string().trim().min(1, "File name is required"),
});

// ID details schema
const idDetailsSchema = z.object({
  idType: z.nativeEnum(idType, {
    errorMap: () => ({ message: "Please select a valid ID type" }),
  }),
  idNumber: z
    .string()
    .trim()
    .min(1, "ID number is required")
    .max(50, "ID number cannot exceed 50 characters"),
  idFile: idFileSchema,
});

// Complete USER profile form schema
export const profileFormSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional(),
  location: locationSchema.optional(),
  socialMediaHandles: z.array(socialMediaHandleSchema).max(5, "Maximum 5 social media handles allowed").optional(),
  contactDetails: contactDetailsSchema.optional(),
  idDetails: idDetailsSchema.optional(),
});

// Form schema for profile updates (all fields optional except required nested fields)
export const updateProfileFormSchema = profileFormSchema.partial({
  role: true,
  bio: true,
  location: true,
  socialMediaHandles: true,
  contactDetails: true,
  idDetails: true,
});

// Specific schemas for different form sections
export const basicInfoFormSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional(),
});

export const locationFormSchema = z.object({
  location: locationSchema,
});

export const contactFormSchema = z.object({
  contactDetails: contactDetailsSchema,
  socialMediaHandles: z.array(socialMediaHandleSchema).max(5).optional(),
});

export const identificationFormSchema = z.object({
  idDetails: idDetailsSchema,
});

// Fixed: USER role toggle using correct UserRole enum
export const userRoleToggleSchema = z.object({
  role: z.nativeEnum(UserRole).refine(
    (role) => role === UserRole.CUSTOMER || role === UserRole.PROVIDER,
    {
      message: "Users can only switch between customer and service_provider roles",
    }
  ),
});

// Location-specific validation for API endpoint
export const locationUpdateFormSchema = z.object({
  location: locationSchema,
});

// Type exports for TypeScript inference
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileFormSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoFormSchema>;
export type LocationFormData = z.infer<typeof locationFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type IdentificationFormData = z.infer<typeof identificationFormSchema>;
export type UserRoleToggleData = z.infer<typeof userRoleToggleSchema>;
export type LocationUpdateFormData = z.infer<typeof locationUpdateFormSchema>;

// Enhanced profile completeness calculation
export const calculateProfileCompleteness = (
  profile: Partial<ProfileFormData>
): number => {
  // Core fields (25% each for required fields)
  const coreFields = [
    profile.bio && profile.bio.trim(),
    profile.location?.ghanaPostGPS,
    profile.contactDetails?.primaryContact,
    profile.role,
  ];

  // Optional but valuable fields (10% each)
  const optionalFields = [
    profile.idDetails?.idNumber,
    profile.socialMediaHandles && profile.socialMediaHandles.length > 0,
  ];

  // Calculate core completeness (80%)
  const coreScore = (coreFields.filter(Boolean).length / coreFields.length) * 80;
  
  // Calculate optional completeness (20%)
  const optionalScore = (optionalFields.filter(Boolean).length / optionalFields.length) * 20;

  return Math.round(coreScore + optionalScore);
};

// Validation helper functions
export const validateGhanaPhone = (phone: string): boolean => {
  return ghanaPhoneRegex.test(phone);
};

export const validateGhanaPostGPS = (gps: string): boolean => {
  return ghanaPostGPSRegex.test(gps);
};

// Enhanced form field configurations
export const formFieldConfigs = {
  bio: {
    maxLength: 500,
    placeholder: "Tell us about yourself...",
    rows: 4,
  },
  ghanaPostGPS: {
    placeholder: "XX-0000-0000",
    pattern: "XX-0000-0000",
    required: true, // Added required indicator
  },
  nearbyLandmark: {
    maxLength: 100,
    placeholder: "e.g., Near Accra Mall",
  },
  region: {
    maxLength: 50,
    placeholder: "e.g., Greater Accra",
  },
  city: {
    maxLength: 50,
    placeholder: "e.g., Accra",
  },
  district: {
    maxLength: 50,
    placeholder: "e.g., Tema Metropolitan",
  },
  locality: {
    maxLength: 50,
    placeholder: "e.g., East Legon",
  },
  other: {
    maxLength: 200,
    placeholder: "Additional location information",
  },
  primaryContact: {
    placeholder: "+233XXXXXXXXX or 0XXXXXXXXX",
    type: "tel",
    required: true,
  },
  secondaryContact: {
    placeholder: "+233XXXXXXXXX or 0XXXXXXXXX",
    type: "tel",
  },
  socialMediaName: {
    maxLength: 50,
    placeholder: "e.g., Instagram, Twitter, LinkedIn",
  },
  socialMediaUsername: {
    maxLength: 100,
    placeholder: "e.g., @username",
  },
  idNumber: {
    maxLength: 50,
    placeholder: "Enter your ID number",
    required: true,
  },
} as const;


export const idTypeConfigs = {
  [idType.NATIONAL_ID]: {
    label: "Ghana Card",
    icon: "🆔",
    description: "National identification card issued by NIA",
    pattern: /^GHA-\d{9}-\d$/,
    placeholder: "GHA-123456789-0",
    example: "GHA-123456789-0",
    maxLength: 15,
  },
  [idType.VOTERS_ID]: {
    label: "Voter's ID",
    icon: "🗳️",
    description: "Electoral Commission voter identification",
    pattern: /^\d{10}$/,
    placeholder: "1234567890",
    example: "1234567890",
    maxLength: 10,
  },
  [idType.PASSPORT]: {
    label: "Ghana Passport",
    icon: "📘",
    description: "Ghana passport issued by Immigration Service",
    pattern: /^[A-Z]\d{7}$/,
    placeholder: "A1234567",
    example: "A1234567",
    maxLength: 8,
  },
  [idType.DRIVERS_LICENSE]: {
    label: "Driver's License",
    icon: "🚗",
    description: "DVLA driving license",
    pattern: /^[A-Z]{2}\d{7}$/,
    placeholder: "DL1234567",
    example: "DL1234567",
    maxLength: 9,
  },
  [idType.NHIS]: {
    label: "NHIS Card",
    icon: "🏥",
    description: "National Health Insurance Scheme card",
    pattern: /^\d{10}$/,
    placeholder: "1234567890",
    example: "1234567890",
    maxLength: 10,
  },
  // Add the missing OTHER configuration
  [idType.OTHER]: {
    label: "Other ID",
    icon: "📋",
    description: "Other valid identification document",
    pattern: /^.+$/,
    placeholder: "Enter ID number",
    example: "Various formats accepted",
    maxLength: 20,
  },
} as const;