"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useProfileStore } from "@/store/useProfileStore";
import ProfileInfo from "./ProfileInfo";
import FaceitSettings from "./FaceitSettings";
import TwitchSettings from "./TwitchSettings";
import KickSettings from "./KickSettings";

export default function Settings() {
  const { data: session, status } = useSession();
  
  // Zustand store
  const {
    userData,
    loading,
    updating,
    error,
    success,
    formData,
    formInitialized,
    fetchUserData,
    updateFormField,
    updateProfile,
    resetForm,
    hasChanges,
    initializeForm,
  } = useProfileStore();

  // Initialize form when userData becomes available but form isn't initialized yet
  useEffect(() => {
    if (userData && !formInitialized) {
      initializeForm(userData);
    }
  }, [userData, formInitialized, initializeForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile();
  };

  const handleRetry = () => {
    if (session?.user?.email) {
      fetchUserData(session.user.email);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please sign in to view your settings</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading user data...</div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No user data found</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and gaming platform connections
        </p>
      </div>

      <Separator />

      {/* Profile Information */}
      <ProfileInfo userData={userData} />

      <Separator />

      {/* Gaming Platform Connections */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Gaming Platform Connections</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Connect your gaming and streaming accounts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Faceit */}
          <FaceitSettings
            faceit={formData.faceit}
            faceitId={formData.faceitId}
            onFaceitChange={(value) => updateFormField('faceit', value)}
            onFaceitIdChange={(value) => updateFormField('faceitId', value)}
          />

          {/* Twitch */}
          <TwitchSettings
            twitch={formData.twitch}
            onTwitchChange={(value) => updateFormField('twitch', value)}
          />

          {/* Kick */}
          <KickSettings
            kick={formData.kick}
            onKickChange={(value) => updateFormField('kick', value)}
          />

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={updating || !hasChanges()}
              className="min-w-[120px]"
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
            
            {hasChanges() && (
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
