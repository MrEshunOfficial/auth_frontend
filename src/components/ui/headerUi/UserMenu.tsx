import React from "react";
import {
  Settings,
  UserIcon,
  LogOut,
  Shield,
  MapPin,
  MessageSquare,
  HelpCircle,
  Package,
  Sun,
  Moon,
  Monitor,
  Bell,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/api.types";
import { useTheme } from "next-themes";
import { getAvatarUrl } from "@/utils/getAvatarUrl";
import Link from "next/link";
import { motion } from "framer-motion";

// Theme Switcher Component
const ThemeSwitcher: React.FC = () => {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {theme === "light" && <Sun className="mr-2 h-4 w-4" />}
        {theme === "dark" && <Moon className="mr-2 h-4 w-4" />}
        {theme === "system" && <Monitor className="mr-2 h-4 w-4" />}
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

// Notification Button Component
const NotificationButton: React.FC = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
    >
      <Bell className="h-5 w-5" />
      <motion.div
        className="absolute -top-1 -right-1"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <Badge
          variant="destructive"
          className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg"
        >
          3
        </Badge>
      </motion.div>
    </Button>
  );
};

// User Menu Props Interface
interface UserMenuProps {
  user: User;
  userRoleDisplay: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  onLogout: () => void;
}

// User Menu Component
export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  userRoleDisplay,
  isAdmin,
  isSuperAdmin,
  onLogout,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Notification Button */}
      <NotificationButton />

      {/* User Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full p-0 hover:bg-accent"
            size="icon"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={getAvatarUrl(user?.avatar)}
                alt={user?.name || "User avatar"}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 p-2" align="end" sideOffset={8}>
          {/* User Info Header */}
          <DropdownMenuLabel className="p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || "Unknown User"}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "No email"}
                </p>
              </div>
              {user?.userRole !== "user" && (
                <p className="text-xs text-muted-foreground font-medium">
                  {userRoleDisplay}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Main Menu Items */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer">
                <UserIcon className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/requests" className="w-full cursor-pointer">
                <Package className="mr-3 h-4 w-4" />
                <span>Requests</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/messages" className="w-full cursor-pointer">
                <MessageSquare className="mr-3 h-4 w-4" />
                <span>Messages</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/location" className="w-full cursor-pointer">
                <MapPin className="mr-3 h-4 w-4" />
                <span>Location</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Theme Switcher */}
          <ThemeSwitcher />

          <DropdownMenuSeparator />

          {/* Settings and Support */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="w-full cursor-pointer">
                <Settings className="mr-3 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/help" className="w-full cursor-pointer">
                <HelpCircle className="mr-3 h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </DropdownMenuItem>

            {/* Admin Panel - Only for admins */}
            {(isAdmin || isSuperAdmin) && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="w-full cursor-pointer">
                  <Shield className="mr-3 h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={onLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
