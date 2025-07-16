"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { UserProfile } from "./UserProfile";
import { DashboardNavigation } from "./DashboardNavigation";
import { DashboardSettings } from "./DashboardSettings";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-2 py-1"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-foreground group-data-[collapsible=icon]:hidden">
              WidgetNite
            </span>
          </Link>
        </motion.div>

        <SidebarSeparator />

        {/* User Profile */}
        <UserProfile />
      </SidebarHeader>

            <SidebarContent className="gap-0 overflow-hidden">
        {/* Navigation */}
        <DashboardNavigation />
      </SidebarContent>

      <SidebarFooter>
        {/* Settings */}
        <DashboardSettings />
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h1 className="text-lg font-semibold text-foreground">
                Dashboard
              </h1>
            </motion.div>
          </div>

          {/* Additional header content can go here */}
          <div className="flex items-center gap-2">
            {/* Future: Notifications, Quick actions, etc. */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="container mx-auto p-6"
          >
            {children}
          </motion.div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
