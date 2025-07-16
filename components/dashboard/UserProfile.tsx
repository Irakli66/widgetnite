"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { User, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";

export function UserProfile() {
  const { data: session, status } = useSession();
  const { state } = useSidebar();

  if (status === "loading") {
    return <UserProfileSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const isCollapsed = state === "collapsed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 rounded-lg p-1 bg-card/50 border border-border/50"
    >
      <div className="relative">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User avatar"}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
      </div>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col min-w-0 flex-1"
        >
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {user.name || "User"}
            </span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex flex-col gap-1 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}
