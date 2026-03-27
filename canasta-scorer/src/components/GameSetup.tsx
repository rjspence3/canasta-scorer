"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GameSetupProps {
  onStart: (teamNames: [string, string], targetScore: number) => void;
}

export function GameSetup({ onStart }: GameSetupProps) {
  const [team1, setTeam1] = useState("Team 1");
  const [team2, setTeam2] = useState("Team 2");
  const [targetScore, setTargetScore] = useState(5000);

  const handleStart = () => {
    const t1 = team1.trim() || "Team 1";
    const t2 = team2.trim() || "Team 2";
    onStart([t1, t2], targetScore);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">🃏</div>
          <CardTitle className="text-2xl font-bold">Canasta Scorer</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Classic Partnership Canasta
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="team1">Team 1 Name</Label>
            <Input
              id="team1"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              placeholder="Team 1"
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team2">Team 2 Name</Label>
            <Input
              id="team2"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              placeholder="Team 2"
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target">Target Score</Label>
            <div className="flex gap-2">
              {[5000, 8500].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setTargetScore(score)}
                  className={`flex-1 h-11 rounded-md border text-sm font-medium transition-colors ${
                    targetScore === score
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent"
                  }`}
                >
                  {score.toLocaleString()}
                </button>
              ))}
              <Input
                id="target"
                type="number"
                value={targetScore}
                onChange={(e) =>
                  setTargetScore(Number(e.target.value) || 5000)
                }
                className="w-24 text-base"
                min={1000}
                step={500}
              />
            </div>
          </div>

          <Button
            onClick={handleStart}
            size="xl"
            className="w-full mt-2 text-lg font-semibold"
          >
            Start Game
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1 pt-1">
            <p>Card values: Joker 50 • 2 or A 20 • K–8 10 • 7–4 or ♣♠3 5</p>
            <p>Natural canasta 500 • Mixed canasta 300</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
