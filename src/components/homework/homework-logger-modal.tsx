'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MathView } from '@/components/ui/math-view';
import { TimetableClass } from '@/lib/homework-prompt-engine';
import { OKFRegistry } from '@/lib/okf-indexer';

interface HomeworkLoggerModalProps {
  classItem: TimetableClass;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (summary: string) => void;
}

export function HomeworkLoggerModal({
  classItem,
  isOpen,
  onClose,
  onSaved,
}: HomeworkLoggerModalProps) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFormatWithAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/homework/ai-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: inputText,
          courseCode: classItem.courseCode,
          courseName: classItem.courseName,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setPreviewData(json.data);
      }
    } catch (err) {
      console.error('Failed to format homework with AI', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSave = () => {
    if (!previewData && !inputText) return;

    const problems = previewData?.problems || [];
    const summary = previewData?.summary || inputText;

    // 1. Save to Course Problem Ledger
    const courseProblemsKey = `learny-problems-${classItem.courseId}`;
    localStorage.setItem(courseProblemsKey, JSON.stringify(problems));

    // 2. Save to Course Homework Shorthand Input
    localStorage.setItem(`learny-hw-input-${classItem.courseId}`, inputText);

    // 3. Mark class as logged for today
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`learny-hw-logged-${today}-${classItem.id}`, 'logged');
    localStorage.removeItem('learny-simulated-class-prompt');

    // 4. Update OKF Google Drive Manifest
    const lectureId = `iiitd-${classItem.courseId.toLowerCase()}-lec02`;
    OKFRegistry.updateLectureHomework(lectureId, inputText);

    // 5. Sync to server ledger
    try {
      fetch('/api/homework/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: classItem.id,
          courseCode: classItem.courseCode,
          courseName: classItem.courseName,
          rawInput: inputText,
          summary,
          problems,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      }).catch((e) => console.warn('Server sync error', e));
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => {
      onSaved(summary);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-5 space-y-4 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">
                {classItem.courseCode} • {classItem.room}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white">
              Log Homework: {classItem.courseName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-semibold text-white">
              Homework Formatted &amp; Saved to OKF Vault!
            </h4>
            <p className="text-xs text-zinc-400">
              Problems KaTeX typeset and synced with Google Drive.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Input Form */}
            <form onSubmit={handleFormatWithAI} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Assigned Homework (Type shorthand or description):
                </label>
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      classItem.courseCode.includes('MTH')
                        ? 'e.g. 14.2 3 5, 14.3 2 (Thomas Calculus)'
                        : classItem.courseCode.includes('CSE231')
                        ? 'e.g. CPU Scheduling sheet Q1-4, Lab 1'
                        : classItem.courseCode.includes('CSE201')
                        ? 'e.g. Lab 1 Polymorphic hierarchy, Design Patterns'
                        : 'e.g. Reading summary 1, Activity 1'
                    }
                    className="bg-zinc-900 border-zinc-800 text-xs font-mono flex-1 h-9"
                    required
                  />

                  <Button
                    type="submit"
                    disabled={loading || !inputText.trim()}
                    className="h-9 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-3.5 gap-1.5 shrink-0"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span>Format with AI</span>
                  </Button>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Type what was assigned in {classItem.courseCode} ({classItem.courseName})
                </div>
              </div>
            </form>

            {/* Live KaTeX AI Preview Block */}
            {previewData && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 space-y-3 max-h-60 overflow-y-auto scrollbar-none">
                <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
                    <span>Formatted Problem Preview ({previewData.problems?.length || 0})</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">OKF KaTeX</span>
                </div>

                <div className="space-y-2">
                  {previewData.problems?.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-zinc-200">
                          {p.exercise} — Q{p.qNum}: {p.title}
                        </span>
                        <span className="text-zinc-500 font-mono text-[10px]">{p.difficulty}</span>
                      </div>

                      <div className="py-1 px-2 rounded bg-zinc-900 text-center text-xs overflow-x-auto scrollbar-none">
                        <MathView math={p.latex} displayMode={true} />
                      </div>

                      {p.methodOfWork && (
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          <strong className="text-zinc-300">Method: </strong>
                          {p.methodOfWork}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <HardDrive className="h-3 w-3" />
                <span>Syncs to OKF Google Drive Vault</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 text-xs text-zinc-400"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={previewData ? handleConfirmSave : () => handleFormatWithAI()}
                  disabled={loading || !inputText.trim()}
                  className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-3"
                >
                  {previewData ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      <span>Save to Course Ledger</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
