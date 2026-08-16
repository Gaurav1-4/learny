"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Brain,
  Settings,
  Menu,
  X,
  GraduationCap,
  Calculator,
  Timer,
  Sparkles,
  Search,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [pathname])

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isDrawerOpen])

  const bottomTabs = [
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
      label: "Calendar",
      icon: Calendar,
      href: "/calendar",
    },
    {
      label: "NotebookLM",
      icon: Brain,
      href: "/notebooklm",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  const allDrawerLinks = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-indigo-400",
    },
    {
      label: "Courses & Archive",
      icon: BookOpen,
      href: "/courses",
      color: "text-blue-400",
    },
    {
      label: "NotebookLM Hub",
      icon: Brain,
      href: "/notebooklm",
      color: "text-purple-400",
    },
    {
      label: "Subject Evals & CGPA",
      icon: Calculator,
      href: "/gpa",
      color: "text-emerald-400",
    },
    {
      label: "Academic Calendar",
      icon: Calendar,
      href: "/calendar",
      color: "text-amber-400",
    },
    {
      label: "Focus Timer",
      icon: Timer,
      href: "/timer",
      color: "text-rose-400",
    },
    {
      label: "Study Decks (SM-2)",
      icon: Sparkles,
      href: "/study",
      color: "text-yellow-400",
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
      color: "text-cyan-400",
    },
    {
      label: "Settings & Backup",
      icon: Settings,
      href: "/settings",
      color: "text-zinc-400",
    },
  ]

  return (
    <>
      {/* 1. TOP MOBILE APP HEADER */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-white/5 bg-zinc-950/80 px-4 backdrop-blur-xl md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
            Learny
            <span className="rounded-md bg-indigo-500/20 px-1 py-0.2 text-[9px] font-bold text-indigo-400 border border-indigo-500/30">
              PRO
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. SLIDE-OUT MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Slide Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute right-0 top-0 bottom-0 flex h-full w-[82%] max-w-sm flex-col bg-zinc-950 border-l border-zinc-800 shadow-2xl p-5"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Learny Pro</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">IIIT Delhi Workspace</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4 space-y-1.5">
                <div className="px-2 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                  All Academic Modules
                </div>

                {allDrawerLinks.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all",
                        isActive
                          ? "bg-indigo-950/60 border border-indigo-500/30 text-white shadow-sm"
                          : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("h-4 w-4", item.color)} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                    </Link>
                  )
                })}
              </div>

              {/* User Footer in Drawer */}
              <div className="border-t border-zinc-800/80 pt-4 mt-auto">
                <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Avatar className="h-8 w-8 border border-indigo-500/30 shrink-0">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">
                        {user?.name?.[0]?.toUpperCase() || "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-bold text-zinc-200">
                        {user?.name || "Gaurav"}
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
                    className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. NATIVE BOTTOM NAVIGATION TAB BAR (iPhone / Android) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-white/5 bg-zinc-950/90 px-2 backdrop-blur-2xl md:hidden pb-safe">
        {bottomTabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center py-1 transition-all",
                isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[10px] font-bold mt-1 tracking-tight truncate max-w-[60px]">
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute -top-1 h-1 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
