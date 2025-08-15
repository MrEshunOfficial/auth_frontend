"use client";
import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  currentImage?: string;
  userName: string;
  onImageUpdate: (imageFile: File) => Promise<void>;
  disabled?: boolean;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  userName,
  onImageUpdate,
  disabled = false,
  maxSizeInMB = 5,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImage || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedFormats.includes(file.type)) {
        return `Please select a valid image format: ${acceptedFormats
          .map((format) => format.split("/")[1].toUpperCase())
          .join(", ")}`;
      }

      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        return `File size must be less than ${maxSizeInMB}MB`;
      }

      return null;
    },
    [acceptedFormats, maxSizeInMB]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(null);
      setUploadSuccess(false);

      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      setIsUploading(true);
      try {
        await onImageUpdate(file);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Failed to upload image"
        );
        // Revert preview on error
        setPreviewUrl(currentImage || null);
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUpdate, currentImage, validateFile]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => acceptedFormats.includes(file.type));

    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setUploadError("Please drop a valid image file");
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = () => {
    if (!disabled) {
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Avatar Upload Area */}
      <div className="flex flex-col items-center space-y-3">
        <motion.div
          className="relative group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={`
              relative w-24 h-24 rounded-full border-2 transition-all duration-200 cursor-pointer
              ${
                isDragOver
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={`${userName} profile`}
                width={96}
                height={96}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-teal-600 dark:from-blue-400 dark:to-teal-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                {getInitials(userName)}
              </div>
            )}

            {/* Upload Overlay */}
            <AnimatePresence>
              {!disabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remove Button */}
            {previewUrl && !disabled && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-md"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}

            {/* Upload Status Indicator */}
            <AnimatePresence>
              {uploadSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md"
                >
                  <CheckCircle className="w-3 h-3" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Upload Instructions */}
        {!disabled && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {previewUrl ? "Change Profile Picture" : "Add Profile Picture"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Click to upload or drag & drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Max {maxSizeInMB}MB • JPG, PNG, WebP
            </p>
          </div>
        )}

        {/* Alternative Upload Button */}
        {!previewUrl && !disabled && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openFileDialog}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? "Uploading..." : "Choose File"}
          </motion.button>
        )}
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {uploadError}
            </p>
            <button
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Profile picture updated successfully!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUpload;
