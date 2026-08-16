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
} from '@/lib/homework-prompt-engine';
import { HomeworkLoggerModal } from '@/components/homework/homework-logger-modal';

export function PostClassBanner() {
  const [activePrompt, setActivePrompt] = useState<ActiveClassPrompt | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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

  const handleSimulateTest = () => {
    simulateEndedClass('MTH201');
    checkClassStatus();
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
          <div className="flex items-center justify-between py-1 px-1">
            <div className="text-[11px] text-zinc-500">
              Timetable schedule active: checks for ended lectures automatically.
            </div>
            <button
              onClick={handleSimulateTest}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              <FlaskConical className="h-3 w-3" />
              <span>Simulate Class Ended</span>
            </button>
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
