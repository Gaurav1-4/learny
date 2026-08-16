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
  BookOpen,
  User,
  AlertCircle,
  FileIcon,
  Video,
  Globe,
  Download,
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
import { Badge } from '@/components/ui/badge';
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <FileText className="h-3.5 w-3.5 text-zinc-400" />
        <span className="max-w-[200px] truncate">{df.title || 'Attached File'}</span>
        <ExternalLink className="h-3 w-3 text-zinc-500" />
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Video className="h-3.5 w-3.5 text-zinc-400" />
        <span className="max-w-[200px] truncate">{yv.title || 'YouTube Video'}</span>
        <ExternalLink className="h-3 w-3 text-zinc-500" />
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Globe className="h-3.5 w-3.5 text-zinc-400" />
        <span className="max-w-[200px] truncate">{lk.title || lk.url || 'Web Link'}</span>
        <ExternalLink className="h-3 w-3 text-zinc-500" />
      </a>
    );
  }

  if (item.form) {
    const fm = item.form;
    return (
      <a
        href={fm.formUrl || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <FileText className="h-3.5 w-3.5 text-zinc-400" />
        <span className="max-w-[200px] truncate">{fm.title || 'Google Form'}</span>
        <ExternalLink className="h-3 w-3 text-zinc-500" />
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
  const [activeTab, setActiveTab] = useState<string>('suite');

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

          // Decide default tab: if course has custom suite, default to 'suite', otherwise default to 'all'
          const cName = (crs.name || '').toLowerCase();
          const hasCustomSuite =
            cName.includes('math') ||
            cName.includes('mth') ||
            cName.includes('operating') ||
            cName.includes('os') ||
            cName.includes('programming') ||
            cName.includes('ap') ||
            cName.includes('dpp') ||
            cName.includes('design') ||
            cName.includes('rmssd') ||
            cName.includes('research');

          setActiveTab(hasCustomSuite ? 'suite' : 'all');
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
      <div className="space-y-6 animate-pulse max-w-5xl">
        <div className="h-5 w-28 rounded bg-zinc-800" />
        <div className="h-36 rounded-xl bg-zinc-900/60 border border-zinc-800" />
        <div className="flex gap-2 border-b border-zinc-800 pb-2">
          <div className="h-8 w-28 rounded-lg bg-zinc-800" />
          <div className="h-8 w-28 rounded-lg bg-zinc-800" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/30 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-zinc-500 mb-2" />
        <h2 className="text-lg font-bold text-zinc-100">Course Not Found</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Could not load the course details from Google Classroom.
        </p>
        <Button
          onClick={() => router.push('/courses')}
          className="mt-4 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Return to Courses
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
  const hasCustomSuite =
    cName.includes('math') ||
    cName.includes('mth') ||
    cName.includes('operating') ||
    cName.includes('os') ||
    cName.includes('programming') ||
    cName.includes('ap') ||
    cName.includes('dpp') ||
    cName.includes('design') ||
    cName.includes('rmssd') ||
    cName.includes('research');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl"
    >
      {/* Back Button */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
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
              {course.section && <span className="text-xs text-zinc-500">{course.section}</span>}
              {course.room && <span className="text-xs text-zinc-500">• Room {course.room}</span>}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {course.name}
            </h1>

            {course.descriptionHeading && (
              <p className="text-xs text-zinc-400">{course.descriptionHeading}</p>
            )}

            <div className="flex items-center gap-4 pt-2 text-xs text-zinc-400">
              <div>
                <span className="font-semibold text-zinc-200">{coursework.length}</span>{' '}
                Assignments
              </div>
              <div>•</div>
              <div>
                <span className="font-semibold text-zinc-200">{materials.length}</span> Notes &amp;
                Materials
              </div>
              <div>•</div>
              <div>
                <span className="font-semibold text-zinc-200">{announcements.length}</span> Notices
              </div>
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

      {/* Segmented Tab Bar */}
      <div className="flex items-center gap-1 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-none flex-nowrap">
        {hasCustomSuite && (
          <button
            onClick={() => setActiveTab('suite')}
            className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'suite'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Study Suite
          </button>
        )}

        <button
          onClick={() => setActiveTab('all')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All Content ({coursework.length + materials.length + announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'materials'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Notes &amp; Materials ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Assignments ({coursework.length})
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'announcements'
              ? 'bg-zinc-800 text-white font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Notices ({announcements.length})
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'suite' && hasCustomSuite ? (
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
        ) : activeTab === 'materials' ? (
          <motion.div
            key="materials-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {materials.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 p-8 text-center">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-300">No Course Materials Posted</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Lecture slides, reference PDFs, and reading materials posted by the teacher will appear here.
                </p>
              </div>
            ) : (
              materials.map((mat) => (
                <div
                  key={mat.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          Lecture Material
                        </span>
                        {mat.updateTime && (
                          <span className="text-[11px] text-zinc-500">
                            {format(new Date(mat.updateTime), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white">{mat.title}</h4>
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
                        className="rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 p-2 text-zinc-300 hover:text-white transition-colors shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {mat.materials && mat.materials.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                      {mat.materials.map((item, idx) => (
                        <AttachmentBadge key={idx} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        ) : activeTab === 'assignments' ? (
          <motion.div
            key="assignments-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {coursework.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 p-8 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-300">No Coursework Posted</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Assignments and homework will appear here.
                </p>
              </div>
            ) : (
              coursework.map((item) => {
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
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isGraded ? (
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-white border border-zinc-700">
                              Graded: {submission?.assignedGrade} / {item.maxPoints || 100} pts
                            </span>
                          ) : isSubmitted ? (
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                              Turned In
                            </span>
                          ) : isPastDue ? (
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                              Overdue
                            </span>
                          ) : (
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                              Assigned
                            </span>
                          )}

                          {item.maxPoints && !isGraded && (
                            <span className="text-[11px] text-zinc-500">
                              {item.maxPoints} pts
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {dueDateObj && (
                          <div className="text-[11px] text-zinc-400">
                            Due {format(dueDateObj, 'MMM d, h:mm a')}
                          </div>
                        )}
                        {item.alternateLink && (
                          <a
                            href={item.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white mt-1"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {item.materials && item.materials.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                        {item.materials.map((mat, idx) => (
                          <AttachmentBadge key={idx} item={mat} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        ) : activeTab === 'announcements' ? (
          <motion.div
            key="announcements-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {announcements.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 p-8 text-center">
                <Megaphone className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-300">No Announcements</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Notices and updates from your teacher will appear here.
                </p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Notice</span>
                    {ann.creationTime && (
                      <span>{format(new Date(ann.creationTime), 'MMM d, yyyy • h:mm a')}</span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                    {ann.text}
                  </p>

                  {ann.materials && ann.materials.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                      {ann.materials.map((mat, idx) => (
                        <AttachmentBadge key={idx} item={mat} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        ) : (
          /* Unified "All Content" Timeline */
          <motion.div
            key="all-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {coursework.length === 0 && materials.length === 0 && announcements.length === 0 ? (
              <div className="rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 p-8 text-center">
                <BookOpen className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-300">No Content Posted Yet</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  When your instructor posts assignments, materials, or announcements, they will appear here.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Materials Section */}
                {materials.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Lecture Slides &amp; Notes ({materials.length})
                    </h3>
                    <div className="space-y-2">
                      {materials.map((mat) => (
                        <div
                          key={mat.id}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">{mat.title}</h4>
                              {mat.description && (
                                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                                  {mat.description}
                                </p>
                              )}
                            </div>
                            {mat.alternateLink && (
                              <a
                                href={mat.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-400 hover:text-white shrink-0"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {mat.materials && mat.materials.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                              {mat.materials.map((item, idx) => (
                                <AttachmentBadge key={idx} item={item} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Coursework Section */}
                {coursework.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Assignments &amp; Homework ({coursework.length})
                    </h3>
                    <div className="space-y-2">
                      {coursework.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                              {item.description && (
                                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            {item.alternateLink && (
                              <a
                                href={item.alternateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-400 hover:text-white shrink-0"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {item.materials && item.materials.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                              {item.materials.map((mat, idx) => (
                                <AttachmentBadge key={idx} item={mat} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Announcements Section */}
                {announcements.length > 0 && (
                  <div className="space-y-2 pt-3">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Notices &amp; Announcements ({announcements.length})
                    </h3>
                    <div className="space-y-2">
                      {announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-1.5"
                        >
                          <div className="text-[11px] text-zinc-500">
                            {ann.creationTime &&
                              format(new Date(ann.creationTime), 'MMM d, yyyy • h:mm a')}
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{ann.text}</p>
                          {ann.materials && ann.materials.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/80">
                              {ann.materials.map((mat, idx) => (
                                <AttachmentBadge key={idx} item={mat} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
