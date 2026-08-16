import { Session } from "next-auth";

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  ownerId?: string;
  courseState?: string;
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  enrollmentCode?: string;
}

export interface ClassroomMaterialItem {
  driveFile?: {
    driveFile?: {
      id?: string;
      title?: string;
      alternateLink?: string;
      thumbnailUrl?: string;
    };
    shareMode?: string;
  };
  youtubeVideo?: {
    id?: string;
    title?: string;
    alternateLink?: string;
    thumbnailUrl?: string;
  };
  link?: {
    url?: string;
    title?: string;
    thumbnailUrl?: string;
  };
  form?: {
    formUrl?: string;
    title?: string;
    thumbnailUrl?: string;
  };
}

export interface ClassroomCourseWorkMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  materials?: ClassroomMaterialItem[];
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  maxPoints?: number;
  dueDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
  };
  workType?: string;
  materials?: ClassroomMaterialItem[];
}

export interface ClassroomStudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  state?: string;
  assignedGrade?: number;
  alternateLink?: string;
  late?: boolean;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  materials?: ClassroomMaterialItem[];
}

export interface ClassroomTeacher {
  courseId: string;
  name: string;
  emailAddress?: string;
  photoUrl?: string;
}

export interface GpaCourse {
  id: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

export interface UserSession extends Session {
  accessToken?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  status: 'new' | 'review' | 'mastered';
  repetitions?: number;
  easeFactor?: number;
  interval?: number;
  nextReviewDate?: string;
  lastReviewed?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyDeck {
  id: string;
  title: string;
  courseId?: string;
  courseName?: string;
  description?: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  createdAt: string;
}
