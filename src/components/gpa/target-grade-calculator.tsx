"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Calculator, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DEFAULT_IIITD_SEM3_EVALS } from "./subject-evaluations";

interface Evaluation {
  id: string;
  name: string;
  weight: number;
  score: number;
}

export function TargetGradeCalculator() {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [targetScore, setTargetScore] = useState<number | "">("");
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [remainingWeight, setRemainingWeight] = useState<number | "">("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("learny_target_grades_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedCourseId) setSelectedCourseId(parsed.selectedCourseId);
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
      localStorage.setItem("learny_target_grades_v2", JSON.stringify({
        selectedCourseId, targetScore, evaluations, remainingWeight
      }));
    }
  }, [selectedCourseId, targetScore, evaluations, remainingWeight, mounted]);

  // When a course is selected from the dropdown, auto-populate its evaluation components
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = DEFAULT_IIITD_SEM3_EVALS.find(c => c.courseId === courseId);
    if (course) {
      setEvaluations(course.evaluations.map(ev => ({
        id: ev.id,
        name: ev.name,
        weight: ev.weightPercent,
        score: 0,
      })));
      setRemainingWeight("");
    }
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
    
    requiredScore = ((target - currentWeightedScore) / remainingW) * 100;
    
    if (requiredScore > 100) {
      feasibility = "impossible";
      feasibilityMessage = "Mathematically impossible — target too high";
    } else if (requiredScore > 85) {
      feasibility = "challenging";
      feasibilityMessage = `Challenging — need ${requiredScore.toFixed(1)}% on remaining`;
    } else if (requiredScore <= 100 && requiredScore >= 0) {
      feasibility = "achievable";
      feasibilityMessage = `Achievable — need ${requiredScore.toFixed(1)}% on remaining`;
    } else {
      feasibility = "achievable";
      feasibilityMessage = "Target already achieved!";
    }
  }

  if (!mounted) return null;

  const selectedCourse = DEFAULT_IIITD_SEM3_EVALS.find(c => c.courseId === selectedCourseId);

  return (
    <div className="space-y-6">
      {/* Course Selection Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="course-select">Select Subject</Label>
        <select
          id="course-select"
          className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
          value={selectedCourseId}
          onChange={(e) => handleCourseSelect(e.target.value)}
        >
          <option value="" disabled>Choose a subject...</option>
          {DEFAULT_IIITD_SEM3_EVALS.map(course => (
            <option key={course.courseId} value={course.courseId}>
              {course.courseName} ({course.credits} cr)
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          {/* Target Grade Input */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Overall Grade (%)</Label>
            <Input 
              id="target" 
              type="number" 
              placeholder="e.g. 85 for A+" 
              value={targetScore} 
              onChange={e => setTargetScore(e.target.value ? Number(e.target.value) : "")}
              className="bg-zinc-950 border-zinc-800" 
            />
          </div>

          {/* Evaluation Components — populated from the selected subject */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-300">
              Evaluation Components — {selectedCourse.courseName}
            </h3>
            <p className="text-xs text-zinc-500">
              Enter your scores (%) for completed evaluations. Leave upcoming ones at 0.
            </p>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_80px] gap-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <div>Component</div>
                <div className="text-center">Weight</div>
                <div className="text-center">Score (%)</div>
              </div>
              {evaluations.map((evaluation) => (
                <div key={evaluation.id} className="grid grid-cols-[1fr_80px_80px] gap-3 items-center py-2 px-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                  <div className="text-xs text-zinc-300 leading-relaxed">{evaluation.name}</div>
                  <div className="text-xs text-zinc-400 text-center font-medium">{evaluation.weight}%</div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={evaluation.score || ""}
                    onChange={(e) => updateEvaluation(evaluation.id, "score", Number(e.target.value))}
                    placeholder="—"
                    className="h-7 bg-zinc-900 border-zinc-700 text-xs text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Remaining Weight */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="space-y-2">
              <Label htmlFor="remaining">Remaining Evaluation Weight (%)</Label>
              <p className="text-xs text-zinc-500">Weight of exams/assignments you haven't done yet</p>
              <Input 
                id="remaining" 
                type="number" 
                placeholder="e.g. 35 for Endsem" 
                value={remainingWeight} 
                onChange={e => setRemainingWeight(e.target.value ? Number(e.target.value) : "")}
                className="bg-zinc-950 border-zinc-800 w-40" 
              />
            </div>
          </div>

          {totalWeight > 100 && (
            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md border border-amber-500/20 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>Total weight exceeds 100% ({totalWeight}%). Please check your inputs.</p>
            </div>
          )}

          {/* Results */}
          {targetScore !== "" && remainingWeight !== "" && (
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <div className="p-5 border-b border-zinc-800">
                <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                  <Calculator className="h-4 w-4 text-indigo-400" />
                  Result
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                    <div className="text-zinc-500 text-[11px] font-medium mb-1">Target</div>
                    <div className="text-xl font-bold text-white">{targetScore}%</div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                    <div className="text-zinc-500 text-[11px] font-medium mb-1">Current</div>
                    <div className="text-xl font-bold text-white">{currentWeightedScore.toFixed(1)}%</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">of {totalCurrentWeight}%</div>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                    <div className="text-zinc-500 text-[11px] font-medium mb-1">Remaining</div>
                    <div className="text-xl font-bold text-zinc-300">{remainingWeight}%</div>
                  </div>
                  <div className={cn(
                    "rounded-lg p-3 border",
                    feasibility === "achievable" && "bg-emerald-950/30 border-emerald-900/50",
                    feasibility === "challenging" && "bg-amber-950/30 border-amber-900/50",
                    feasibility === "impossible" && "bg-red-950/30 border-red-900/50",
                    !feasibility && "bg-zinc-900 border-zinc-800"
                  )}>
                    <div className="text-zinc-500 text-[11px] font-medium mb-1">Need</div>
                    <div className={cn(
                      "text-xl font-bold",
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
                  "px-5 py-3 flex items-center gap-2 text-sm",
                  feasibility === "achievable" && "bg-emerald-500/10 text-emerald-400",
                  feasibility === "challenging" && "bg-amber-500/10 text-amber-400",
                  feasibility === "impossible" && "bg-red-500/10 text-red-400",
                )}>
                  {feasibility === "achievable" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span className="font-medium text-xs">{feasibilityMessage}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
