"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Coins, Plus, ExternalLink, Copy, Trash2, Settings, TrendingUp, TrendingDown, Target, Percent, Award, Zap } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBonusHuntStore } from "@/store/useBonusHuntStore";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import BonusHuntManager from "@/components/bonus-hunt/BonusHuntManager";

interface HuntStats {
  totalHunts: number;
  completedHunts: number;
  inProgressHunts: number;
  notStartedHunts: number;
  totalCost: number;
  totalWinnings: number;
  netProfit: number;
  profitPercentage: number;
  profitHunts: number;
  noProfitHunts: number;
  profitRate: number;
  totalBonuses: number;
  openedBonuses: number;
  unopenedBonuses: number;
  avgMultiplier: number;
  bestWin: number;
  bestMultiplier: number;
}

function BonusHuntContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const huntId = searchParams.get("id");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stats, setStats] = useState<HuntStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    huntId: string;
    huntName: string;
  }>({
    open: false,
    huntId: "",
    huntName: "",
  });

  const {
    hunts,
    loading,
    creating,
    deleting,
    error,
    huntForm,
    fetchHunts,
    createHunt,
    deleteHunt,
    updateHuntField,
    resetHuntForm,
    clearError,
  } = useBonusHuntStore();

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/bonus-hunt/stats");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchHunts();
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email, fetchHunts]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateHunt = async () => {
    if (!huntForm.name || huntForm.startBalance <= 0) {
      toast.error("Please enter a valid name and start balance");
      return;
    }

    try {
      const hunt = await createHunt({
        name: huntForm.name,
        startBalance: huntForm.startBalance,
      });
      if (hunt) {
        toast.success("Hunt created successfully!");
        setShowCreateDialog(false);
        resetHuntForm();
        fetchStats(); // Refresh stats
        router.push(`/dashboard/bonus-hunt?id=${hunt.id}`);
      }
    } catch {
      toast.error("Failed to create hunt");
    }
  };

  const handleDeleteHunt = (huntId: string, huntName: string) => {
    setConfirmDelete({
      open: true,
      huntId,
      huntName,
    });
  };

  const confirmDeleteHunt = async () => {
    try {
      await deleteHunt(confirmDelete.huntId);
      toast.success("Hunt deleted successfully!");
      fetchStats(); // Refresh stats
    } catch {
      toast.error("Failed to delete hunt");
    }
  };

  const handleCopyUrl = async (huntId: string) => {
    const url = `${window.location.origin}/widget/bonus-hunt/${huntId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Widget URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handleOpenWidget = (huntId: string) => {
    const url = `${window.location.origin}/widget/bonus-hunt/${huntId}`;
    window.open(url, "_blank");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">
            Please sign in to manage your bonus hunts
          </p>
        </div>
      </div>
    );
  }

  if (huntId) {
    return <BonusHuntManager huntId={huntId} />;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Coins className="h-10 w-10 text-primary" />
            Bonus Hunts
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your slot bonus hunts and payouts
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} disabled={creating}>
          <Plus className="w-4 h-4 mr-2" />
          Create Hunt
        </Button>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      {stats && !statsLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Total Hunts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hunts</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHunts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedHunts} completed • {stats.inProgressHunts} active
              </p>
            </CardContent>
          </Card>

          {/* Total Cost vs Winnings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Won: ${stats.totalWinnings.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Net Profit/Loss */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Result</CardTitle>
              {stats.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.netProfit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.netProfit >= 0 ? "+" : ""}${stats.netProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.profitPercentage >= 0 ? "+" : ""}
                {stats.profitPercentage.toFixed(1)}% return
              </p>
            </CardContent>
          </Card>

          {/* Profit Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.profitRate.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.profitHunts} profit • {stats.noProfitHunts} no profit
              </p>
            </CardContent>
          </Card>

          {/* Best Win */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Win</CardTitle>
              <Award className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                ${stats.bestWin.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Highest single payout
              </p>
            </CardContent>
          </Card>

          {/* Best Multiplier */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Multi</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {stats.bestMultiplier.toFixed(2)}x
              </div>
              <p className="text-xs text-muted-foreground">
                Highest multiplier hit
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading hunts...</div>
          </div>
        ) : hunts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hunts created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first bonus hunt to start tracking
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Hunt
            </Button>
          </div>
        ) : (
          hunts.map((hunt) => (
            <Card key={hunt.id} className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{hunt.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHunt(hunt.id, hunt.name)}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  Start Balance: ${hunt.startBalance.toFixed(2)}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created {new Date(hunt.createdAt).toLocaleDateString()}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/bonus-hunt?id=${hunt.id}`)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(hunt.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenWidget(hunt.id)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </motion.div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Bonus Hunt</DialogTitle>
            <DialogDescription>
              Set up your bonus hunt with a starting balance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Hunt Name</Label>
              <Input
                id="name"
                placeholder="e.g., Saturday Night Hunt"
                value={huntForm.name}
                onChange={(e) => updateHuntField("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startBalance">Start Balance ($)</Label>
              <Input
                id="startBalance"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="500.00"
                value={huntForm.startBalance || ""}
                onChange={(e) =>
                  updateHuntField("startBalance", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetHuntForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateHunt}
              disabled={creating || !huntForm.name}
            >
              {creating ? "Creating..." : "Create Hunt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
        title="Delete Hunt"
        description={`Are you sure you want to delete "${confirmDelete.huntName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={confirmDeleteHunt}
      />
    </div>
  );
}

export default function BonusHuntPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <BonusHuntContent />
    </Suspense>
  );
}
