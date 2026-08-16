'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Megaphone,
  BookOpen,
  AlertCircle,
  Video,
  Globe,
  Plus,
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import {
  ClassroomCourse,
  ClassroomCourseWork,
  ClassroomAnnouncement,
  ClassroomStudentSubmission,
  ClassroomCourseWorkMaterial,
  ClassroomMaterialItem,
} from '@/types';
import { Button } from '@/components/ui/button';
import { SubjectWorkflowSuite } from '@/components/courses/subject-workflow-suite';

function AttachmentBadge({ item }: { item: ClassroomMaterialItem }) {
  if (item.driveFile?.driveFile) {
    const df = item.driveFile.driveFile;
    return (
      <a
        href={df.alternateLink || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <FileText className="h-3 w-3 text-zinc-400" />
        <span className="max-w-[180px] truncate">{df.title || 'Attached File'}</span>
        <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
      </a>
    );
  }

  if (item.youtubeVideo) {
    const yv = item.youtubeVideo;
    return (
      <a
        href={yv.alternateLink || `https://youtube.com/watch?v=${yv.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Video className="h-3 w-3 text-zinc-400" />
        <span className="max-w-[180px] truncate">{yv.title || 'YouTube Video'}</span>
        <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
      </a>
    );
  }

  if (item.link) {
    const lk = item.link;
    return (
      <a
        href={lk.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Globe className="h-3 w-3 text-zinc-400" />
        <span className="max-w-[180px] truncate">{lk.title || lk.url || 'Link'}</span>
        <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
      </a>
    );
  }

  return null;
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ClassroomCourse | null>(null);
  const [coursework, setCoursework] = useState<ClassroomCourseWork[]>([]);
  const [materials, setMaterials] = useState<ClassroomCourseWorkMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [submissions, setSubmissions] = useState<ClassroomStudentSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        const [courseRes, courseworkRes, materialsRes, announcementsRes, submissionsRes] =
          await Promise.all([
            fetch(`/api/classroom/courses/${courseId}`),
            fetch(`/api/classroom/courses/${courseId}/coursework`),
            fetch(`/api/classroom/courses/${courseId}/materials`),
            fetch(`/api/classroom/courses/${courseId}/announcements`),
            fetch(`/api/classroom/courses/${courseId}/submissions`),
          ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const crs = courseData.course || courseData;
          setCourse(crs);

          // Only default to problem sets if this is specifically Math III (MTH201)
          const cName = (crs.name || '').toLowerCase();
          const isMath3Course =
            (cName.includes('math') && cName.includes('iii')) ||
            cName.includes('mth201') ||
            courseId.includes('mth201');

          setActiveTab(isMath3Course ? 'practice' : 'all');
        }

        if (courseworkRes.ok) {
          const cwData = await courseworkRes.json();
          setCoursework(Array.isArray(cwData) ? cwData : cwData.coursework || []);
        }

        if (materialsRes.ok) {
          const matData = await materialsRes.json();
          setMaterials(Array.isArray(matData) ? matData : matData.materials || []);
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
      <div className="space-y-4 animate-pulse max-w-4xl">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-16 rounded-xl bg-zinc-900/60 border border-zinc-800" />
        <div className="h-40 rounded-xl bg-zinc-900 border border-zinc-800" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-zinc-800 border-dashed bg-zinc-900/20 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-zinc-500 mb-2" />
        <h2 className="text-sm font-semibold text-zinc-100">Course Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Could not load the course details from Google Classroom.
        </p>
        <Button
          onClick={() => router.push('/courses')}
          className="mt-4 bg-white text-zinc-950 hover:bg-zinc-200 text-xs h-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Return to Courses
        </Button>
      </div>
    );
  }

  const submissionMap = new Map<string, ClassroomStudentSubmission>();
  submissions.forEach((sub) => {
    if (sub.courseWorkId) {
      submissionMap.set(sub.courseWorkId, sub);
    }
  });

  const cName = (course.name || '').toLowerCase();
  const isMath3Course =
    (cName.includes('math') && cName.includes('iii')) ||
    cName.includes('mth201') ||
    courseId.includes('mth201');

  const totalItems = coursework.length + materials.length + announcements.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 max-w-4xl"
    >
      {/* Compact Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Courses</span>
        </Link>

        {course.alternateLink && (
          <a
            href={course.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 transition-colors"
          >
            <span>Classroom</span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>
        )}
      </div>

      {/* Minimal Header Title */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            {course.section ? `${course.section} • ` : ''}
            {course.room ? `Room ${course.room}` : 'Classroom'}
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
          {course.name}
        </h1>
      </div>

      {/* Segmented Tab Filter */}
      <div className="flex items-center gap-1 border-b border-zinc-800/80 pb-2 overflow-x-auto scrollbar-none flex-nowrap text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All ({totalItems})
        </button>

        {materials.length > 0 && (
          <button
            onClick={() => setActiveTab('materials')}
            className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === 'materials'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Notes &amp; Slides ({materials.length})
          </button>
        )}

        {coursework.length > 0 && (
          <button
            onClick={() => setActiveTab('assignments')}
            className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Assignments ({coursework.length})
          </button>
        )}

        {announcements.length > 0 && (
          <button
            onClick={() => setActiveTab('announcements')}
            className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Notices ({announcements.length})
          </button>
        )}

        {isMath3Course && (
          <button
            onClick={() => setActiveTab('practice')}
            className={`shrink-0 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === 'practice'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Problem Sets (KaTeX)
          </button>
        )}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'practice' && isMath3Course ? (
          <motion.div
            key="practice-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SubjectWorkflowSuite
              courseId={course.id}
              courseName={course.name}
              courseSection={course.section}
              materials={materials}
              coursework={coursework}
              announcements={announcements}
            />
          </motion.div>
        ) : activeTab === 'materials' ? (
          <motion.div
            key="materials-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">{mat.title}</h4>
                    {mat.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                        {mat.description}
                      </p>
                    )}
                  </div>
                  {mat.alternateLink && (
                    <a
                      href={mat.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {mat.materials && mat.materials.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                    {mat.materials.map((item, idx) => (
                      <AttachmentBadge key={idx} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        ) : activeTab === 'assignments' ? (
          <motion.div
            key="assignments-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            {coursework.map((item) => {
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
                <div
                  key={item.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-2 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isGraded ? (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-white border border-zinc-700">
                            Graded: {submission?.assignedGrade} / {item.maxPoints || 100}
                          </span>
                        ) : isSubmitted ? (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                            Turned In
                          </span>
                        ) : isPastDue ? (
                          <span className="rounded bg-red-950/40 text-red-400 border border-red-800/40 px-1.5 py-0.5 text-[10px] font-medium">
                            Overdue
                          </span>
                        ) : (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                            Assigned
                          </span>
                        )}

                        {dueDateObj && (
                          <span className="text-[11px] text-zinc-500">
                            • Due {format(dueDateObj, 'MMM d, h:mm a')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                      {item.description && (
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.alternateLink && (
                      <a
                        href={item.alternateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-white p-1 shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {item.materials && item.materials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                      {item.materials.map((mat, idx) => (
                        <AttachmentBadge key={idx} item={mat} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        ) : (
          /* Unified "All Content" Timeline */
          <motion.div
            key="all-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {totalItems === 0 ? (
              <div className="rounded-xl border border-zinc-800 border-dashed bg-zinc-900/20 p-8 text-center">
                <BookOpen className="mx-auto mb-2 h-7 w-7 text-zinc-600" />
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-300">
                  No Classroom Content Posted Yet
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                  When your instructor uploads lecture slides, assignments, or notices to Google Classroom, they will appear here.
                </p>
                {course.alternateLink && (
                  <a
                    href={course.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-white text-zinc-950 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    <span>Open in Google Classroom</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ) : (
              <>
                {/* 1. Materials */}
                {materials.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                      Lecture Slides &amp; Notes
                    </div>
                    {materials.map((mat) => (
                      <div
                        key={mat.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-white">{mat.title}</h4>
                          {mat.alternateLink && (
                            <a
                              href={mat.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-white p-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {mat.description && (
                          <p className="text-xs text-zinc-400 line-clamp-2">{mat.description}</p>
                        )}
                        {mat.materials && mat.materials.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-800/60">
                            {mat.materials.map((item, idx) => (
                              <AttachmentBadge key={idx} item={item} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Coursework */}
                {coursework.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                      Assignments
                    </div>
                    {coursework.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                          {item.alternateLink && (
                            <a
                              href={item.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-white p-0.5"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {item.materials && item.materials.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-800/60">
                            {item.materials.map((mat, idx) => (
                              <AttachmentBadge key={idx} item={mat} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Announcements */}
                {announcements.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-1">
                      Notices
                    </div>
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-1"
                      >
                        <p className="text-xs text-zinc-300 leading-relaxed">{ann.text}</p>
                        {ann.materials && ann.materials.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-800/60">
                            {ann.materials.map((mat, idx) => (
                              <AttachmentBadge key={idx} item={mat} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
