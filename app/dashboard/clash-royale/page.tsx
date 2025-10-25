"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  RotateCcw,
  Swords,
  Target,
  TrendingUp,
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
import { useClashRoyaleStore } from "@/store/useClashRoyaleStore";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function ClashRoyalePage() {
  const { data: session, status } = useSession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    challengeId: string;
    challengeName: string;
  }>({
    open: false,
    challengeId: "",
    challengeName: "",
  });
  const [confirmReset, setConfirmReset] = useState<{
    open: boolean;
    challengeId: string;
  }>({
    open: false,
    challengeId: "",
  });

  const {
    challenges,
    loading,
    creating,
    deleting,
    recording,
    error,
    fetchChallenges,
    createChallenge,
    deleteChallenge,
    recordWin,
    recordLoss,
    resetAttempt,
    clearError,
    challengeForm,
    updateChallengeField,
    resetChallengeForm,
  } = useClashRoyaleStore();

  useEffect(() => {
    if (session?.user?.email) {
      fetchChallenges();
    }
  }, [session?.user?.email, fetchChallenges]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateChallenge = async () => {
    try {
      const challenge = await createChallenge(challengeForm);
      if (challenge) {
        toast.success("Challenge created successfully!");
        setShowCreateDialog(false);
        resetChallengeForm();
      }
    } catch {
      toast.error("Failed to create challenge");
    }
  };

  const handleDeleteChallenge = (challengeId: string, challengeName: string) => {
    setConfirmDelete({
      open: true,
      challengeId,
      challengeName,
    });
  };

  const confirmDeleteChallenge = async () => {
    try {
      await deleteChallenge(confirmDelete.challengeId);
      toast.success("Challenge deleted successfully!");
    } catch {
      toast.error("Failed to delete challenge");
    }
  };

  const handleRecordWin = async (challengeId: string) => {
    try {
      await recordWin(challengeId);
      toast.success("Win recorded! 🎉");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record win";
      toast.error(message);
    }
  };

  const handleRecordLoss = async (challengeId: string) => {
    try {
      await recordLoss(challengeId);
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge && challenge.currentLosses + 1 >= challenge.maxLosses) {
        toast.error("Challenge attempt ended! 😢");
      } else {
        toast.warning("Loss recorded");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to record loss";
      toast.error(message);
    }
  };

  const handleResetAttempt = (challengeId: string) => {
    setConfirmReset({
      open: true,
      challengeId,
    });
  };

  const confirmResetAttempt = async () => {
    try {
      await resetAttempt(confirmReset.challengeId);
      toast.success("Challenge reset! Good luck! 🍀");
    } catch {
      toast.error("Failed to reset challenge");
    }
  };

  const handleCopyUrl = async (challengeId: string) => {
    const url = `${window.location.origin}/widget/clashRoyale?id=${challengeId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Widget URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handleOpenWidget = (challengeId: string) => {
    const url = `${window.location.origin}/widget/clashRoyale?id=${challengeId}`;
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
          <h3 className="text-lg font-semibold mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground">
            Please sign in to manage your Clash Royale challenges
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Trophy className="h-10 w-10 text-primary" />
            Clash Royale Challenges
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your challenge progress and stats
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          disabled={creating}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Challenges List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading challenges...</div>
          </div>
        ) : challenges.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No challenges created yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first challenge to start tracking your progress
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Challenge
            </Button>
          </div>
        ) : (
          challenges.map((challenge) => {
            const isAttemptOver = challenge.currentLosses >= challenge.maxLosses;
            const progressPercent = (challenge.currentWins / challenge.winGoal) * 100;

            return (
              <Card key={challenge.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChallenge(challenge.id, challenge.name)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Goal: {challenge.winGoal} wins • Max: {challenge.maxLosses} losses
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Current Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Current Run</span>
                      <span className={`text-lg font-bold ${isAttemptOver ? 'text-destructive' : 'text-primary'}`}>
                        {challenge.currentWins}-{challenge.currentLosses}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isAttemptOver ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Best Run */}
                  {challenge.bestWins > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-3 h-3" />
                        Best Run
                      </span>
                      <span className="font-semibold text-primary">
                        {challenge.bestWins}-{challenge.bestLosses}
                      </span>
                    </div>
                  )}

                  {/* Total Attempts */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-3 h-3" />
                      Total Attempts
                    </span>
                    <span className="font-semibold">{challenge.totalAttempts}</span>
                  </div>

                  {/* Win/Loss Buttons */}
                  {isAttemptOver ? (
                    <Alert>
                      <AlertDescription className="text-center">
                        Attempt ended. Reset to continue.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleRecordWin(challenge.id)}
                        disabled={recording}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        Win
                      </Button>
                      <Button
                        onClick={() => handleRecordLoss(challenge.id)}
                        disabled={recording}
                        variant="destructive"
                      >
                        <Swords className="w-4 h-4 mr-1" />
                        Loss
                      </Button>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetAttempt(challenge.id)}
                    disabled={recording}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyUrl(challenge.id)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenWidget(challenge.id)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </motion.div>

      {/* Create Challenge Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Set up your Clash Royale challenge parameters
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Challenge Name</Label>
              <Input
                id="name"
                placeholder="e.g., 20 Win Challenge"
                value={challengeForm.name}
                onChange={(e) => updateChallengeField("name", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="winGoal">Win Goal</Label>
              <Input
                id="winGoal"
                type="number"
                min="1"
                value={challengeForm.winGoal}
                onChange={(e) => updateChallengeField("winGoal", parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxLosses">Max Losses</Label>
              <Input
                id="maxLosses"
                type="number"
                min="1"
                value={challengeForm.maxLosses}
                onChange={(e) => updateChallengeField("maxLosses", parseInt(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetChallengeForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChallenge}
              disabled={creating || !challengeForm.name}
            >
              {creating ? "Creating..." : "Create Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((prev) => ({ ...prev, open }))}
        title="Delete Challenge"
        description={`Are you sure you want to delete "${confirmDelete.challengeName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={confirmDeleteChallenge}
      />

      {/* Reset Confirmation */}
      <ConfirmDialog
        open={confirmReset.open}
        onOpenChange={(open) => setConfirmReset((prev) => ({ ...prev, open }))}
        title="Reset Challenge"
        description="Are you sure you want to reset this challenge attempt? The current progress will be saved to statistics."
        confirmText="Reset"
        cancelText="Cancel"
        loading={recording}
        onConfirm={confirmResetAttempt}
      />
    </div>
  );
}
