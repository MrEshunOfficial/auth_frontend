// app/admin/page.tsx (Fixed imports and naming)
"use client";

import AdminDashboard from "@/components/auth/AdminDashboard";
import ProtectedRoute from "@/components/auth/AuthProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute level="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
