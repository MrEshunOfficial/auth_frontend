// components/ConditionalRender.tsx (Utility component for conditional UI elements)
import React from "react";
import RoleBasedAccess from "./RoleBasedComponent";

const ConditionalRender: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {/* Show admin-only button */}
      <RoleBasedAccess requireAdmin={true}>
        <button className="bg-red-500 text-white px-4 py-2 rounded">
          Admin Only Action
        </button>
      </RoleBasedAccess>

      {/* Show super admin-only section */}
      <RoleBasedAccess requireSuperAdmin={true}>
        <div className="bg-purple-100 p-4 rounded">
          <h3>Super Admin Panel</h3>
          <p>This is only visible to super administrators.</p>
        </div>
      </RoleBasedAccess>

      {/* Show for specific roles */}
      <RoleBasedAccess allowedRoles={["admin", "super_admin"]}>
        <div className="bg-blue-100 p-4 rounded">
          <h3>Moderation Tools</h3>
          <p>Available to admins and moderators.</p>
        </div>
      </RoleBasedAccess>

      {children}
    </>
  );
};

export default ConditionalRender;
