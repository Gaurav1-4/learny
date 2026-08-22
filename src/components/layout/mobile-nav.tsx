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
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AppSwitcher } from "@/components/layout/app-switcher"

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
      label: "Schedule",
      icon: Calendar,
      href: "/calendar",
    },
    {
      label: "Study & Tools",
      icon: Brain,
      href: "/study",
    },
  ]

  const allDrawerLinks = [
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
    <>
      {/* 1. TOP MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-950">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            Learny
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <AppSwitcher />
          <Link
            href="/search"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white"
          >
            <Search className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute right-0 top-0 bottom-0 flex h-full w-[80%] max-w-sm flex-col bg-zinc-950 border-l border-zinc-800 p-5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-100 text-zinc-950">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Learny</span>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-md p-1 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto py-4 space-y-1">
                <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Modules
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
                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-zinc-900 text-white font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4 text-zinc-400" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                    </Link>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-zinc-800 pt-3 mt-auto">
                <div className="flex items-center justify-between bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-7 w-7 border border-zinc-800 shrink-0">
                      <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                      <AvatarFallback className="bg-zinc-800 text-zinc-200 text-xs">
                        {user?.name?.[0]?.toUpperCase() || "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-medium text-zinc-200">
                        {user?.name || "Student"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="h-7 w-7 text-zinc-500 hover:text-white"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. BOTTOM TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 w-full items-center justify-around border-t border-zinc-800 bg-zinc-950/95 px-2 backdrop-blur-md md:hidden pb-safe">
        {bottomTabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/dashboard" && pathname.startsWith(tab.href))

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-1 transition-colors",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon className="h-4.5 w-4.5" />
              <span className="text-[10px] font-medium mt-0.5 tracking-tight truncate">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
