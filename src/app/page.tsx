'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, Calculator, Search, Sparkles, Calendar, Timer, Archive, Brain } from 'lucide-react';

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
      console.error("Sign-in error:", e);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-indigo-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-center overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[250px] bg-purple-600/10 blur-[110px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-8 py-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-4 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm shadow-inner">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Google Classroom AI Study Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white">Learny</h1>
          </div>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Your personal college workspace. Connect to Google Classroom to manage active & archived courses, track subject evaluations, study with spaced repetition, and integrate with NotebookLM.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center justify-center gap-3.5 rounded-xl bg-white px-9 py-4 text-base font-bold text-zinc-950 transition-all hover:bg-zinc-100 hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-white/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span>{isSigningIn ? 'Connecting to Google Classroom...' : 'Sign in with Google Classroom'}</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full text-left">
          <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <h3 className="font-bold text-zinc-100">Live Classroom Sync</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct connection to all your college courses, assignments, announcements, and return grades.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700">
            <Archive className="h-6 w-6 text-indigo-400" />
            <h3 className="font-bold text-zinc-100">Archived Courses Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore past semesters, retrieve archived notes, previous assignments, and study materials.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700">
            <Brain className="h-6 w-6 text-purple-400" />
            <h3 className="font-bold text-zinc-100">NotebookLM Integration</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your personal Google account with NotebookLM subscription for deep note analysis & audio overviews.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700">
            <Calculator className="h-6 w-6 text-emerald-400" />
            <h3 className="font-bold text-zinc-100">Subject Evaluations & CGPA</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Per-subject weighted component breakdown (Quizzes, Midsem, Labs, Endsem) and historical CGPA tracking.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700">
            <Calendar className="h-6 w-6 text-rose-400" />
            <h3 className="font-bold text-zinc-100">Academic Calendar</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full calendar showing assignment deadlines, exam schedules, and personal study milestones.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700">
            <Timer className="h-6 w-6 text-amber-400" />
            <h3 className="font-bold text-zinc-100">Focus Timer & SM-2 Study</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synthesizer chime Pomodoro timer and active recall flashcards with SuperMemo SM-2 spaced repetition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
