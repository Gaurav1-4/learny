"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ExternalLink, Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";

interface DashboardAnnouncement {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  text: string;
  creationTime?: string;
  alternateLink?: string;
}

export default function NotificationsPage() {
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const [coursesRes, announcementsRes] = await Promise.all([
          fetch("/api/classroom/courses"),
          fetch("/api/classroom/announcements"),
        ]);

        if (coursesRes.ok && announcementsRes.ok) {
          const coursesData = await coursesRes.json();
          const annData = await announcementsRes.json();

          const activeCourseIds = new Set(
            (coursesData.courses || []).filter((c: any) => c.courseState === "ACTIVE").map((c: any) => c.id)
          );

          let activeAnnouncements = (annData.announcements || []).filter((a: any) =>
            activeCourseIds.has(a.courseId)
          );

          // Add courseCode to announcements
          activeAnnouncements = activeAnnouncements.map((a: any) => {
            const course = coursesData.courses.find((c: any) => c.id === a.courseId);
            return {
              ...a,
              courseName: course?.name || "Course",
              courseCode: course?.section || course?.name?.split(" ")[0] || "COURSE",
            };
          });

          // Sort by newest first
          activeAnnouncements.sort((a: any, b: any) => {
            return new Date(b.creationTime || 0).getTime() - new Date(a.creationTime || 0).getTime();
          });

          setAnnouncements(activeAnnouncements);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const filteredAnnouncements = announcements.filter((ann) =>
    ann.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-purple-400" />
            Notifications Inbox
          </h1>
          <p className="text-sm text-zinc-400">
            Recent announcements and notices from all your active Google Classroom courses.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search announcements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border-zinc-800 pl-9 text-white placeholder:text-zinc-500 rounded-xl focus-visible:ring-purple-500/50"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-sm font-medium">Syncing inbox from Google Classroom...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
          <Bell className="h-10 w-10 text-zinc-600 mx-auto" />
          <h4 className="text-base font-semibold text-white">No announcements found</h4>
          <p className="text-sm text-zinc-500">
            {searchQuery ? "Try adjusting your search terms." : "You're all caught up with your classes!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-xl border border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700 p-4 sm:p-5 space-y-2 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 bg-zinc-950 text-purple-300 px-2 py-0.5">
                  {ann.courseCode}
                </Badge>
                {ann.creationTime && (
                  <span className="text-xs text-zinc-500 font-medium">
                    {formatDistanceToNow(new Date(ann.creationTime), { addSuffix: true })}
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                {ann.text}
              </p>

              {ann.alternateLink && (
                <div className="pt-2 flex justify-end border-t border-zinc-800/60 mt-3">
                  <a
                    href={ann.alternateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 font-medium bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>View in Classroom</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
