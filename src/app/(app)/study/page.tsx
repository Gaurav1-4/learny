'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DocumentNotebookLMVault } from '@/components/study/document-notebooklm-vault';
import { NotebookLMHub } from '@/components/notebooklm/notebooklm-hub';
import { FocusTimer } from '@/components/timer/focus-timer';
import { SubjectEvaluations } from '@/components/gpa/subject-evaluations';
import { TargetGradeCalculator } from '@/components/gpa/target-grade-calculator';
import { GpaCalculator } from '@/components/gpa/gpa-calculator';
import { SwipeableTabs, SwipeableTabItem } from '@/components/ui/swipeable-tabs';
import { BookOpen, Layers, Clock, Award } from 'lucide-react';

export default function StudyToolsHubPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'vault';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const studyTabs: SwipeableTabItem[] = [
    {
      id: 'vault',
      label: 'NotebookLM Document Vault',
      icon: <BookOpen className="h-3.5 w-3.5" />,
      content: <DocumentNotebookLMVault />,
    },
    {
      id: 'notebooklm',
      label: 'NotebookLM Account Sync',
      icon: <Layers className="h-3.5 w-3.5" />,
      content: <NotebookLMHub />,
    },
    {
      id: 'timer',
      label: 'Focus Timer',
      icon: <Clock className="h-3.5 w-3.5" />,
      content: <FocusTimer />,
    },
    {
      id: 'gpa',
      label: 'GPA & Evaluations',
      icon: <Award className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-4">
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-3">
        <div className="text-[11px] font-medium text-zinc-500">Academic Toolkit • IIIT Delhi</div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
          Study &amp; Productivity Suite
        </h1>
      </div>

      {/* Swipeable Tabs (Click + Swipe Gestures) */}
      <SwipeableTabs
        tabs={studyTabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
