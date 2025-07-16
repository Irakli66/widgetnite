"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";

interface ProfileProviderProps {
  children: React.ReactNode;
}

export default function ProfileProvider({ children }: ProfileProviderProps) {
  const { data: session, status } = useSession();
  const { 
    userData, 
    userEmail,
    fetchUserData, 
    checkAndClearIfDifferentUser 
  } = useProfileStore();

  useEffect(() => {
    const currentUserEmail = session?.user?.email || null;

    // First, check if we need to clear data for a different user
    checkAndClearIfDifferentUser(currentUserEmail);

    // Then fetch data if we have a user but no data, or if user has changed
    if (currentUserEmail && status === "authenticated") {
      // Fetch if we don't have data, or if the data is for a different user
      if (!userData || userEmail !== currentUserEmail) {
        console.log('Fetching user data for:', currentUserEmail);
        fetchUserData(currentUserEmail);
      }
    }
  }, [
    session?.user?.email, 
    status, 
    userData, 
    userEmail,
    fetchUserData, 
    checkAndClearIfDifferentUser
  ]);

  return <>{children}</>;
} 