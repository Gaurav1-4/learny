"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
  Timer,
  Sparkles,
  Calculator,
  Search,
  Settings,
  Brain,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Courses & Archive",
      icon: BookOpen,
      href: "/courses",
    },
    {
      label: "NotebookLM Hub",
      icon: Brain,
      href: "/notebooklm",
    },
    {
      label: "Subject Evals & CGPA",
      icon: Calculator,
      href: "/gpa",
    },
    {
      label: "Academic Calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      label: "Focus Timer",
      icon: Timer,
      href: "/timer",
    },
    {
      label: "Study Decks (SM-2)",
      icon: Sparkles,
      href: "/study",
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
    },
    {
      label: "Settings & Backup",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r border-white/5 bg-zinc-950/95 text-zinc-100 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="flex h-20 items-center border-b border-white/5 px-6">
        <Link href="/dashboard" className="group flex items-center gap-3 font-bold tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Learny
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
              Classroom Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="px-3 mb-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
          Academic Tools
        </div>
        <nav className="space-y-1.5">
          {routes.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/dashboard" && pathname.startsWith(route.href))

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/40 border border-indigo-500/30 shadow-inner -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <route.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    isActive ? "text-indigo-400 scale-110" : "text-zinc-400"
                  )}
                />
                <span className="truncate">{route.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-white/5 p-4 bg-zinc-950/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 border border-indigo-500/30 shrink-0 ring-2 ring-indigo-500/10">
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-700 to-purple-700 text-white font-bold text-xs">
                {user?.name?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-bold text-zinc-200">
                {user?.name || "Student"}
              </span>
              <span className="truncate text-[10px] text-zinc-500">
                {user?.email || "student@college.edu"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="shrink-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-900/80 h-8 w-8 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
