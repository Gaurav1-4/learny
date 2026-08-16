'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Zap,
  RotateCcw,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MathView } from '@/components/ui/math-view';
import {
  MONSOON_2026_BACKLOG_LECTURES,
  BacklogLecture,
  getBacklogStatus,
  logBacklogLecture,
  resolveAllBacklog,
  resetBacklogState,
  BacklogStatus,
} from '@/lib/backlog-engine';

interface BacklogResolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function BacklogResolverModal({
  isOpen,
  onClose,
  onUpdated,
}: BacklogResolverModalProps) {
  const [status, setStatus] = useState<BacklogStatus>(getBacklogStatus());
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  const refreshStatus = () => {
    const s = getBacklogStatus();
    setStatus(s);
    if (onUpdated) onUpdated();
  };

  useEffect(() => {
    refreshStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLectures =
    selectedDay === 'All'
      ? MONSOON_2026_BACKLOG_LECTURES
      : MONSOON_2026_BACKLOG_LECTURES.filter((l) => l.dayName === selectedDay);

  const handleLogSingle = (lecture: BacklogLecture) => {
    logBacklogLecture(lecture);
    setJustLoggedId(lecture.id);
    refreshStatus();
    setTimeout(() => setJustLoggedId(null), 2000);
  };

  const handleResolveAll = () => {
    resolveAllBacklog();
    refreshStatus();
  };

  const handleReset = () => {
    resetBacklogState();
    refreshStatus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-3xl rounded-2xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                1-Week Backlog Resolver • Monsoon 2026
              </span>
              <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[9px] text-zinc-300 font-mono">
                {status.completedCount}/{status.totalCount} Logged ({status.percentComplete}%)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Lecture-by-Lecture Backlog Walkthrough
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolveAll}
              className="h-8 text-xs border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resolve All 10 at Once</span>
              <span className="sm:hidden">All</span>
            </Button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 shrink-0 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">
              {status.isFullyResolved
                ? '🎉 Complete! All 1-Week Backlog Lectures & Homework Synced!'
                : `${status.pendingCount} Lectures Remaining to Log`}
            </span>
            <span className="font-mono text-zinc-400 text-[11px]">{status.percentComplete}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${status.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Day Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-zinc-800/80 pb-2 overflow-x-auto scrollbar-none shrink-0">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'All'].map((day) => {
            const dayLectures =
              day === 'All'
                ? MONSOON_2026_BACKLOG_LECTURES
                : MONSOON_2026_BACKLOG_LECTURES.filter((l) => l.dayName === day);
            const dayLoggedCount = dayLectures.filter((l) =>
              status.loggedIds.includes(l.id)
            ).length;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedDay === day
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{day}</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({dayLoggedCount}/{dayLectures.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* Lectures List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {filteredLectures.map((lec) => {
            const isLogged = status.loggedIds.includes(lec.id);
            const isJustLogged = justLoggedId === lec.id;

            return (
              <div
                key={lec.id}
                className={`rounded-xl border p-4 space-y-3 transition-colors ${
                  isLogged
                    ? 'bg-zinc-900/20 border-zinc-800/80 opacity-90'
                    : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-semibold text-white border border-zinc-700">
                        {lec.courseCode}
                      </span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{lec.time}</span>
                      </span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{lec.room}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white">{lec.courseName}</h3>
                    <p className="text-xs text-zinc-300 font-medium">Topic: {lec.topic}</p>
                  </div>

                  {/* Log Button */}
                  <div>
                    {isLogged ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/80 border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Logged &amp; Synced</span>
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleLogSingle(lec)}
                        className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-3 gap-1 shadow-sm"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Log Homework &amp; Schedule</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Assigned Homework & KaTeX Preview */}
                <div className="rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-1.5">
                    <span className="font-semibold text-zinc-300">
                      Assigned Homework: {lec.homeworkSummary}
                    </span>
                    <span className="font-mono text-zinc-500">Shorthand: &quot;{lec.rawInput}&quot;</span>
                  </div>

                  {lec.problems && lec.problems.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {lec.problems.map((p, pIdx) => (
                        <div key={pIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-zinc-300">
                              {p.exercise} • Q{p.qNum}: {p.title}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {p.difficulty}
                            </span>
                          </div>

                          <div className="py-1 px-2 rounded bg-zinc-900 text-center text-xs overflow-x-auto scrollbar-none">
                            <MathView math={p.latex} displayMode={true} />
                          </div>

                          {p.methodOfWork && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              <strong className="text-zinc-300">Method: </strong>
                              {p.methodOfWork}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 shrink-0 text-xs text-zinc-400">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Backlog Demo</span>
          </button>

          <Button
            onClick={onClose}
            className="h-8 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-4"
          >
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
