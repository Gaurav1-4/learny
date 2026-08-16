import { google, classroom_v1 } from "googleapis";
import {
  ClassroomCourse,
  ClassroomCourseWork,
  ClassroomCourseWorkMaterial,
  ClassroomStudentSubmission,
  ClassroomAnnouncement,
  ClassroomTeacher,
} from "@/types";

export class GoogleClassroomClient {
  private classroom: classroom_v1.Classroom;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error("No Google OAuth access token provided. Please sign in again.");
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    this.classroom = google.classroom({ version: "v1", auth: oauth2Client });
  }

  async getCourses(states: string[] = ["ACTIVE"]): Promise<ClassroomCourse[]> {
    try {
      const response = await this.classroom.courses.list({
        courseStates: states,
      });
      return (response.data.courses as unknown as ClassroomCourse[]) || [];
    } catch (error: any) {
      console.warn("Retrying getCourses with studentId: me", error?.message);
      try {
        const fallbackRes = await this.classroom.courses.list({
          studentId: "me",
          courseStates: states,
        });
        return (fallbackRes.data.courses as unknown as ClassroomCourse[]) || [];
      } catch (retryError) {
        console.error("Error fetching courses from Google Classroom API:", retryError);
        throw retryError;
      }
    }
  }

  async getArchivedCourses(): Promise<ClassroomCourse[]> {
    return this.getCourses(["ARCHIVED"]);
  }

  async getAllCourses(): Promise<ClassroomCourse[]> {
    return this.getCourses(["ACTIVE", "ARCHIVED"]);
  }

  async getCourse(courseId: string): Promise<ClassroomCourse | null> {
    try {
      const response = await this.classroom.courses.get({
        id: courseId,
      });
      return (response.data as unknown as ClassroomCourse) || null;
    } catch (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      return null;
    }
  }

  async getAllCoursework(states: string[] = ["ACTIVE"]): Promise<ClassroomCourseWork[]> {
    try {
      const courses = await this.getCourses(states);
      const allCoursework: ClassroomCourseWork[] = [];
      await Promise.all(
        courses.map(async (course) => {
          try {
            const coursework = await this.getCoursework(course.id);
            allCoursework.push(...coursework);
          } catch (e) {
            console.warn(`Failed to fetch coursework for course ${course.id}:`, e);
          }
        })
      );
      return allCoursework;
    } catch (error) {
      console.error("Error fetching all coursework:", error);
      return [];
    }
  }

  async getCoursework(courseId: string): Promise<ClassroomCourseWork[]> {
    try {
      const response = await this.classroom.courses.courseWork.list({
        courseId,
      });
      return (response.data.courseWork as unknown as ClassroomCourseWork[]) || [];
    } catch (error) {
      console.warn(`Error fetching coursework for course ${courseId}:`, error);
      return [];
    }
  }

  async getCourseWorkMaterials(courseId: string): Promise<ClassroomCourseWorkMaterial[]> {
    try {
      const response = await this.classroom.courses.courseWorkMaterials.list({
        courseId,
      });
      return (response.data.courseWorkMaterial as unknown as ClassroomCourseWorkMaterial[]) || [];
    } catch (error) {
      console.warn(`Error fetching coursework materials for course ${courseId}:`, error);
      return [];
    }
  }

  async getStudentSubmissions(
    courseId: string,
    courseWorkId: string = "-"
  ): Promise<ClassroomStudentSubmission[]> {
    try {
      const response = await this.classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        userId: "me",
      });
      return (response.data.studentSubmissions as unknown as ClassroomStudentSubmission[]) || [];
    } catch (error) {
      console.warn(`Error fetching student submissions for ${courseId}:`, error);
      return [];
    }
  }

  async getAnnouncements(courseId: string): Promise<ClassroomAnnouncement[]> {
    try {
      const response = await this.classroom.courses.announcements.list({
        courseId,
      });
      return (response.data.announcements as unknown as ClassroomAnnouncement[]) || [];
    } catch (error) {
      console.warn(`Error fetching announcements for ${courseId}:`, error);
      return [];
    }
  }

  async getTeachers(courseId: string): Promise<ClassroomTeacher[]> {
    try {
      const response = await this.classroom.courses.teachers.list({
        courseId,
      });
      const teachers = response.data.teachers || [];
      return teachers.map((teacher) => ({
        courseId: teacher.courseId || courseId,
        name: teacher.profile?.name?.fullName || "Instructor",
        emailAddress: teacher.profile?.emailAddress || undefined,
        photoUrl: teacher.profile?.photoUrl || undefined,
      }));
    } catch (error) {
      console.warn(`Error fetching teachers for ${courseId}:`, error);
      return [];
    }
  }
}
