'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  RefreshCw,
  Flame,
  CheckCircle2,
  Search,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SwipeableTabs, SwipeableTabItem } from '@/components/ui/swipeable-tabs';
import { GahaDailyBriefing } from '@/lib/gaha-scheduler';
import { AcademicDateInfo, AcademicMilestone, TIMETABLE_ADJUSTMENTS_2026 } from '@/lib/academic-calendar-engine';
import { OKFMemoryState, OKFConcept, OKFMemoryEngine } from '@/lib/okf-memory-engine';
import { FormattedMathText } from '@/components/ui/math-view';

export default function GahaManagerPage() {
  const [loading, setLoading] = useState(true);
  const [briefingType, setBriefingType] = useState<'MORNING' | 'NIGHT'>('MORNING');
  const [briefing, setBriefing] = useState<GahaDailyBriefing | null>(null);
  const [calendarInfo, setCalendarInfo] = useState<AcademicDateInfo | null>(null);
  const [milestones, setMilestones] = useState<AcademicMilestone[]>([]);
  const [memoryState, setMemoryState] = useState<OKFMemoryState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OKFConcept[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);

  // Load Manager Data
  async function loadManagerData() {
    try {
      setLoading(true);
      const [briefingRes, calendarRes, memoryRes] = await Promise.all([
        fetch(`/api/gaha/briefing?type=${briefingType}`),
        fetch('/api/gaha/calendar'),
        fetch('/api/gaha/memory'),
      ]);

      if (briefingRes.ok) {
        const bData = await briefingRes.json();
        setBriefing(bData.briefing);
      }

      if (calendarRes.ok) {
        const cData = await calendarRes.json();
        setCalendarInfo(cData.current);
        setMilestones(cData.upcomingMilestones || []);
      }

      if (memoryRes.ok) {
        const mData = await memoryRes.json();
        setMemoryState(mData.memoryState);
      }
    } catch (err) {
      console.error('Failed to load manager data', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisSupported(true);
    }
    loadManagerData();
  }, [briefingType]);

  // Handle Search in OKF Knowledge Base
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = OKFMemoryEngine.searchKnowledgeBase(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  // Speech synthesis reader for executive briefing
  const toggleAudioBriefing = () => {
    if (!speechSynthesisSupported || !briefing) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${briefing.headline}. ${briefing.executiveSummaryText}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const handleMasteryBoost = (conceptId: string) => {
    const updated = OKFMemoryEngine.updateConceptMastery(conceptId, 5);
    if (updated) {
      setMemoryState(OKFMemoryEngine.getMemoryState());
    }
  };

  // Build Tabs for the Manager
  const managerTabs: SwipeableTabItem[] = [
    {
      id: 'briefing',
      label: 'Daily Executive Directive',
      icon: <Brain className="h-3.5 w-3.5 text-indigo-400" />,
      content: (
        <div className="space-y-4">
          {/* Briefing Switcher & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  GAHA 2.0 • 24x7 Academic Manager
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {briefing?.headline || 'Loading Daily Directive...'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
                <button
                  onClick={() => setBriefingType('MORNING')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    briefingType === 'MORNING' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🌅 Morning
                </button>
                <button
                  onClick={() => setBriefingType('NIGHT')}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    briefingType === 'NIGHT' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  🌙 Night Review
                </button>
              </div>

              {speechSynthesisSupported && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleAudioBriefing}
                  className={`h-8 gap-1.5 rounded-lg border-zinc-800 text-xs ${
                    isPlayingAudio ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40' : 'bg-zinc-900 text-zinc-300'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : 'Listen'}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Manager Directives &amp; Action Plan</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              {briefing?.executiveSummaryText}
            </p>

            {/* Top Priorities Checklist */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Target Priorities For Today:
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {briefing?.topPriorities.map((pri, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-start gap-2 text-xs text-zinc-300"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{pri}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Planned Deep Work Study Blocks */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>24x7 Scheduled Deep Work Blocks</span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {briefing?.recommendedStudyBlocks.map((block, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-semibold text-indigo-400">{block.timeSlot}</span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        {block.durationMinutes}m sprint
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{block.subject}</h4>
                    <p className="text-xs text-zinc-300 line-clamp-2">{block.task}</p>
                  </div>
                  <div className="text-[10px] text-zinc-500 border-t border-zinc-800/60 pt-2 italic">
                    {block.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'calendar',
      label: 'Academic Calendar & TTA Matrix',
      icon: <Calendar className="h-3.5 w-3.5 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          {/* Calendar Status Card */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Current Phase</div>
              <div className="text-sm font-bold text-white">{calendarInfo?.phaseTitle}</div>
              <div className="text-[11px] text-zinc-400">{calendarInfo?.weekLabel}</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Midsem Countdown</div>
              <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
                <Flame className="h-4 w-4" />
                <span>{calendarInfo?.daysToMidsem} Days Remaining</span>
              </div>
              <div className="text-[11px] text-zinc-400">Mid-Semester Exams (20–28 Sept)</div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Endsem Countdown</div>
              <div className="text-sm font-bold text-indigo-400">
                {calendarInfo?.daysToEndsem} Days Remaining
              </div>
              <div className="text-[11px] text-zinc-400">Final Exams (29 Nov – 8 Dec)</div>
            </div>
          </div>

          {/* Official Timetable Adjustments Matrix (TTAs) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Official Timetable Adjustments (TTA Matrix)</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                8 Adjustments Synchronized
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(TIMETABLE_ADJUSTMENTS_2026).map(([dateStr, tta], idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-zinc-300 font-semibold">{dateStr}</span>
                    <p className="text-[11px] text-zinc-400">{tta.reason}</p>
                  </div>
                  <span className="rounded-md bg-indigo-950/50 border border-indigo-800/40 px-2 py-1 text-[11px] font-mono text-indigo-300">
                    {tta.targetDay} TT
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Academic Milestones */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Upcoming Semester Deadlines &amp; Milestones</span>
            </h3>

            <div className="space-y-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{m.title}</span>
                      {m.important && (
                        <span className="rounded bg-rose-950/50 text-rose-400 border border-rose-800/40 text-[9px] px-1.5 py-0.2 font-mono">
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">{m.description}</p>
                  </div>
                  <span className="font-mono text-zinc-400 shrink-0 ml-3">{m.dateStr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'okf-memory',
      label: 'OKF Long-Term Knowledge Graph',
      icon: <Layers className="h-3.5 w-3.5 text-amber-400" />,
      content: (
        <div className="space-y-4">
          {/* Knowledge Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search concepts, KaTeX formulas, derivation methods across all subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-zinc-900 border-zinc-800 text-xs text-zinc-100 rounded-xl"
            />
          </div>

          {/* Search Results if query present */}
          {searchResults.length > 0 ? (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-zinc-400">
                Found {searchResults.length} matched OKF concepts:
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {searchResults.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-zinc-300">{c.courseCode}</span>
                      <span className="text-emerald-400 font-mono font-semibold">{c.masteryPercentage}% Mastery</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{c.topic}</h4>
                    <p className="text-xs text-zinc-400">{c.methodOfWork}</p>

                    {c.latexFormulas.length > 0 && (
                      <div className="rounded-lg bg-zinc-950 p-2 border border-zinc-800/80 overflow-x-auto">
                        {c.latexFormulas.map((f, i) => (
                          <div key={i} className="text-xs py-0.5">
                            <FormattedMathText text={`$$${f}$$`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Subject Mastery Cards */
            <div className="grid gap-3 sm:grid-cols-2">
              {memoryState &&
                Object.values(memoryState.subjects).map((sub) => (
                  <div
                    key={sub.courseCode}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                          {sub.courseCode} • {sub.credits} Credits
                        </span>
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {sub.overallMastery}% Mastery
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white">{sub.courseName}</h3>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${sub.overallMastery}%` }}
                        />
                      </div>

                      {/* Sub-topics list */}
                      <div className="space-y-1.5 pt-2">
                        {sub.concepts.map((concept) => (
                          <div
                            key={concept.id}
                            className="rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-2.5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-200">{concept.topic}</span>
                              <button
                                onClick={() => handleMasteryBoost(concept.id)}
                                title="Click to boost mastery +5%"
                                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-zinc-800 px-1.5 py-0.5 rounded"
                              >
                                {concept.masteryPercentage}% +5
                              </button>
                            </div>
                            <div className="text-[11px] text-zinc-400 line-clamp-1">{concept.methodOfWork}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{sub.completedLectures} / {sub.totalLectures} Lectures Indexed</span>
                      <span className="text-indigo-400 font-medium">OKF Synced</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              IIIT Delhi • Monsoon 2026
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-950/50 border border-indigo-800/50 px-2 py-0.5 text-[10px] text-indigo-300 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              24x7 Manager Online
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Academic Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadManagerData}
            className="h-8 gap-1.5 rounded-lg border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Directives</span>
          </Button>
        </div>
      </div>

      {/* 2. Swipeable Tabs */}
      <SwipeableTabs tabs={managerTabs} defaultTabId="briefing" />
    </div>
  );
}
