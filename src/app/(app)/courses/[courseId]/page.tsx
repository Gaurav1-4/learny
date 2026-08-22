'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  BookOpen,
  AlertCircle,
  Video,
  Globe,
  Sparkles,
  Layers,
  ClipboardList,
} from 'lucide-react';
import { format, isPast } from 'date-fns';
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
import { DocumentNotebookView, DocumentNotebookData } from '@/components/notebooklm/document-notebooklm-view';
import { SwipeableTabs, SwipeableTabItem } from '@/components/ui/swipeable-tabs';

function AttachmentBadge({
  item,
  onOpenNotebook,
}: {
  item: ClassroomMaterialItem;
  onOpenNotebook?: (title: string, link?: string) => void;
}) {
  if (item.driveFile?.driveFile) {
    const df = item.driveFile.driveFile;
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300">
        <FileText className="h-3 w-3 text-zinc-400" />
        <span className="max-w-[180px] truncate">{df.title || 'Attached File'}</span>
        {df.alternateLink && (
          <a
            href={df.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white"
          >
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
        {onOpenNotebook && (
          <button
            onClick={() => onOpenNotebook(df.title || 'Attached File', df.alternateLink)}
            className="ml-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
            title="Open in NotebookLM"
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span>Notebook</span>
          </button>
        )}
      </div>
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
  const [activeTab, setActiveTab] = useState<string>('study-suite');
  const [activeNotebookDoc, setActiveNotebookDoc] = useState<DocumentNotebookData | null>(null);

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

        let hasClassroomItems = false;

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const crs = courseData.course || courseData;
          setCourse(crs);
        }

        if (courseworkRes.ok) {
          const cwData = await courseworkRes.json();
          const cw = Array.isArray(cwData) ? cwData : cwData.coursework || [];
          setCoursework(cw);
          if (cw.length > 0) hasClassroomItems = true;
        }

        if (materialsRes.ok) {
          const matData = await materialsRes.json();
          const mats = Array.isArray(matData) ? matData : matData.materials || [];
          setMaterials(mats);
          if (mats.length > 0) hasClassroomItems = true;
        }

        if (announcementsRes.ok) {
          const annData = await announcementsRes.json();
          const anns = Array.isArray(annData) ? annData : annData.announcements || [];
          setAnnouncements(anns);
          if (anns.length > 0) hasClassroomItems = true;
        }

        if (submissionsRes.ok) {
          const subData = await submissionsRes.json();
          setSubmissions(Array.isArray(subData) ? subData : subData.submissions || []);
        }

        setActiveTab(hasClassroomItems ? 'classroom-stream' : 'study-suite');
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

  const totalClassroomItems = coursework.length + materials.length + announcements.length;
  const cName = (course.name || '').toLowerCase();
  const isMathCourse =
    cName.includes('math') ||
    cName.includes('mth') ||
    cName.includes('calculus') ||
    cName.includes('algebra');

  const courseTabs: SwipeableTabItem[] = [
    {
      id: 'study-suite',
      label: isMathCourse ? 'Problem Sets & Practice' : 'Study Tutor & Prompts',
      icon: <Sparkles className="h-3.5 w-3.5 text-indigo-400" />,
      content: (
        <SubjectWorkflowSuite
          courseId={course.id}
          courseName={course.name}
          courseSection={course.section}
          materials={materials}
          coursework={coursework}
          announcements={announcements}
        />
      ),
    },
    {
      id: 'classroom-stream',
      label: 'Classroom Stream',
      badge: totalClassroomItems,
      icon: <BookOpen className="h-3.5 w-3.5" />,
      content: (
        <div className="space-y-3">
          {totalClassroomItems === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 text-center space-y-2">
              <BookOpen className="mx-auto h-6 w-6 text-zinc-500" />
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-200">
                0 Classroom Stream Posts Yet
              </h3>
              <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                Your instructor has not uploaded lecture notes, assignments, or notices to this Google Classroom stream yet. You can use the practice sets and AI study tutor above.
              </p>
              {course.alternateLink && (
                <div className="pt-2">
                  <a
                    href={course.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    <span>Open in Google Classroom</span>
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <>
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-medium text-zinc-500">Lecture Material</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">{mat.title}</h4>
                    </div>
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

              {coursework.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-medium text-zinc-500">Assignment</span>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">{item.title}</h4>
                    </div>
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

              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-1"
                >
                  <span className="text-[10px] font-medium text-zinc-500">Notice</span>
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
            </>
          )}
        </div>
      ),
    },
    ...(materials.length > 0
      ? [
          {
            id: 'materials',
            label: 'Notes & Slides',
            badge: materials.length,
            icon: <FileText className="h-3.5 w-3.5" />,
            content: (
              <div className="space-y-3">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3 transition-all hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-white">{mat.title}</h4>
                        {mat.description && (
                          <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                            {mat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() =>
                            setActiveNotebookDoc({
                              documentId: mat.id,
                              documentTitle: mat.title,
                              courseId: course.id,
                              courseName: course.name,
                              courseCode: course.section || course.name.split(' ')[0] || 'COURSE',
                              attachmentLink: mat.alternateLink,
                              content: mat.description,
                            })
                          }
                          className="h-7 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-1 px-2.5 shadow-sm shadow-indigo-500/20"
                        >
                          <Sparkles className="h-3 w-3 text-indigo-200" />
                          <span>Go to NotebookLM</span>
                        </Button>

                        {mat.alternateLink && (
                          <a
                            href={mat.alternateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-white p-1 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {mat.materials && mat.materials.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                        {mat.materials.map((item, idx) => (
                          <AttachmentBadge
                            key={idx}
                            item={item}
                            onOpenNotebook={(title, link) =>
                              setActiveNotebookDoc({
                                documentId: `${mat.id}-${idx}`,
                                documentTitle: title,
                                courseId: course.id,
                                courseName: course.name,
                                courseCode: course.section || course.name.split(' ')[0] || 'COURSE',
                                attachmentLink: link || mat.alternateLink,
                                content: mat.description,
                              })
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
    ...(coursework.length > 0
      ? [
          {
            id: 'assignments',
            label: 'Assignments',
            badge: coursework.length,
            icon: <ClipboardList className="h-3.5 w-3.5" />,
            content: (
              <div className="space-y-2.5">
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
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 max-w-4xl"
    >
      {/* Back Button & Classroom Link Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Courses</span>
        </Link>

        {course.alternateLink && (
          <a
            href={course.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
          >
            <span>Open in Classroom</span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>
        )}
      </div>

      {/* Course Title Header */}
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

      {/* Swipeable Tabs (Click + Swipe Gestures) */}
      <SwipeableTabs
        tabs={courseTabs}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Fullscreen Document NotebookLM Modal */}
      <AnimatePresence>
        {activeNotebookDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <DocumentNotebookView
              data={activeNotebookDoc}
              onClose={() => setActiveNotebookDoc(null)}
              isModal={true}
            />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
