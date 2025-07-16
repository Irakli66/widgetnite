"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";

interface ProfileProviderProps {
  children: React.ReactNode;
}

export default function ProfileProvider({ children }: ProfileProviderProps) {
  const { data: session, status } = useSession();
  const { userData, fetchUserData } = useProfileStore();

  useEffect(() => {
    // Auto-fetch user data when session becomes available and we don't have data yet
    if (session?.user?.email && !userData && status === "authenticated") {
      fetchUserData();
    }
  }, [session?.user?.email, userData, status, fetchUserData]);

  return <>{children}</>;
} 