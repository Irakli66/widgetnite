"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Custom404() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-foreground">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-6xl font-bold mb-4"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg text-muted-foreground mb-6 max-w-md"
      >
        Sorry, we couldn’t find the page you’re looking for.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex gap-4"
      >
        <Link href="/">
          <Button variant="default" size="lg">
            Go Home
          </Button>
        </Link>
      </motion.div>
    </main>
  );
}
