"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Loader2, Library, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    name: "",
    readingGoal: "5",
    roomName: "My First Room",
    roomColor: "#D4AF37",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = async (isSkip = false) => {
    let finalName = formData.name;
    let finalRoomName = formData.roomName;

    if (isSkip) {
      if (!finalName.trim()) finalName = "Reader";
      if (!finalRoomName.trim()) finalRoomName = "My Library";
    } else {
      if (!formData.roomName.trim()) {
        setError("Please enter a room name.");
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Update user profile name
      const userRes = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: finalName }),
      });

      if (!userRes.ok) {
        const errData = await userRes.json();
        throw new Error(errData.error || "Failed to save user name.");
      }

      // 2. Create the first room
      const roomRes = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalRoomName,
          cover_color: formData.roomColor,
          description: "My first reading room, created during onboarding.",
        }),
      });

      if (!roomRes.ok) {
        const errData = await roomRes.json();
        throw new Error(errData.error || "Failed to create your first room.");
      }

      setError(null);
      router.push("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during onboarding.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      if (step === 4 && !formData.name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (step === 5 && (!formData.readingGoal || Number.parseInt(formData.readingGoal) <= 0)) {
        setError("Please enter a valid reading goal.");
        return;
      }
      setError(null);
      setStep(step + 1);
    } else {
      await submitForm(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    submitForm(true);
  };

  let buttonContent: React.ReactNode = "Next";
  if (isLoading) {
    buttonContent = (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    );
  } else if (step === totalSteps) {
    buttonContent = "Finish";
  } else if (step < 4) {
    buttonContent = (
      <>
        Continue <ArrowRight className="ml-2 w-4 h-4" />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-zinc-50/50 relative">
      {/* Skip button in header */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900" onClick={handleSkip} disabled={isLoading}>
          Skip Setup
        </Button>
      </div>

      <Card className="w-full max-w-lg shadow-lg border-zinc-200/60 overflow-hidden">
        <CardHeader className="bg-white pb-6">
          <div className="mb-6">
            <Progress value={(step / totalSteps) * 100} className="h-1.5" />
          </div>
          <CardTitle className="font-heading text-2xl tracking-tight text-zinc-900 text-center">
            {step === 1 && "Welcome to The Reading Room"}
            {step === 2 && "Curate Your Library"}
            {step === 3 && "The Vocabulary Vault"}
            {step === 4 && "Make It Yours"}
            {step === 5 && "Set Your Reading Goal"}
            {step === 6 && "Create Your First Room"}
          </CardTitle>
          <CardDescription className="text-center text-zinc-500 max-w-[280px] mx-auto mt-2">
            {step === 1 && "A smart, AI-powered space for organizing and synthesizing your knowledge."}
            {step === 2 && "Save articles, highlight key insights, and organize them into beautiful themed rooms."}
            {step === 3 && "Your personal AI automatically builds a vocabulary vault from the concepts you interact with."}
            {step === 4 && "Let's personalize your reading experience."}
            {step === 5 && "How many articles do you want to read each week?"}
            {step === 6 && "Rooms are themed shelves for your articles."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 min-h-[180px] flex flex-col justify-center bg-zinc-50/30">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="flex justify-center items-center py-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex justify-center items-center py-6">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <Library className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex justify-center items-center py-6">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <BookOpen className="w-12 h-12 text-indigo-500" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-700">What should we call you?</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  className="bg-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-zinc-700">Target articles per week</Label>
                <Input
                  id="goal"
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={formData.readingGoal}
                  onChange={(e) => setFormData({ ...formData, readingGoal: e.target.value })}
                  disabled={isLoading}
                  className="bg-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-zinc-700">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g. Technology, Philosophy, Fiction"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  disabled={isLoading}
                  className="bg-white"
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="roomColor" className="text-zinc-700">Cover Color</Label>
                <div className="flex gap-3">
                  {["#D4AF37", "#2DD4BF", "#FB923C", "#818CF8", "#F472B6"].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${formData.roomColor === color ? 'border-zinc-900 scale-110 ring-2 ring-zinc-200 ring-offset-2' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, roomColor: color })}
                      aria-label={`Select color ${color}`}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-zinc-50/30 pb-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || isLoading} className="w-[100px] bg-white">
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading} className="w-[120px]">
            {buttonContent}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
