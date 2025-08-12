"use client";
import useProfile from "@/hook/useProfile";
import React, { useEffect } from "react";

const ProfileDemo: React.FC = () => {
  const { user, profile, isAuthenticated, fetchUserProfile } = useProfile();

  // fetch user profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);

  console.log("User:", user);
  console.log("Profile:", profile);

  return (
    <div>
      <h1>Profile Information</h1>
    </div>
  );
};

export default ProfileDemo;
