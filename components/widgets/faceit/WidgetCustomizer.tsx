"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Copy, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWidgetStore } from "@/store/useWidgetStore";
import { widgetFormSchema } from "@/lib/validations/widget";
import { ZodError } from "zod";
import FaceitStats from "./FaceitStats";

interface WidgetCustomizerProps {
  faceitUsername: string;
  editingWidgetId?: string | null;
  onClose: () => void;
}

export default function WidgetCustomizer({
  faceitUsername,
  editingWidgetId,
  onClose,
}: WidgetCustomizerProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");

  const {
    widgets,
    creating,
    updating,
    error,
    customizationForm,
    updateCustomizationField,
    resetCustomizationForm,
    setCustomizationFromWidget,
    generateWidgetUrl,
    createWidget,
    updateWidget,
    clearError,
  } = useWidgetStore();

  // Initialize form
  useEffect(() => {
    if (editingWidgetId) {
      const widget = widgets.find((w) => w.id === editingWidgetId);
      if (widget) {
        setCustomizationFromWidget(widget);
      }
    } else {
      resetCustomizationForm();
      updateCustomizationField("faceitUsername", faceitUsername);
    }
  }, [
    editingWidgetId,
    widgets,
    setCustomizationFromWidget,
    resetCustomizationForm,
    updateCustomizationField,
    faceitUsername,
  ]);

  // Generate URL when form changes
  useEffect(() => {
    const url = generateWidgetUrl();
    setGeneratedUrl(url);
  }, [customizationForm, generateWidgetUrl]);

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSave = async () => {
    try {
      // Validate form data
      const validatedData = widgetFormSchema.parse(customizationForm);

      if (editingWidgetId) {
        await updateWidget(editingWidgetId, validatedData);
        toast.success("Widget updated successfully!");
      } else {
        await createWidget({
          type: "faceit-stats",
          ...validatedData,
        });
        toast.success("Widget created successfully!");
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod validation error
        const firstError = error.issues[0];
        toast.error(firstError?.message || "Please check your form data");
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to save widget");
      } else {
        toast.error("Failed to save widget");
      }
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success("Widget URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handlePreview = () => {
    window.open(generatedUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {editingWidgetId ? "Edit Widget" : "Create Widget"}
          </h1>
          <p className="text-muted-foreground">
            Customize your Faceit widget appearance and settings
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>
                Configure the basic widget properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget Name</Label>
                <Input
                  id="widget-name"
                  placeholder="My Faceit Widget"
                  value={customizationForm.name}
                  onChange={(e) =>
                    updateCustomizationField("name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faceit-username">Faceit Username</Label>
                <Input
                  id="faceit-username"
                  placeholder={faceitUsername}
                  value={customizationForm.faceitUsername}
                  onChange={(e) =>
                    updateCustomizationField("faceitUsername", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use your profile&apos;s Faceit username
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how your widget looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="color-theme">Color Theme</Label>
                <Select
                  value={customizationForm.colorTheme}
                  onValueChange={(value) =>
                    updateCustomizationField("colorTheme", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue (Default)</SelectItem>
                    <SelectItem value="violet">Violet</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show only the header without detailed stats
                  </p>
                </div>
                <Switch
                  checked={customizationForm.compact}
                  onCheckedChange={(checked) =>
                    updateCustomizationField("compact", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Profile Image</Label>
                  <p className="text-sm text-muted-foreground">
                    Display the player&apos;s avatar and profile info
                  </p>
                </div>
                <Switch
                  checked={customizationForm.showProfile}
                  onCheckedChange={(checked) =>
                    updateCustomizationField("showProfile", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Widget URL */}
          <Card>
            <CardHeader>
              <CardTitle>Widget URL</CardTitle>
              <CardDescription>
                Copy this URL to use in OBS or other streaming software
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={generatedUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePreview}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={creating || updating}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {creating || updating
                ? "Saving..."
                : editingWidgetId
                ? "Update Widget"
                : "Save Widget"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This is how your widget will appear
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-muted/30">
              <FaceitStats
                faceitUsername={
                  customizationForm.faceitUsername || faceitUsername
                }
                compact={customizationForm.compact}
                colorTheme={customizationForm.colorTheme}
                showProfile={customizationForm.showProfile}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
