"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  Settings,
  Edit,
  HelpCircle,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import useProfile from "@/hook/useProfile";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/profile/edit",
    label: "Edit Profile",
    icon: Edit,
  },
  {
    href: "/profile/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    href: "/profile/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/profile/help",
    label: "Help",
    icon: HelpCircle,
  },
];

export const DashboardNavigation: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useProfile();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Logout will still redirect even if it fails
    }
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(item.href);

        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
              isActive
                ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            <Icon size={16} />
            {item.label}
          </a>
        );
      })}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>
    </nav>
  );
};

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const { user, completeness } = useProfile();

  if (!user) return null;

  const actions = [];

  // Add complete profile action if profile is incomplete
  if (completeness !== undefined && completeness < 100) {
    actions.push({
      label: "Complete Profile",
      action: () => router.push("/profile/edit"),
      priority: "high" as const,
    });
  }

  // Add privacy settings action
  actions.push({
    label: "Privacy Settings",
    action: () => router.push("/profile/settings"),
    priority: "normal" as const,
  });

  if (actions.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
        Quick Actions
      </h4>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`w-full text-left px-2 py-2 text-sm rounded-md transition-colors ${
              action.priority === "high"
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardNavigation;
