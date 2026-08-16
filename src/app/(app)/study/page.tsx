'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { StudyDecks } from '@/components/study/study-decks';
import { NotebookLMHub } from '@/components/notebooklm/notebooklm-hub';
import { FocusTimer } from '@/components/timer/focus-timer';
import { SubjectEvaluations } from '@/components/gpa/subject-evaluations';
import { TargetGradeCalculator } from '@/components/gpa/target-grade-calculator';
import { GpaCalculator } from '@/components/gpa/gpa-calculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StudyToolsHubPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'decks';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3">
        <div className="text-[11px] font-medium text-zinc-500">Academic Toolkit • IIIT Delhi</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
          Study &amp; Productivity Suite
        </h1>
      </div>

      {/* Main Suite Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-zinc-950 border border-zinc-800 p-0.5 rounded-lg text-xs flex overflow-x-auto scrollbar-none">
          <TabsTrigger
            value="decks"
            className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            Flashcards (SM-2)
          </TabsTrigger>
          <TabsTrigger
            value="notebooklm"
            className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            NotebookLM Vault
          </TabsTrigger>
          <TabsTrigger
            value="timer"
            className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            Focus Timer
          </TabsTrigger>
          <TabsTrigger
            value="gpa"
            className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            GPA &amp; Evaluations
          </TabsTrigger>
        </TabsList>

        {/* 1. SM-2 Flashcards */}
        <TabsContent value="decks" className="focus-visible:outline-none">
          <StudyDecks />
        </TabsContent>

        {/* 2. NotebookLM Dual-Account Hub */}
        <TabsContent value="notebooklm" className="focus-visible:outline-none">
          <NotebookLMHub />
        </TabsContent>

        {/* 3. Pomodoro Focus Timer */}
        <TabsContent value="timer" className="focus-visible:outline-none">
          <FocusTimer />
        </TabsContent>

        {/* 4. Subject Continuous Evaluations & CGPA */}
        <TabsContent value="gpa" className="space-y-4 focus-visible:outline-none">
          <SubjectEvaluations />

          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-zinc-800">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-xs font-semibold text-white mb-3">Target Exam Score Planner</h3>
              <TargetGradeCalculator />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <h3 className="text-xs font-semibold text-white mb-3">Manual SGPA / CGPA Table</h3>
              <GpaCalculator />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
