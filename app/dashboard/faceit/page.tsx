"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Target,
  Settings,
  Plus,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfileStore } from "@/store/useProfileStore";
import { useWidgetStore } from "@/store/useWidgetStore";
import WidgetCustomizer from "@/components/widgets/faceit/WidgetCustomizer";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function FaceitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    widgetId: string;
    widgetName: string;
  }>({
    open: false,
    widgetId: "",
    widgetName: "",
  });

  // Profile store
  const { userData, fetchUserData } = useProfileStore();

  // Widget store
  const {
    widgets,
    loading: widgetsLoading,
    creating,
    deleting,
    error: widgetsError,
    fetchWidgets,
    deleteWidget,
    clearError,
  } = useWidgetStore();

  // Fetch user data and widgets on component mount
  useEffect(() => {
    if (session?.user?.email && !userData) {
      fetchUserData(session.user.email);
    }
  }, [session?.user?.email, userData, fetchUserData]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchWidgets();
    }
  }, [session?.user?.email, fetchWidgets]);

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (widgetsError) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [widgetsError, clearError]);

  const handleDeleteWidget = (widgetId: string, widgetName: string) => {
    setConfirmDelete({
      open: true,
      widgetId,
      widgetName,
    });
  };

  const confirmDeleteWidget = async () => {
    try {
      await deleteWidget(confirmDelete.widgetId);
      toast.success("Widget deleted successfully!");
    } catch {
      toast.error("Failed to delete widget");
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Widget URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handleCreateNew = () => {
    setEditingWidget(null);
    setShowCustomizer(true);
  };

  const handleEditWidget = (widgetId: string) => {
    setEditingWidget(widgetId);
    setShowCustomizer(true);
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please sign in to manage your Faceit widgets
          </p>
        </div>
      </div>
    );
  }

  // No Faceit username - show overlay and redirect option
  if (!userData?.faceit) {
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
          <h1 className="text-4xl font-bold text-foreground">Faceit Widgets</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create customizable Faceit widgets to display your CS2 statistics
            and performance metrics.
          </p>
        </motion.div>

        {/* Setup Required Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                You need to set up your Faceit username in settings before
                creating widgets.
              </span>
              <Button
                onClick={() => router.push("/dashboard/settings")}
                size="sm"
                className="ml-4"
              >
                Go to Settings
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  // Show widget customizer
  if (showCustomizer) {
    return (
      <WidgetCustomizer
        faceitUsername={userData.faceit}
        editingWidgetId={editingWidget}
        onClose={() => {
          setShowCustomizer(false);
          setEditingWidget(null);
        }}
      />
    );
  }

  // Main dashboard with widgets list
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-foreground">Faceit Widgets</h1>
          <p className="text-muted-foreground mt-2">
            Manage your Faceit widgets for OBS and streaming
          </p>
        </div>
        <Button onClick={handleCreateNew} disabled={creating}>
          <Plus className="w-4 h-4 mr-2" />
          Create Widget
        </Button>
      </motion.div>

      {/* Status Messages */}
      {widgetsError && (
        <Alert variant="destructive">
          <AlertDescription>{widgetsError}</AlertDescription>
        </Alert>
      )}

      {/* Widgets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {widgetsLoading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading widgets...</div>
          </div>
        ) : widgets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No widgets created yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first Faceit widget to display your stats
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Widget
            </Button>
          </div>
        ) : (
          widgets.map((widget) => (
            <Card key={widget.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{widget.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditWidget(widget.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWidget(widget.id, widget.name)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {widget.compact ? "Compact" : "Detailed"} •{" "}
                  {widget.colorTheme} theme
                  {!widget.showProfile && " • No profile image"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="text-sm text-muted-foreground">
                  <div>
                    Username: {widget.faceitUsername || userData.faceit}
                  </div>
                  <div className="mt-1 break-all">{widget.widgetUrl}</div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(widget.widgetUrl)}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(widget.widgetUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
        title="Delete Widget"
        description={`Are you sure you want to delete "${confirmDelete.widgetName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={confirmDeleteWidget}
      />
    </div>
  );
}
