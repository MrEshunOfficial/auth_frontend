"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { UserRole } from "@/types/api.types";
import { formFieldConfigs } from "@/lib/schemas/profile.schema";
import type { UpdateProfileFormData } from "@/lib/schemas/profile.schema";

interface BasicInfoFormStepProps {
  className?: string;
  onFieldChange?: (field: string, value: unknown) => void;
}

const roleOptions = [
  {
    value: UserRole.CUSTOMER,
    label: "Customer (or Client)",
    description: "I'm looking for services",
    icon: "🛒",
  },
  {
    value: UserRole.PROVIDER,
    label: "Service Provider",
    description: "I provide services to customers",
    icon: "🔧",
  },
];

export default function BasicInfoFormStep({
  className = "",
  onFieldChange,
}: BasicInfoFormStepProps) {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<UpdateProfileFormData>();

  const selectedRole = watch("role");
  const bioValue = watch("bio") || "";

  const handleRoleSelect = (role: UserRole) => {
    setValue("role", role, { shouldValidate: true, shouldDirty: true });
    onFieldChange?.("role", role);
  };

  const handleBioChange = (value: string) => {
    setValue("bio", value, { shouldValidate: true, shouldDirty: true });
    onFieldChange?.("bio", value);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Role Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            How will you be using the platform?{" "}
            <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose if you will be registering as a client, or service provider.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleRoleSelect(option.value)}
              className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-md ${
                selectedRole === option.value
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              {/* Selection indicator */}
              <div className="absolute top-4 right-4">
                {selectedRole === option.value ? (
                  <div className="w-5 h-5 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errors.role && (
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
            <span className="text-red-500">⚠️</span>
            <span>{errors.role.message}</span>
          </div>
        )}
      </div>

      {/* Bio Section */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="bio"
            className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2"
          >
            Tell us about yourself
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Share a brief description about yourself. This will help others
            understand who you are and what you do.
          </p>
        </div>

        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  {...field}
                  id="bio"
                  rows={formFieldConfigs.bio.rows}
                  maxLength={formFieldConfigs.bio.maxLength}
                  placeholder={formFieldConfigs.bio.placeholder}
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e);
                    handleBioChange(e.target.value);
                  }}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                    errors.bio
                      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800 focus:border-red-400 dark:focus:border-red-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-400 dark:focus:border-blue-500"
                  } text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                />

                {/* Character counter */}
                <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  {bioValue.length}/{formFieldConfigs.bio.maxLength}
                </div>
              </div>

              {/* Character count progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    bioValue.length > formFieldConfigs.bio.maxLength * 0.9
                      ? "bg-red-400 dark:bg-red-500"
                      : bioValue.length > formFieldConfigs.bio.maxLength * 0.7
                      ? "bg-yellow-400 dark:bg-yellow-500"
                      : "bg-green-400 dark:bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (bioValue.length / formFieldConfigs.bio.maxLength) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              {errors.bio && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                  <span className="text-red-500">⚠️</span>
                  <span>{errors.bio.message}</span>
                </div>
              )}
            </div>
          )}
        />

        {/* Bio writing tips */}
        <div className="flex flex-col items-start bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips for a great bio:
          </h4>
          <ul className="text-sm text-start text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Keep it professional but personal</li>
            <li>• Mention your skills or interests</li>
            <li>• Include what makes you unique</li>
            <li>• Be authentic and friendly</li>
          </ul>
        </div>
      </div>

      {/* Next steps hint */}
      {selectedRole && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-green-500 text-xl">🎉</span>
            <div>
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                Great start!
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                {selectedRole === UserRole.PROVIDER
                  ? "As a service provider, make sure to complete your location and contact details to help customers find you."
                  : "As a customer, adding your location will help you find nearby service providers."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export types for better TypeScript integration
export type { BasicInfoFormStepProps };
