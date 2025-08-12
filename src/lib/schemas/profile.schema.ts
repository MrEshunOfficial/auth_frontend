import { IdType, UserRole } from "@/types/api.types";
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
    .optional(),
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
    .regex(ghanaPhoneRegex, "Please provide a valid Ghana phone number")
    .optional(),
  secondaryContact: z
    .string()
    .trim()
    .regex(ghanaPhoneRegex, "Please provide a valid Ghana phone number")
    .optional(),
});

// ID file schema
const idFileSchema = z.object({
  url: z.string().trim().optional(),
  fileName: z.string().trim().optional(),
});

// ID details schema
const idDetailsSchema = z.object({
  idType: z.nativeEnum(IdType).optional(),
  idNumber: z
    .string()
    .trim()
    .max(50, "ID number cannot exceed 50 characters")
    .optional(),
  idFile: idFileSchema.optional(),
});

// USER profile form schema (core profile information only)
export const profileFormSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional(),
  location: locationSchema.optional(),
  socialMediaHandles: z.array(socialMediaHandleSchema).optional(),
  contactDetails: contactDetailsSchema.optional(),
  idDetails: idDetailsSchema.optional(),
});

// Form schema for profile updates (all fields optional)
export const updateProfileFormSchema = profileFormSchema.partial();

// Specific schemas for different form sections
export const basicInfoFormSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional(),
});

export const locationFormSchema = locationSchema;

export const contactFormSchema = z.object({
  contactDetails: contactDetailsSchema.optional(),
  socialMediaHandles: z.array(socialMediaHandleSchema).optional(),
});

export const identificationFormSchema = idDetailsSchema;

// USER-only role toggle (separate from profile form)
export const userRoleToggleSchema = z.object({
  role: z.enum([UserRole.CUSTOMER, UserRole.PROVIDER], {
    errorMap: () => ({
      message:
        "Users can only switch between customer and service_provider roles",
    }),
  }),
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

// Helper function to validate profile completeness on the frontend
export const calculateProfileCompleteness = (
  profile: Partial<ProfileFormData>
): number => {
  let score = 0;
  const fields = [
    profile.bio,
    profile.location?.ghanaPostGPS,
    profile.contactDetails?.primaryContact,
    profile.idDetails?.idNumber,
  ];

  fields.forEach((field) => {
    if (field && field.toString().trim()) {
      score += 25;
    }
  });

  return score;
};

// Validation helper functions
export const validateGhanaPhone = (phone: string): boolean => {
  return ghanaPhoneRegex.test(phone);
};

export const validateGhanaPostGPS = (gps: string): boolean => {
  return ghanaPostGPSRegex.test(gps);
};

// Form field configurations for UI components (profile form only)
export const formFieldConfigs = {
  bio: {
    maxLength: 500,
    placeholder: "Tell us about yourself...",
    rows: 4,
  },
  ghanaPostGPS: {
    placeholder: "XX-0000-0000",
    pattern: "XX-0000-0000",
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
  },
} as const;

