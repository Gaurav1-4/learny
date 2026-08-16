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
  RotateCcw,
  BookOpen,
  Plus,
  Loader2,
  FileEdit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MathView } from '@/components/ui/math-view';
import {
  MONSOON_2026_BACKLOG_LECTURES,
  BacklogLecture,
  getBacklogStatus,
  getLoggedHomeworkForLecture,
  saveLectureHomework,
  markLectureNoHomework,
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
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [customInputMap, setCustomInputMap] = useState<Record<string, string>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

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

  const handleSaveHomework = async (lecture: BacklogLecture) => {
    // Get text from state or previous logged value
    const existing = getLoggedHomeworkForLecture(lecture.id);
    const rawInput = (customInputMap[lecture.id] !== undefined ? customInputMap[lecture.id] : (existing?.rawInput || '')).trim();

    if (!rawInput) {
      markLectureNoHomework(lecture);
      setActiveEditingId(null);
      refreshStatus();
      return;
    }

    try {
      setLoadingMap((prev) => ({ ...prev, [lecture.id]: true }));

      // Format user's real typed homework with Gemini KaTeX engine
      const res = await fetch('/api/homework/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput,
          courseCode: lecture.courseCode,
          courseName: lecture.courseName,
        }),
      });

      let formattedData: any = { summary: rawInput, problems: [] };
      if (res.ok) {
        const json = await res.json();
        if (json.data) formattedData = json.data;
      }

      saveLectureHomework(lecture, rawInput, formattedData);
      setActiveEditingId(null);
      refreshStatus();
    } catch (err) {
      console.error('Failed to format homework', err);
      saveLectureHomework(lecture, rawInput, { summary: rawInput });
      setActiveEditingId(null);
      refreshStatus();
    } finally {
      setLoadingMap((prev) => ({ ...prev, [lecture.id]: false }));
    }
  };

  const handleReset = () => {
    resetBacklogState();
    setCustomInputMap({});
    setActiveEditingId(null);
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
                {status.completedCount}/{status.totalCount} Logged
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Log Your Real Homework (Lecture by Lecture)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 shrink-0 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">
              {status.isFullyResolved
                ? '🎉 All 1-Week Backlog Lectures Reviewed & Synced to Calendar!'
                : `${status.pendingCount} Lectures Pending Homework Entry`}
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
            const loggedHw = getLoggedHomeworkForLecture(lec.id);
            const isEditing = activeEditingId === lec.id || (!isLogged && !loggedHw);
            const isLoading = loadingMap[lec.id];

            return (
              <div
                key={lec.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3"
              >
                {/* Slot Header */}
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
                    {lec.topic && (
                      <p className="text-xs text-zinc-400 font-medium">{lec.topic}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isLogged && !isEditing ? (
                      <button
                        onClick={() => {
                          setActiveEditingId(lec.id);
                          setCustomInputMap((prev) => ({
                            ...prev,
                            [lec.id]: loggedHw?.rawInput || '',
                          }));
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-800/80 border border-zinc-700 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                      >
                        <FileEdit className="h-3 w-3 text-zinc-400" />
                        <span>Edit Homework</span>
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Logged Homework Display */}
                {isLogged && !isEditing && loggedHw && (
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/80 pb-1.5">
                      <span className="font-semibold text-white">
                        {loggedHw.summary || loggedHw.rawInput || 'No homework assigned'}
                      </span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Synced to Calendar</span>
                      </span>
                    </div>

                    {loggedHw.problems && loggedHw.problems.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {loggedHw.problems.map((p: any, pIdx: number) => (
                          <div key={pIdx} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-zinc-300">
                                {p.exercise} • Q{p.qNum}: {p.title}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {p.difficulty}
                              </span>
                            </div>

                            {p.latex && (
                              <div className="py-1 px-2 rounded bg-zinc-900 text-center text-xs overflow-x-auto scrollbar-none">
                                <MathView math={p.latex} displayMode={true} />
                              </div>
                            )}

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
                )}

                {/* Homework Input Form */}
                {isEditing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveHomework(lec);
                    }}
                    className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 space-y-3"
                  >
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-300">
                        Enter homework assigned in this class:
                      </label>
                      <Input
                        value={customInputMap[lec.id] ?? (loggedHw?.rawInput || '')}
                        onChange={(e) =>
                          setCustomInputMap((prev) => ({
                            ...prev,
                            [lec.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          lec.courseCode.includes('MTH')
                            ? 'e.g. 14.2 3 5, 14.3 2 (Thomas Calculus)'
                            : lec.courseCode.includes('CSE231')
                            ? 'e.g. CPU Scheduling questions 1-4, Lab 1'
                            : lec.courseCode.includes('DES')
                            ? 'e.g. Activity 1 Needfinding interviews'
                            : 'e.g. Reading summary 1, Assignment 1'
                        }
                        className="bg-zinc-900 border-zinc-800 text-xs h-8"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCustomInputMap((prev) => ({ ...prev, [lec.id]: '' }));
                          markLectureNoHomework(lec);
                          setActiveEditingId(null);
                          refreshStatus();
                        }}
                        className="h-7 text-[11px] text-zinc-400 hover:text-white"
                      >
                        No Homework
                      </Button>

                      <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                        className="h-7 bg-white text-zinc-950 hover:bg-zinc-200 text-[11px] font-semibold px-3 gap-1"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        <span>Save &amp; Sync to Calendar</span>
                      </Button>
                    </div>
                  </form>
                )}
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
            <span>Reset Backlog</span>
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
