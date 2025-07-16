"use client";
import { motion } from "framer-motion";
import { Target, Users, Trophy, TrendingUp } from "lucide-react";

export default function FaceitPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Target className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">
          Faceit Integration
          <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Coming Soon
          </span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect your Faceit account to display CS2 statistics, match history,
          and performance metrics in your OBS widgets.
        </p>
      </motion.div>

      {/* Feature Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Player Stats</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">Level 10</div>
          <p className="text-xs text-muted-foreground">
            Show your current level and ELO
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Recent Matches</h3>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">8W - 2L</div>
          <p className="text-xs text-muted-foreground">
            Display latest match results
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Team Performance</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">1.25 K/D</div>
          <p className="text-xs text-muted-foreground">
            Track performance metrics
          </p>
        </div>
      </motion.div>

      {/* Coming Soon Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border border-border rounded-lg p-8 text-center"
      >
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Faceit Integration In Development
        </h2>
        <p className="text-muted-foreground">
          We&apos;re working hard to bring you the best Faceit integration
          experience. Stay tuned for updates!
        </p>
      </motion.div>
    </div>
  );
}
