"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    name: "",
    readingGoal: "",
    roomName: "My First Room",
    roomColor: "#D4AF37",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    if (step < totalSteps) {
      if (step === 1 && !formData.name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (step === 2 && (!formData.readingGoal || parseInt(formData.readingGoal) <= 0)) {
        setError("Please enter a valid reading goal.");
        return;
      }
      setError(null);
      setStep(step + 1);
    } else {
      if (!formData.roomName.trim()) {
        setError("Please enter a room name.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // 1. Update user profile name
        const userRes = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name }),
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
            name: formData.roomName,
            cover_color: formData.roomColor,
            description: "My first reading room, created during onboarding.",
          }),
        });

        if (!roomRes.ok) {
          const errData = await roomRes.json();
          throw new Error(errData.error || "Failed to create your first room.");
        }

        setError(null);
        router.push("/");
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during onboarding.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError(null);
      setStep(step - 1);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4">
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
          <CardTitle className="font-heading text-2xl">
            {step === 1 && "Welcome to The Reading Room"}
            {step === 2 && "Set Your Reading Goal"}
            {step === 3 && "Create Your First Room"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's personalize your reading experience."}
            {step === 2 && "How much do you want to read?"}
            {step === 3 && "Rooms are themed shelves for your articles."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Target articles per week</Label>
                <Input
                  id="goal"
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={formData.readingGoal}
                  onChange={(e) => setFormData({ ...formData, readingGoal: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g. Technology, Philosophy, Fiction"
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomColor">Cover Color</Label>
                <div className="flex gap-2">
                  {["#D4AF37", "#2DD4BF", "#FB923C", "#818CF8", "#F472B6"].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${formData.roomColor === color ? 'border-primary' : 'border-transparent'}`}
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
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || isLoading}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : step === totalSteps ? (
              "Finish"
            ) : (
              "Next"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
