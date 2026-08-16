"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Evaluation {
  id: string;
  name: string;
  weight: number;
  score: number;
}

export function TargetGradeCalculator() {
  const [courseName, setCourseName] = useState("");
  const [targetScore, setTargetScore] = useState<number | "">("");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [remainingWeight, setRemainingWeight] = useState<number | "">("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("learny_target_grades");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.courseName) setCourseName(parsed.courseName);
        if (parsed.targetScore) setTargetScore(parsed.targetScore);
        if (parsed.evaluations) setEvaluations(parsed.evaluations);
        if (parsed.remainingWeight) setRemainingWeight(parsed.remainingWeight);
      } catch (e) {
        console.error("Failed to parse saved target grades", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("learny_target_grades", JSON.stringify({
        courseName, targetScore, evaluations, remainingWeight
      }));
    }
  }, [courseName, targetScore, evaluations, remainingWeight, mounted]);

  const addEvaluation = () => {
    setEvaluations([
      ...evaluations,
      { id: crypto.randomUUID(), name: "", weight: 0, score: 0 }
    ]);
  };

  const removeEvaluation = (id: string) => {
    setEvaluations(evaluations.filter(e => e.id !== id));
  };

  const updateEvaluation = (id: string, field: keyof Evaluation, value: string | number) => {
    setEvaluations(evaluations.map(e => {
      if (e.id === id) {
        return { ...e, [field]: value };
      }
      return e;
    }));
  };

  const currentWeightedScore = evaluations.reduce((acc, curr) => {
    return acc + (curr.weight * curr.score) / 100;
  }, 0);

  const totalCurrentWeight = evaluations.reduce((acc, curr) => acc + curr.weight, 0);
  
  const totalWeight = totalCurrentWeight + (Number(remainingWeight) || 0);

  let requiredScore = 0;
  let feasibility: "achievable" | "challenging" | "impossible" | null = null;
  let feasibilityMessage = "";

  if (targetScore !== "" && remainingWeight !== "" && Number(remainingWeight) > 0) {
    const target = Number(targetScore);
    const remainingW = Number(remainingWeight);
    
    // Calculate required score on remaining weight to reach target
    requiredScore = ((target - currentWeightedScore) / remainingW) * 100;
    
    if (requiredScore > 100) {
      feasibility = "impossible";
      feasibilityMessage = "Mathematically impossible - target too high";
    } else if (requiredScore > 85) {
      feasibility = "challenging";
      feasibilityMessage = `Challenging - need ${requiredScore.toFixed(1)}%`;
    } else if (requiredScore <= 100 && requiredScore >= 0) {
      feasibility = "achievable";
      feasibilityMessage = `Achievable - need ${requiredScore.toFixed(1)}%`;
    } else {
      feasibility = "achievable";
      feasibilityMessage = "Target already achieved!";
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="course">Course Name</Label>
          <Input 
            id="course" 
            placeholder="e.g. CS 101" 
            value={courseName} 
            onChange={e => setCourseName(e.target.value)} 
            className="bg-zinc-950 border-zinc-800"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target">Target Grade (%)</Label>
          <Input 
            id="target" 
            type="number" 
            placeholder="e.g. 85" 
            value={targetScore} 
            onChange={e => setTargetScore(e.target.value ? Number(e.target.value) : "")}
            className="bg-zinc-950 border-zinc-800" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-200">Current Evaluations</h3>
          <Button onClick={addEvaluation} variant="outline" size="sm" className="gap-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:text-white">
            <Plus className="h-4 w-4" /> Add Evaluation
          </Button>
        </div>

        {evaluations.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 border-dashed p-8 text-center text-zinc-500">
            No evaluations added yet. Add your completed assignments or exams to start calculating.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-4 px-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              <div>Name</div>
              <div>Weight (%)</div>
              <div>Score (%)</div>
              <div></div>
            </div>
            {evaluations.map((evaluation) => (
              <div key={evaluation.id} className="grid grid-cols-[1fr_100px_100px_40px] gap-4 items-center">
                <Input
                  value={evaluation.name}
                  onChange={(e) => updateEvaluation(evaluation.id, "name", e.target.value)}
                  placeholder="e.g. Midsem"
                  className="bg-zinc-950 border-zinc-800"
                />
                <Input
                  type="number"
                  value={evaluation.weight || ""}
                  onChange={(e) => updateEvaluation(evaluation.id, "weight", Number(e.target.value))}
                  placeholder="20"
                  className="bg-zinc-950 border-zinc-800"
                />
                <Input
                  type="number"
                  value={evaluation.score || ""}
                  onChange={(e) => updateEvaluation(evaluation.id, "score", Number(e.target.value))}
                  placeholder="85"
                  className="bg-zinc-950 border-zinc-800"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEvaluation(evaluation.id)}
                  className="text-zinc-500 hover:text-red-400 hover:bg-zinc-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
           <div className="space-y-2">
            <Label htmlFor="remaining">Remaining Evaluation Weight (%)</Label>
            <Input 
              id="remaining" 
              type="number" 
              placeholder="e.g. Endsem Exam: 35" 
              value={remainingWeight} 
              onChange={e => setRemainingWeight(e.target.value ? Number(e.target.value) : "")}
              className="bg-zinc-950 border-zinc-800" 
            />
          </div>
        </div>
      </div>

      {totalWeight > 100 && (
        <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md border border-amber-500/20 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>Total weight exceeds 100% ({totalWeight}%). Please check your inputs.</p>
        </div>
      )}

      {targetScore !== "" && remainingWeight !== "" && (
        <div className="mt-8 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
          <div className="p-6 border-b border-zinc-800">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-indigo-400" />
              Calculation Results
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="text-zinc-400 text-sm font-medium mb-1">Target</div>
                <div className="text-2xl font-bold text-white">{targetScore}%</div>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="text-zinc-400 text-sm font-medium mb-1">Current Score</div>
                <div className="text-2xl font-bold text-white">{currentWeightedScore.toFixed(1)}%</div>
                <div className="text-xs text-zinc-500 mt-1">out of {totalCurrentWeight}%</div>
              </div>
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                <div className="text-zinc-400 text-sm font-medium mb-1">Remaining</div>
                <div className="text-2xl font-bold text-zinc-300">{remainingWeight}%</div>
              </div>
              <div className={cn(
                "rounded-lg p-4 border",
                feasibility === "achievable" && "bg-emerald-950/30 border-emerald-900/50",
                feasibility === "challenging" && "bg-amber-950/30 border-amber-900/50",
                feasibility === "impossible" && "bg-red-950/30 border-red-900/50",
                !feasibility && "bg-zinc-900 border-zinc-800"
              )}>
                <div className="text-zinc-400 text-sm font-medium mb-1">Required Score</div>
                <div className={cn(
                  "text-2xl font-bold",
                  feasibility === "achievable" && "text-emerald-400",
                  feasibility === "challenging" && "text-amber-400",
                  feasibility === "impossible" && "text-red-400",
                  !feasibility && "text-white"
                )}>
                  {requiredScore > 0 ? requiredScore.toFixed(1) : 0}%
                </div>
              </div>
            </div>
          </div>
          
          {feasibility && (
            <div className={cn(
              "px-6 py-4 flex items-center gap-3",
              feasibility === "achievable" && "bg-emerald-500/10 text-emerald-400",
              feasibility === "challenging" && "bg-amber-500/10 text-amber-400",
              feasibility === "impossible" && "bg-red-500/10 text-red-400",
            )}>
              {feasibility === "achievable" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              <span className="font-medium">{feasibilityMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
