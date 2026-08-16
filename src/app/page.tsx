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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-indigo-500" />
      </div>
    );
  }

  const features = [
    {
      icon: BookOpen,
      title: 'Classroom & Archive Sync',
      desc: 'Seamless live sync with Google Classroom courses, active coursework, submissions, and past semester vaults.',
      glow: 'from-indigo-500/20 to-transparent',
    },
    {
      icon: Brain,
      title: 'NotebookLM Dual-Hub',
      desc: 'Connect your personal Google AI subscription to college courses. 1-click syllabus & notes knowledge packaging.',
      glow: 'from-purple-500/20 to-transparent',
    },
    {
      icon: Calculator,
      title: 'Continuous Evaluation & CGPA',
      desc: 'Per-subject weighted component breakdown (Quizzes, Midsems, Labs) with target exam score planner.',
      glow: 'from-emerald-500/20 to-transparent',
    },
    {
      icon: Sparkles,
      title: 'SM-2 Spaced Repetition',
      desc: 'SuperMemo scientific retention algorithm for long-term memory mastery with 1-click flashcard conversion.',
      glow: 'from-cyan-500/20 to-transparent',
    },
    {
      icon: Calendar,
      title: 'Academic Deadline Radar',
      desc: 'Automated coursework timeline with due date countdowns, priority color coding, and submission tracking.',
      glow: 'from-amber-500/20 to-transparent',
    },
    {
      icon: Timer,
      title: 'Focus Pomodoro Chamber',
      desc: 'Synthesized Web Audio API deep-work timer with ambient ticking and custom interval cycles.',
      glow: 'from-rose-500/20 to-transparent',
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-center overflow-hidden">
      {/* Background Animated Lights */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[500px] h-[300px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex max-w-5xl flex-col items-center gap-8 py-16"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md shadow-inner"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Next-Gen Google Classroom Workspace</span>
        </motion.div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-indigo-500/40">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
              Learny
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The high-performance study companion designed for Google Classroom. Sync courses, track multi-semester continuous evaluations, master notes in NotebookLM, and optimize learning with SM-2 spaced repetition.
          </p>
        </div>

        {/* Action CTA */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="pt-2"
        >
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="group relative flex items-center justify-center gap-3.5 overflow-hidden rounded-2xl bg-white px-10 py-4.5 text-base font-extrabold text-zinc-950 shadow-2xl shadow-white/20 transition-all hover:bg-zinc-100 hover:shadow-indigo-500/20"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google Classroom'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-8 text-left w-full">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05, duration: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-lg transition-colors hover:border-white/15"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">{feature.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
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
