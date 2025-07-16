"use client";

import { motion } from "framer-motion";
import {
  Settings,
  LogOut,
  User,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface SettingsItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  description?: string;
  variant?: "default" | "destructive";
  external?: boolean;
}

const settingsItems: SettingsItem[] = [
  {
    title: "Profile Settings",
    icon: User,
    href: "/dashboard/settings",
    description: "Manage your account information",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/#",
    description: "Configure alert preferences",
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    href: "/#",
    description: "Security and privacy settings",
  },
  {
    title: "Help & Support",
    icon: HelpCircle,
    href: "/#",
    description: "Get help and documentation",
    external: true,
  },
];

export function DashboardSettings() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        {!isCollapsed && "Settings"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Theme Toggle */}
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <>
                    <div className="h-4 w-4 flex items-center justify-center">
                      🎨
                    </div>
                    <span className="text-sm font-medium">Theme</span>
                  </>
                )}
              </div>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>

          <Separator className="my-2" />

          {/* Settings Items */}
          {settingsItems.map((item, index) => (
            <SidebarMenuItem key={item.title}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <SidebarMenuButton
                  asChild={!!item.href}
                  tooltip={
                    isCollapsed
                      ? `${item.title}${
                          item.description ? ` - ${item.description}` : ""
                        }`
                      : undefined
                  }
                  onClick={item.onClick}
                >
                  {item.href ? (
                    <Link
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.external && (
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          )}
                        </>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="flex-1">{item.title}</span>
                      )}
                    </div>
                  )}
                </SidebarMenuButton>
              </motion.div>
            </SidebarMenuItem>
          ))}

          <Separator className="my-2" />

          {/* Sign Out */}
          <SidebarMenuItem>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <SidebarMenuButton
                onClick={handleSignOut}
                tooltip={isCollapsed ? "Sign out of your account" : undefined}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                {!isCollapsed && <span>Sign Out</span>}
              </SidebarMenuButton>
            </motion.div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
