"use client";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/models";

interface ProfileInfoProps {
  userData: User;
}

export default function ProfileInfo({ userData }: ProfileInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
          <p className="text-sm font-mono">{userData.email}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Name</Label>
          <p className="text-sm">{userData.name || 'Not set'}</p>
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm font-medium text-muted-foreground">Member since</Label>
          <p className="text-sm">{new Date(userData.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
} 