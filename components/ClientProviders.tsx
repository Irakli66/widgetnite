"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/providers/theme-provider";
import ProfileProvider from "@/providers/profile-provider";

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
        <ProfileProvider>{children}</ProfileProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
