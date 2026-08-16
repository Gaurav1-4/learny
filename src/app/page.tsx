'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Search,
  Sparkles,
  Calendar,
  Timer,
  Archive,
  Brain,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (e) {
      console.error('Sign-in error:', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4 sm:p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex max-w-4xl flex-col items-center gap-6 sm:gap-8 py-12 sm:py-20 w-full"
      >
        {/* Brand */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950 shadow-md">
            <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Learny
          </h1>
        </div>

        {/* Tagline */}
        <div className="space-y-2 max-w-2xl">
          <p className="text-base sm:text-xl text-zinc-300 font-medium">
            Academic companion for IIIT Delhi students
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Directly connect your Google Classroom to automated continuous assessment tracking, NotebookLM knowledge packaging, and structured study ledgers.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 w-full sm:w-auto">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
          >
            <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google Classroom'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6 text-left w-full">
          {[
            {
              title: "Classroom Sync",
              desc: "Active courses, assignments, student submissions, and announcements in real-time.",
            },
            {
              title: "NotebookLM Dual-Hub",
              desc: "Package course PDFs directly into studyonly.co@gmail.com for zero-bloat synthesis.",
            },
            {
              title: "Continuous Evaluation",
              desc: "Track midsems, quizzes, and labs with weighted target score planning.",
            },
            {
              title: "OKF Knowledge Ledger",
              desc: "Deterministic tagging of lecture notes, homework questions, and practice problem sets.",
            },
            {
              title: "Academic Radar",
              desc: "Filter college emails strictly relevant to 3rd Sem B.Tech CSD.",
            },
            {
              title: "Study Decks & Timer",
              desc: "SM-2 spaced repetition flashcards and focused deep-work pomodoro chamber.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-700"
            >
              <h3 className="font-semibold text-white text-xs mb-1">{feature.title}</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 pt-4">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Zero telemetry on user notes • Direct official Google Classroom API integration</span>
        </div>
      </motion.div>
    </div>
  );
}
