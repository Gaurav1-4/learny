'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Archive,
  ArrowRight,
  Sparkles,
  Layers,
  User,
  Hash,
  Tag,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { ClassroomCourse } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const GRADIENTS = [
  'from-indigo-600/20 via-zinc-900/90 to-purple-600/10 border-indigo-500/30 hover:border-indigo-400/60',
  'from-emerald-600/20 via-zinc-900/90 to-teal-600/10 border-emerald-500/30 hover:border-emerald-400/60',
  'from-violet-600/20 via-zinc-900/90 to-fuchsia-600/10 border-violet-500/30 hover:border-violet-400/60',
  'from-cyan-600/20 via-zinc-900/90 to-blue-600/10 border-cyan-500/30 hover:border-cyan-400/60',
  'from-amber-600/20 via-zinc-900/90 to-orange-600/10 border-amber-500/30 hover:border-amber-400/60',
  'from-rose-600/20 via-zinc-900/90 to-pink-600/10 border-rose-500/30 hover:border-rose-400/60',
];

function getCourseTrack(name: string): { track: string; color: string; category: string } {
  const lower = name.toLowerCase();
  if (
    lower.includes('dpp') ||
    lower.includes('design') ||
    lower.includes('vdc') ||
    lower.includes('hci') ||
    lower.includes('proto') ||
    lower.includes('com')
  ) {
    return {
      track: 'Design & UX Track',
      color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      category: 'design',
    };
  }
  if (
    lower.includes('dsa') ||
    lower.includes('structure') ||
    lower.includes('algo') ||
    lower.includes('ip') ||
    lower.includes('intro to prog') ||
    lower.includes('prog')
  ) {
    return {
      track: 'Core CS / Algorithms',
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      category: 'cs',
    };
  }
  if (
    lower.includes('ap') ||
    lower.includes('oop') ||
    lower.includes('java') ||
    lower.includes('software')
  ) {
    return {
      track: 'Software Development',
      color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      category: 'dev',
    };
  }
  if (
    lower.includes('org') ||
    lower.includes('arch') ||
    lower.includes('co') ||
    lower.includes('cd') ||
    lower.includes('digital') ||
    lower.includes('circuit') ||
    lower.includes('math') ||
    lower.includes('linear') ||
    lower.includes('prob')
  ) {
    return {
      track: 'Systems & Math',
      color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      category: 'systems',
    };
  }
  return {
    track: 'IIITD Academic',
    color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    category: 'other',
  };
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [archivedCourses, setArchivedCourses] = useState<ClassroomCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'semester' | 'name-asc' | 'name-desc' | 'track'>('semester');
  const [trackFilter, setTrackFilter] = useState<'all' | 'design' | 'cs' | 'systems'>('all');

  useEffect(() => {
    async function fetchAllCourses() {
      try {
        setLoading(true);
        const [activeRes, archivedRes] = await Promise.all([
          fetch('/api/classroom/courses?state=ACTIVE'),
          fetch('/api/classroom/courses?state=ARCHIVED'),
        ]);

        if (activeRes.ok) {
          const data = await activeRes.json();
          setCourses(Array.isArray(data) ? data : []);
        }

        if (archivedRes.ok) {
          const data = await archivedRes.json();
          setArchivedCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllCourses();
  }, []);

  const currentList = activeTab === 'active' ? courses : archivedCourses;

  // Filter by search query and category
  const filteredCourses = currentList.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.section || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.descriptionHeading || '').toLowerCase().includes(searchQuery.toLowerCase());

    const track = getCourseTrack(c.name || '');
    const matchesTrack = trackFilter === 'all' || track.category === trackFilter;

    return matchesSearch && matchesTrack;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    }
    if (sortBy === 'track') {
      const trackA = getCourseTrack(a.name || '').track;
      const trackB = getCourseTrack(b.name || '').track;
      return trackA.localeCompare(trackB);
    }
    // 'semester' chronological sorting: extract year/semester numbers if present
    const yearA = parseInt((a.name || '').match(/\b(20\d\d)\b/)?.[0] || '2024');
    const yearB = parseInt((b.name || '').match(/\b(20\d\d)\b/)?.[0] || '2024');
    if (yearB !== yearA) return yearB - yearA;

    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="h-8 w-8 text-indigo-400" />
            Course Workspace & Archives
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse current subjects and access past semester materials from your Google Classroom archived vault.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search courses, teachers, codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-zinc-900/90 border-zinc-800 text-xs text-zinc-100 rounded-2xl focus:border-indigo-500/50 shadow-inner"
          />
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="space-y-4">
        {/* Main Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('active')}
              className={`relative flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'active' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Active Subjects</span>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
                {courses.length}
              </span>
              {activeTab === 'active' && (
                <motion.div
                  layoutId="activeCoursesTabIndicator"
                  className="absolute inset-0 -z-10 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`relative flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'archived' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Archive className="h-4 w-4 text-amber-400" />
              <span>Archived Vault</span>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
                {archivedCourses.length}
              </span>
              {activeTab === 'archived' && (
                <motion.div
                  layoutId="activeCoursesTabIndicator"
                  className="absolute inset-0 -z-10 rounded-2xl bg-zinc-800/90 border border-zinc-700/60 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          </div>

          {/* Sort & Order Dropdown Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 p-1 text-xs">
              <span className="text-[11px] text-zinc-400 pl-2 font-semibold flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" /> Sort:
              </span>
              <button
                onClick={() => setSortBy('semester')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  sortBy === 'semester'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {activeTab === 'archived' ? 'Semester Order' : 'Semester'}
              </button>
              <button
                onClick={() => setSortBy('name-asc')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  sortBy === 'name-asc'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSortBy('track')}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  sortBy === 'track'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                By Track
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          <button
            onClick={() => setTrackFilter('all')}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
              trackFilter === 'all'
                ? 'bg-white text-zinc-950 border-white shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            All ({currentList.length})
          </button>
          <button
            onClick={() => setTrackFilter('design')}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
              trackFilter === 'design'
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-purple-950/30 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
            }`}
          >
            Design & UX
          </button>
          <button
            onClick={() => setTrackFilter('cs')}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
              trackFilter === 'cs'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40'
            }`}
          >
            Core CS & Algorithms
          </button>
          <button
            onClick={() => setTrackFilter('systems')}
            className={`rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
              trackFilter === 'systems'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                : 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900/40'
            }`}
          >
            Systems & Math
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-3xl bg-zinc-900 border border-zinc-800"
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {sortedCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/30 p-12 text-center"
            >
              <Archive className="mb-3 h-12 w-12 text-zinc-600" />
              <h3 className="text-base font-bold text-zinc-200">
                No {activeTab === 'active' ? 'Active' : 'Archived'} Courses Match Filters
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                {searchQuery || trackFilter !== 'all'
                  ? 'Try clearing the search or category filters.'
                  : `Your Google Classroom has no courses marked as ${activeTab}.`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${sortBy}-${trackFilter}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {sortedCourses.map((course, idx) => {
                const gradientClass = GRADIENTS[idx % GRADIENTS.length];
                const track = getCourseTrack(course.name || '');

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Link
                      href={`/courses/${course.id}`}
                      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl transition-all ${gradientClass}`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${track.color}`}
                          >
                            <Tag className="h-3 w-3" />
                            {track.track}
                          </span>

                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-white">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>

                        <h3 className="text-xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
                          {course.name}
                        </h3>

                        {course.descriptionHeading && (
                          <p className="text-xs text-zinc-400 flex items-center gap-1.5 line-clamp-1">
                            <User className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                            <span>{course.descriptionHeading}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between text-xs text-zinc-400">
                        <span className="text-[11px] font-medium text-zinc-500">
                          {activeTab === 'archived' ? 'Archived Semester Record' : 'Active Subject'}
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-400 group-hover:text-indigo-300">
                          Open Vault &rarr;
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
