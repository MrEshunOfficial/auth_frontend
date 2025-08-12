"use client";
import { Button } from "@/components/ui/button";
import useProfile from "@/hook/useProfile";
import Link from "next/link";
import React, { useEffect } from "react";

export default function HomePage() {
  const { user, loading, isAuthenticated, error, fetchUserProfile } =
    useProfile();
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, fetchUserProfile]);
  // render error
  if (error) {
    return <div className="error">{error}</div>;
  }
  // render login link button if no user
  if (!user) {
    return (
      <div className="w-screen h-screen flex items-center justify-center border">
        <Link href="/login">
          <Button variant="outline">Log in</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="container">
      {loading ? "Loading..." : user ? user.name : "No User"}
      role: {user?.role}
    </div>
  );
}
