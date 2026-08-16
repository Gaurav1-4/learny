'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  FileText,
  Megaphone,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  Timer,
  Brain,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  User,
  Layers,
  AlertCircle,
  Calculator,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { ClassroomCourse, ClassroomCourseWork, ClassroomAnnouncement, ClassroomStudentSubmission } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';
import { SubjectWorkflowSuite } from '@/components/courses/subject-workflow-suite';

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'suite' | 'assignments' | 'announcements'>('suite');
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ClassroomCourse | null>(null);
  const [coursework, setCoursework] = useState<ClassroomCourseWork[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [submissions, setSubmissions] = useState<ClassroomStudentSubmission[]>([]);
  const [copiedAnnId, setCopiedAnnId] = useState<string | null>(null);

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

  const handleCopyAnnouncement = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAnnId(id);
    setTimeout(() => setCopiedAnnId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-6xl">
        <div className="h-6 w-32 rounded-lg bg-zinc-800" />
        <div className="h-56 rounded-3xl bg-zinc-900/80 border border-zinc-800" />
        <div className="flex gap-4 border-b border-zinc-800 pb-3">
          <div className="h-10 w-40 rounded-xl bg-zinc-800" />
          <div className="h-10 w-40 rounded-xl bg-zinc-800" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/30 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-zinc-600 mb-3" />
        <h2 className="text-2xl font-bold text-zinc-100">Course Not Found</h2>
        <p className="text-sm text-zinc-400 mt-1 max-w-md">
          Could not load the course details from Google Classroom.
        </p>
        <Button
          onClick={() => router.push('/courses')}
          className="mt-6 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Courses
        </Button>
      </div>
    );
  }

  // Calculate submission map
  const submissionMap = new Map<string, ClassroomStudentSubmission>();
  submissions.forEach((sub) => {
    if (sub.courseWorkId) {
      submissionMap.set(sub.courseWorkId, sub);
    }
  });

  const gradedCount = submissions.filter((s) => s.assignedGrade !== undefined).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-8 max-w-6xl"
    >
      {/* Back Button */}
      <Link
        href="/courses"
        className="group inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to courses</span>
      </Link>

      {/* Clean Editorial Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                {course.courseState === 'ARCHIVED' ? 'Archived' : 'Active'}
              </span>
              {course.section && (
                <span className="text-xs text-zinc-500">
                  {course.section}
                </span>
              )}
              {course.room && (
                <span className="text-xs text-zinc-500">
                  • Room {course.room}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {course.name}
            </h1>

            {course.descriptionHeading && (
              <p className="text-xs text-zinc-400">
                {course.descriptionHeading}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400">
              <div><span className="font-semibold text-zinc-200">{coursework.length}</span> Assignments</div>
              <div>•</div>
              <div><span className="font-semibold text-zinc-200">{announcements.length}</span> Notices</div>
            </div>
          </div>

          {/* Actions */}
          {course.alternateLink && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/notebooklm"
                className="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors"
              >
                NotebookLM
              </Link>
              <a
                href={course.alternateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 px-3.5 py-2 text-xs font-medium transition-colors"
              >
                <span>Classroom</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Minimal Segmented Tab Bar */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none flex-nowrap">
        <button
          onClick={() => setActiveTab('suite')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'suite' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Study Suite
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'assignments' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Assignments ({coursework.length})
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'announcements' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Notices ({announcements.length})
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'suite' ? (
          <motion.div
            key="suite-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SubjectWorkflowSuite
              courseId={course.id}
              courseName={course.name}
              courseSection={course.section}
            />
          </motion.div>
        ) : activeTab === 'assignments' ? (
          <motion.div
            key="assignments-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {coursework.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/30 p-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-zinc-600" />
                <h3 className="text-base font-bold text-zinc-200">No Coursework Posted</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Assignments, quizzes, and homework posted by your instructor will appear here with instant deadline tracking.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {coursework.map((item, index) => {
                  const submission = submissionMap.get(item.id);
                  const isGraded = submission?.assignedGrade !== undefined;
                  const isSubmitted = submission?.state === 'TURNED_IN';

                  let dueDateObj: Date | null = null;
                  if (item.dueDate) {
                    const y = item.dueDate.year || new Date().getFullYear();
                    const m = (item.dueDate.month || 1) - 1;
                    const d = item.dueDate.day || 1;
                    const h = item.dueTime?.hours || 23;
                    const min = item.dueTime?.minutes || 59;
                    dueDateObj = new Date(y, m, d, h, min);
                  }

                  const isPastDue = dueDateObj ? isPast(dueDateObj) : false;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                      className="group relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:bg-zinc-800/40 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Assignment Icon */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                            <FileText className="h-6 w-6" />
                          </div>

                          <div className="space-y-1.5">
                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2">
                              {isGraded ? (
                                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-bold gap-1">
                                  <Award className="h-3 w-3" /> Graded: {submission?.assignedGrade} / {item.maxPoints || 100} pts
                                </Badge>
                              ) : isSubmitted ? (
                                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs font-bold gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Turned In
                                </Badge>
                              ) : isPastDue ? (
                                <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs font-bold gap-1">
                                  <Clock className="h-3 w-3" /> Overdue
                                </Badge>
                              ) : (
                                <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/30 text-xs font-bold gap-1">
                                  <Clock className="h-3 w-3" /> Assigned
                                </Badge>
                              )}

                              {item.maxPoints && !isGraded && (
                                <span className="text-xs text-zinc-400 font-medium">
                                  {item.maxPoints} Points
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                              {item.title}
                            </h3>

                            {/* Description */}
                            {item.description && (
                              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed pt-1">
                                {item.description}
                              </p>
                            )}

                            {/* Due Date Indicator */}
                            {dueDateObj && (
                              <div className="flex items-center gap-2 pt-2 text-xs font-medium">
                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                <span className={isPastDue ? 'text-red-400' : 'text-zinc-300'}>
                                  Due {format(dueDateObj, 'dd MMM yyyy, hh:mm a')}
                                </span>
                                <span className="text-zinc-500 font-normal">
                                  ({isPastDue ? 'Passed ' : 'in '}
                                  {formatDistanceToNow(dueDateObj, { addSuffix: false })})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                          {item.alternateLink && (
                            <a
                              href={item.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-bold text-zinc-200 transition-all hover:text-white"
                            >
                              <span>Submit in Classroom</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <Link
                            href="/timer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
                          >
                            <Timer className="h-3 w-3 text-amber-400" />
                            <span>Focus Session</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="announcements-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {announcements.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-zinc-800 border-dashed bg-zinc-900/30 p-12 text-center">
                <Megaphone className="mb-3 h-10 w-10 text-zinc-600" />
                <h3 className="text-base font-bold text-zinc-200">No Announcements Yet</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Course updates, lecture slides, and notices posted by your instructor will appear in this stream.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann, index) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.25 }}
                    className="relative overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-6 backdrop-blur-sm shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold text-xs">
                          <Megaphone className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-200">
                            {course.descriptionHeading || 'Instructor Announcement'}
                          </span>
                          <div className="text-[11px] text-zinc-500">
                            {ann.creationTime
                              ? format(new Date(ann.creationTime), 'dd MMMM yyyy, hh:mm a')
                              : 'Recent'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyAnnouncement(ann.id, ann.text)}
                          className="h-8 text-xs text-zinc-400 hover:text-white"
                        >
                          {copiedAnnId === ann.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Note
                            </>
                          )}
                        </Button>
                        {ann.alternateLink && (
                          <a
                            href={ann.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-zinc-200 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {ann.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
