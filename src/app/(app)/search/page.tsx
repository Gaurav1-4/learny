'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, FileText, BookOpen, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ClassroomCourse, ClassroomCourseWork } from '@/types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface SearchHit {
  type: 'Course' | 'Assignment';
  id: string;
  title: string;
  subtitle?: string;
  courseName?: string;
  dueDate?: string;
  link: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [coursework, setCoursework] = useState<ClassroomCourseWork[]>([]);

  // Fetch all initial data
  useEffect(() => {
    async function fetchAll() {
      try {
        setInitialLoading(true);
        const [coursesRes, courseworkRes] = await Promise.all([
          fetch('/api/classroom/courses'),
          fetch('/api/classroom/coursework'),
        ]);

        if (coursesRes.ok) {
          const cData = await coursesRes.json();
          setCourses(Array.isArray(cData) ? cData : cData.courses || []);
        }

        if (courseworkRes.ok) {
          const cwData = await courseworkRes.json();
          setCoursework(Array.isArray(cwData) ? cwData : cwData.coursework || []);
        }
      } catch (err) {
        console.error('Failed to fetch search data', err);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Filter client-side
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const q = debouncedQuery.toLowerCase();
    const hits: SearchHit[] = [];

    // 1. Search Courses
    courses.forEach((c) => {
      if (
        c.name?.toLowerCase().includes(q) ||
        c.section?.toLowerCase().includes(q) ||
        c.descriptionHeading?.toLowerCase().includes(q)
      ) {
        hits.push({
          type: 'Course',
          id: c.id,
          title: c.name,
          subtitle: c.section || c.descriptionHeading || 'Google Classroom Course',
          link: `/courses/${c.id}`,
        });
      }
    });

    // 2. Search Coursework
    coursework.forEach((w) => {
      if (
        w.title?.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q)
      ) {
        const course = courses.find((c) => c.id === w.courseId);
        let dueStr: string | undefined;
        if (w.dueDate) {
          dueStr = `Due ${w.dueDate.day}/${w.dueDate.month}/${w.dueDate.year}`;
        }

        hits.push({
          type: 'Assignment',
          id: w.id,
          title: w.title,
          subtitle: w.description ? w.description.slice(0, 120) + (w.description.length > 120 ? '...' : '') : undefined,
          courseName: course?.name || 'Classroom Course',
          dueDate: dueStr,
          link: `/courses/${w.courseId}`,
        });
      }
    });

    setResults(hits);
    setLoading(false);
  }, [debouncedQuery, courses, coursework]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Search Workspace</h1>
        <p className="mt-1 text-sm text-zinc-400">Instantly search across all enrolled courses, assignments, and study materials.</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          autoFocus
          type="text"
          placeholder="Search by topic, course, assignment name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-4 pl-12 pr-4 text-base text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div>
        {initialLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
            ))}
          </div>
        ) : !query.trim() ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <SearchIcon className="mb-4 h-12 w-12 opacity-30 text-indigo-400" />
            <p className="text-sm font-medium text-zinc-400">Type to search through {courses.length} courses and {coursework.length} assignments.</p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-900 border border-zinc-800" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-400">
            <p>No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-zinc-500 mt-1">Try a different keyword or search for course codes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">
              Found {results.length} matching item{results.length === 1 ? '' : 's'}
            </div>
            {results.map((result, idx) => (
              <Link
                key={`${result.type}-${result.id}-${idx}`}
                href={result.link}
                className="group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 transition-all hover:border-indigo-500/50 hover:bg-zinc-800/50 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 mt-0.5">
                  {result.type === 'Course' ? (
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-indigo-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors truncate">
                      {result.title}
                    </h3>
                    <span className="shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                      {result.type}
                    </span>
                  </div>
                  {result.courseName && (
                    <p className="text-xs text-indigo-400 font-medium mt-0.5">{result.courseName}</p>
                  )}
                  {result.subtitle && (
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-1">{result.subtitle}</p>
                  )}
                  {result.dueDate && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
                      <Calendar className="h-3 w-3" />
                      <span>{result.dueDate}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
