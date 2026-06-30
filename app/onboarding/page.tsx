"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

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

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Mock submit and redirect to home
      router.push("/");
    }
  };

  const handleBack = () => {
    if (step > 1) {
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
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          <Button onClick={handleNext}>
            {step === totalSteps ? "Finish" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
