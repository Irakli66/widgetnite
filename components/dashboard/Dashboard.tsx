"use client";

import { Button } from "../ui/button";
import { motion } from "framer-motion";
import {
  Zap,
  Users,
  TrendingUp,
  Target,
  Link,
  ArrowRight,
  Plus,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to your
          <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Widget Dashboard
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create and manage stunning OBS widgets for your streaming setup.
          Connect your platforms and start building amazing content.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Widgets</h3>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Start creating your first widget
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Connected Platforms</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Connect your streaming accounts
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Widget Views</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Track your widget engagement
          </p>
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-foreground">Get Started</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card border border-border rounded-lg relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Connect Faceit</h3>
                  <p className="text-sm text-muted-foreground">
                    Link your Faceit account to display CS2 stats
                  </p>
                </div>
              </div>
              <Button asChild className="w-full group/button">
                <Link href="/dashboard/faceit">
                  Connect Faceit Account
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="bg-card border border-border rounded-lg relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Create Widget</h3>
                  <p className="text-sm text-muted-foreground">
                    Build your first OBS widget in minutes
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full group/button">
                Create New Widget
                <Plus className="h-4 w-4 ml-2 transition-transform group-hover/button:scale-110" />
              </Button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-foreground">Recent Activity</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No recent activity yet</p>
            <p className="text-sm text-muted-foreground">
              Your widget creation and platform connections will appear here
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
