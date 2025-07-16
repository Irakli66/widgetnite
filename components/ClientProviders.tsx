"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/theme-provider";
import ProfileProvider from "@/providers/profile-provider";
import { Toaster } from "@/components/ui/sonner";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ProfileProvider>
          {children}
          <Toaster />
        </ProfileProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
