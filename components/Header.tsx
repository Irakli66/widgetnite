"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <header className=" border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" color="white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                WidgetNite
              </span>
            </Link>
          </motion.div>
          <div className="flex gap-8 items-center">
            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:flex items-center gap-8"
            >
              <Link
                href="#features"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#platforms"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Platforms
              </Link>
            </motion.nav>
            <ThemeToggle />
            {/* Sign In button, only if not signed in */}
            {status !== "loading" && !session && (
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}

            {status !== "loading" && session && (
              <Button onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
