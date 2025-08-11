"use client";

import ProtectedRoute from "@/components/auth/AuthProtectedRoute";
import UserProfile from "@/components/profile/user.profile";

export default function ProfilePage() {
  return (
    <ProtectedRoute level="user">
      <UserProfile />
    </ProtectedRoute>
  );
}
