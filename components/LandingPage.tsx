"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Monitor,
  Palette,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import Header from "./Header";

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay?: number;
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 hover:shadow-lg transition-all duration-300"
  >
    <div className="relative z-10">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </motion.div>
);

const PlatformBadge = ({
  name,
  delay = 0,
}: {
  name: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className="inline-flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground border border-border/50"
  >
    <div className="h-2 w-2 rounded-full bg-primary" />
    {name}
  </motion.div>
);

export default function LandingPage() {
  const features = [
    {
      icon: Monitor,
      title: "Live Stream Integration",
      description:
        "Seamlessly integrate with Twitch, Kick, and other streaming platforms for real-time data display.",
    },
    {
      icon: Palette,
      title: "Custom Styling",
      description:
        "Fully customizable widgets with colors, fonts, and animations to match your brand.",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description:
        "Instant updates for follower counts, song changes, game stats, and more.",
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description:
        "Track widget performance and viewer engagement with detailed analytics.",
    },
  ];

  const platforms = ["Twitch", "Kick", "Spotify", "Faceit", "Steam", "Discord"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <Header />

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl"
            >
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Create
                <span className="relative mx-3">
                  <span className="relative z-10 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    stunning
                  </span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute bottom-1 left-0 h-3 w-full bg-primary/20 origin-left"
                  />
                </span>
                OBS widgets
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            >
              Elevate your streaming experience with custom widgets for Twitch,
              Kick, Spotify, and more. No coding required – just drag, drop, and
              go live.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/dashboard">
                <Button className="">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button className="" variant="outline">
                <Monitor className="h-4 w-4" />
                Watch Demo
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Supports All Your Favorite Platforms
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect with the platforms you use most
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {platforms.map((platform, index) => (
                <PlatformBadge
                  key={platform}
                  name={platform}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to create amazing widgets
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools and integrations to make your stream stand out from
              the crowd
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to transform your stream?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of streamers who trust WidgetNite for their OBS
              widgets
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="button group inline-flex items-center gap-2 text-lg font-medium px-8 py-4">
                Start Creating Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-current text-primary" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>Instant setup</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-3 w-3" />
              </div>
              <span className="text-lg font-bold text-foreground">
                WidgetNite
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 WidgetNite. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
