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
  Settings,
  Brain,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AppSwitcher } from "@/components/layout/app-switcher"

interface SidebarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const mainRoutes = [
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
      label: "Schedule",
      icon: Calendar,
      href: "/calendar",
    },
  ]

  const toolRoutes = [
    {
      label: "Study Decks (SM-2)",
      icon: Sparkles,
      href: "/study",
    },
    {
      label: "Subject Evals & CGPA",
      icon: Calculator,
      href: "/gpa",
    },
    {
      label: "NotebookLM Hub",
      icon: Brain,
      href: "/notebooklm",
    },
    {
      label: "Focus Timer",
      icon: Timer,
      href: "/timer",
    },
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-30 hidden md:flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-300">
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">
              Learny
            </span>
            <span className="text-[10px] text-zinc-500 font-medium">
              IIIT Delhi
            </span>
          </div>
        </Link>
        <AppSwitcher />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-none">
        {/* Main Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Academic
          </div>
          {mainRoutes.map((route) => {
            const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href))
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <route.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
                <span>{route.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Tools Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Study Tools
          </div>
          {toolRoutes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(route.href)
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <route.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
                <span>{route.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer: User Profile & Settings */}
      <div className="border-t border-zinc-800 p-3 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-zinc-900",
            pathname === "/settings" ? "bg-zinc-800/80 text-white" : "text-zinc-300"
          )}
        >
          <Avatar className="h-7 w-7 border border-zinc-700">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="bg-zinc-800 text-[11px] font-bold text-zinc-200">
              {user?.name ? user.name[0].toUpperCase() : "G"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <div className="truncate text-xs font-semibold text-white">
              {user?.name || "Gaurav"}
            </div>
            <div className="truncate text-[10px] text-zinc-500">
              Settings &amp; Account
            </div>
          </div>
          <Settings className="h-3.5 w-3.5 text-zinc-500" />
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full justify-start gap-2 h-7 px-2 text-[11px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-3 w-3" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  )
}
