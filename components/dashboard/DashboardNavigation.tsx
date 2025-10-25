"use client";

import { motion } from "framer-motion";
import { Target, ChevronRight, Zap } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  description?: string;
  isNew?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Faceit",
    icon: Target,
    href: "/dashboard/faceit",
    description: "Show CS2 stats and match history",
    isNew: false,
  },
  {
    title: "Clash Royale",
    icon: Target,
    href: "/dashboard/clash-royale",
    description: "Show Clash Royale stats and match history",
    isNew: true,
  },
];

export function DashboardNavigation() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup className="flex-1 min-h-0">
      <SidebarGroupLabel className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        {!isCollapsed && "Widgets"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <SidebarMenuItem key={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={
                      isCollapsed
                        ? `${item.title}${
                            item.description ? ` - ${item.description}` : ""
                          }`
                        : undefined
                    }
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          <div className="flex items-center gap-1">
                            {item.isNew && (
                              <span className="bg-secondary text-secondary-foreground h-5 px-1.5 text-xs rounded-md flex items-center">
                                New
                              </span>
                            )}
                            {item.badge && (
                              <span className="border border-border bg-background h-5 px-1.5 text-xs rounded-md flex items-center">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight className="h-3 w-3 opacity-50" />
                          </div>
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </motion.div>

                {!isCollapsed && item.description && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      height: isActive ? "auto" : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
