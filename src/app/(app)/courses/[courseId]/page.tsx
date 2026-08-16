'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, FileText, Megaphone, CheckCircle2, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ClassroomCourse, ClassroomCourseWork, ClassroomAnnouncement, ClassroomStudentSubmission } from '@/types';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'assignments' | 'announcements'>('assignments');
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ClassroomCourse | null>(null);
  const [coursework, setCoursework] = useState<ClassroomCourseWork[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [submissions, setSubmissions] = useState<ClassroomStudentSubmission[]>([]);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        const [courseRes, courseworkRes, announcementsRes, submissionsRes] = await Promise.all([
          fetch(`/api/classroom/courses/${courseId}`),
          fetch(`/api/classroom/courses/${courseId}/coursework`),
          fetch(`/api/classroom/courses/${courseId}/announcements`),
          fetch(`/api/classroom/courses/${courseId}/submissions`),
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourse(courseData.course || courseData);
        }

        if (courseworkRes.ok) {
          const cwData = await courseworkRes.json();
          setCoursework(Array.isArray(cwData) ? cwData : cwData.coursework || []);
        }

        if (announcementsRes.ok) {
          const annData = await announcementsRes.json();
          setAnnouncements(Array.isArray(annData) ? annData : annData.announcements || []);
        }

        if (submissionsRes.ok) {
          const subData = await submissionsRes.json();
          setSubmissions(Array.isArray(subData) ? subData : subData.submissions || []);
        }
      } catch (error) {
        console.error('Failed to fetch course data', error);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-24 rounded-md bg-zinc-800" />
        <div className="h-36 rounded-xl bg-zinc-900 border border-zinc-800" />
        <div className="flex gap-4 border-b border-zinc-800 pb-2">
          <div className="h-8 w-32 rounded-md bg-zinc-800" />
          <div className="h-8 w-32 rounded-md bg-zinc-800" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-zinc-900 border border-zinc-800" />)}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-zinc-100">Course not found</h2>
        <p className="text-sm text-zinc-400 mt-2">Could not retrieve information for this course.</p>
        <button
          onClick={() => router.push('/courses')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Course</span>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mt-1">{course.name}</h1>
          {course.section && <p className="mt-1 text-base text-zinc-400">{course.section}</p>}
          {course.descriptionHeading && (
            <p className="mt-2 text-sm text-zinc-400">{course.descriptionHeading}</p>
          )}
        </div>
        {course.alternateLink && (
          <a
            href={course.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            Open in Classroom
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="border-b border-zinc-800">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            Assignments & Coursework ({coursework.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            Announcements ({announcements.length})
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {coursework.length === 0 ? (
              <div className="rounded-xl border border-zinc-800/80 border-dashed bg-zinc-900/30 p-12 text-center text-zinc-500">
                <FileText className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p>No coursework found for this course.</p>
              </div>
            ) : (
              coursework.map((work) => {
                const submission = submissions.find((s) => s.courseWorkId === work.id);
                const hasGrade = submission?.assignedGrade !== undefined && submission?.assignedGrade !== null;

                return (
                  <div
                    key={work.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-indigo-500/10 p-3 mt-1 shrink-0">
                        <FileText className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-zinc-100">{work.title}</h3>
                        {work.description && (
                          <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{work.description}</p>
                        )}
                        {work.dueDate && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                            <span>
                              Due: {work.dueDate.day}/{work.dueDate.month}/{work.dueDate.year}
                              {work.dueTime && ` at ${work.dueTime.hours}:${String(work.dueTime.minutes || 0).padStart(2, '0')}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {hasGrade ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1 text-xs font-semibold text-green-400">
                          <Award className="h-3.5 w-3.5" />
                          {submission.assignedGrade} / {work.maxPoints || 100} pts
                        </span>
                      ) : work.maxPoints ? (
                        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                          {work.maxPoints} pts
                        </span>
                      ) : null}

                      {work.alternateLink && (
                        <a
                          href={work.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          Submit
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="rounded-xl border border-zinc-800/80 border-dashed bg-zinc-900/30 p-12 text-center text-zinc-500">
                <Megaphone className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p>No announcements posted yet.</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Megaphone className="h-4 w-4 text-indigo-400" />
                      <span>
                        {announcement.creationTime ? format(new Date(announcement.creationTime), 'MMM d, yyyy • h:mm a') : 'Class announcement'}
                      </span>
                    </div>
                    {announcement.alternateLink && (
                      <a
                        href={announcement.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        Classroom <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-zinc-200 leading-relaxed">{announcement.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
