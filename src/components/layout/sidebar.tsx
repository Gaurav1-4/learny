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
      label: "Courses",
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
      label: "Calendar & Timetable",
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
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-30 hidden md:flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">
              Learny
            </span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
              IIIT Delhi
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Navigation
        </div>
        <nav className="space-y-0.5">
          {routes.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/dashboard" && pathname.startsWith(route.href))

            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                )}
              >
                <route.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-zinc-400"
                  )}
                />
                <span className="truncate">{route.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-zinc-800 p-3.5 bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar className="h-7 w-7 border border-zinc-800 shrink-0">
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-zinc-800 text-zinc-200 font-semibold text-xs">
                {user?.name?.[0]?.toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-zinc-200">
                {user?.name || "Student"}
              </span>
              <span className="truncate text-[10px] text-zinc-500">
                {user?.email || "student@iiitd.ac.in"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="shrink-0 text-zinc-500 hover:text-white hover:bg-zinc-900 h-7 w-7 rounded-md"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
