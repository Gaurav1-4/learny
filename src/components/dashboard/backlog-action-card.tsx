'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Zap,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBacklogStatus, BacklogStatus } from '@/lib/backlog-engine';
import { BacklogResolverModal } from '@/components/backlog/backlog-resolver-modal';

export function BacklogActionCard() {
  const [status, setStatus] = useState<BacklogStatus>(getBacklogStatus());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setStatus(getBacklogStatus());
  }, []);

  const handleRefresh = () => {
    setStatus(getBacklogStatus());
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
            {status.isFullyResolved ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <Calendar className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Monsoon 2026 • 1-Week Backlog Resolver
              </span>
              <span className="rounded bg-zinc-800 border border-zinc-700 px-1.5 py-0.2 text-[9px] text-zinc-300 font-mono">
                {status.completedCount}/{status.totalCount} Done
              </span>
            </div>

            <h3 className="text-xs sm:text-sm font-semibold text-white">
              {status.isFullyResolved
                ? 'All 1-Week Lectures & Homework Synced to Calendar!'
                : `Clear 1-Week Backlog: ${status.pendingCount} Lectures Pending`}
            </h3>

            <p className="text-xs text-zinc-400">
              Walk through Monday–Friday classes, review KaTeX problem sets, and auto-schedule all homework into your calendar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="h-8 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold px-3.5 gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{status.isFullyResolved ? 'Review Week Schedule' : 'Start Backlog Walkthrough'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Backlog Walkthrough Modal */}
      <BacklogResolverModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdated={handleRefresh}
      />
    </>
  );
}
