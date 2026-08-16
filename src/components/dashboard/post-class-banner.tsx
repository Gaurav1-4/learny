'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
  FlaskConical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getRecentlyEndedClass,
  dismissClassPrompt,
  simulateEndedClass,
  ActiveClassPrompt,
  MONSOON_2026_TIMETABLE,
} from '@/lib/homework-prompt-engine';
import { HomeworkLoggerModal } from '@/components/homework/homework-logger-modal';

export function PostClassBanner() {
  const [activePrompt, setActivePrompt] = useState<ActiveClassPrompt | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const checkClassStatus = () => {
    const prompt = getRecentlyEndedClass();
    setActivePrompt(prompt);
  };

  useEffect(() => {
    checkClassStatus();

    // Re-check timetable every 30 seconds
    const interval = setInterval(checkClassStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    if (!activePrompt) return;
    dismissClassPrompt(activePrompt);
    setActivePrompt(null);
  };

  const handleSimulateClass = (classId: string) => {
    simulateEndedClass(classId);
    checkClassStatus();
    setShowClassPicker(false);
  };

  return (
    <>
      <AnimatePresence>
        {activePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-white mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Post-Class Check-In • {activePrompt.endedAgoText}
                    </span>
                    {activePrompt.isSimulated && (
                      <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[9px] text-zinc-300">
                        Test Mode
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-semibold text-white">
                    {activePrompt.classItem.courseName} class has ended
                  </h3>

                  <p className="text-xs text-zinc-400">
                    Did the professor assign any homework, problem sets, or readings today in {activePrompt.classItem.room}?
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-8 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  No Homework / Skip
                </Button>

                <Button
                  size="sm"
                  onClick={() => setShowModal(true)}
                  className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-3 gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Log Homework</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Simulation Trigger Pill when no active banner */}
        {!activePrompt && (
          <div className="space-y-2 py-1 px-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Automatic notification &amp; banner schedule active.</span>
              <button
                onClick={() => setShowClassPicker(!showClassPicker)}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-white font-medium transition-colors"
              >
                <FlaskConical className="h-3 w-3" />
                <span>Test Notification for Any Class ({showClassPicker ? "Hide" : "Select"})</span>
              </button>
            </div>

            {showClassPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2 text-xs"
              >
                <div className="font-semibold text-white text-[11px]">
                  Select a class to trigger its post-lecture notification &amp; dashboard banner:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {MONSOON_2026_TIMETABLE.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSimulateClass(c.id)}
                      className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 text-left transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-zinc-200 text-xs truncate">
                          {c.dayName}: {c.courseCode}
                        </div>
                        <div className="text-[10px] text-zinc-400 truncate">
                          {c.courseName} • {c.startTime}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {c.room}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Homework Logger Modal */}
      {activePrompt && (
        <HomeworkLoggerModal
          classItem={activePrompt.classItem}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSaved={(summary) => {
            setActivePrompt(null);
            setSuccessToast(summary);
            setTimeout(() => setSuccessToast(null), 4000);
          }}
        />
      )}

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 right-5 z-50 rounded-xl bg-zinc-900 border border-zinc-700 p-3.5 shadow-2xl flex items-center gap-3 text-xs text-white"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="space-y-0.5">
              <div className="font-semibold">Homework Saved &amp; Formatted</div>
              <div className="text-[11px] text-zinc-400">{successToast}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
