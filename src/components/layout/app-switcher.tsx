"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grip, GraduationCap, Brain, Mail } from 'lucide-react';
import Link from 'next/link';

interface AppItem {
  name: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const APPS: AppItem[] = [
  {
    name: 'Learny',
    icon: GraduationCap,
    href: 'https://learny.zorx.tech/dashboard',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  {
    name: 'GAHA',
    icon: Brain,
    href: 'https://gaha.zorx.tech',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    name: 'Zobox',
    icon: Mail,
    href: 'https://zobox.zorx.vercel.app',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  }
];

export function AppSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Zorx Apps"
      >
        <Grip className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-50 p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Zorx Apps</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {APPS.map((app) => (
                <Link
                  key={app.name}
                  href={app.href}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-zinc-800 transition-colors gap-3 group cursor-pointer"
                >
                  <div className={`p-3.5 rounded-full ${app.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <app.icon className={`h-6 w-6 ${app.color}`} />
                  </div>
                  <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors">
                    {app.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
