"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Archive,
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
    <div className="fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Learny</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Academic Workspace
        </div>
        <nav className="grid gap-1 px-3">
          {routes.map((route) => {
            const isActive =
              pathname === route.href ||
              (route.href !== "/dashboard" && pathname.startsWith(route.href))
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                  isActive
                    ? "bg-zinc-800/90 text-white shadow-sm font-semibold border border-zinc-700/50"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <route.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-indigo-400" : "text-zinc-400"
                  )}
                />
                {route.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-800/80 p-4 bg-zinc-950/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 border border-zinc-800 shrink-0">
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-indigo-950 text-indigo-200 font-semibold text-xs">
                {user?.name?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-zinc-200">
                {user?.name || "Student"}
              </span>
              <span className="truncate text-[11px] text-zinc-500">
                {user?.email || "student@college.edu"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="shrink-0 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
