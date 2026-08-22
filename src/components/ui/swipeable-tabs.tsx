"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SwipeableTabItem {
  id: string
  label: string
  badge?: string | number
  icon?: React.ReactNode
  content: React.ReactNode
}

interface SwipeableTabsProps {
  tabs: SwipeableTabItem[]
  defaultTabId?: string
  activeTabId?: string
  onTabChange?: (tabId: string) => void
  className?: string
  tabListClassName?: string
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

export function SwipeableTabs({
  tabs,
  defaultTabId,
  activeTabId,
  onTabChange,
  className = "",
  tabListClassName = "",
}: SwipeableTabsProps) {
  const [internalActiveId, setInternalActiveId] = useState(defaultTabId || tabs[0]?.id || "")
  const [direction, setDirection] = useState(0)

  const currentId = activeTabId !== undefined ? activeTabId : internalActiveId
  const currentIndex = Math.max(0, tabs.findIndex((t) => t.id === currentId))

  const handleSelectTab = (newId: string) => {
    const newIdx = tabs.findIndex((t) => t.id === newId)
    if (newIdx === -1 || newIdx === currentIndex) return

    setDirection(newIdx > currentIndex ? 1 : -1)
    if (activeTabId === undefined) {
      setInternalActiveId(newId)
    }
    onTabChange?.(newId)
  }

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x)

    // Swiped left -> next tab
    if ((offset.x < -60 || swipe < -swipeConfidenceThreshold) && currentIndex < tabs.length - 1) {
      handleSelectTab(tabs[currentIndex + 1].id)
    }
    // Swiped right -> previous tab
    else if ((offset.x > 60 || swipe > swipeConfidenceThreshold) && currentIndex > 0) {
      handleSelectTab(tabs[currentIndex - 1].id)
    }
  }

  const currentTab = tabs[currentIndex] || tabs[0]

  return (
    <div className={cn("w-full flex flex-col space-y-4", className)}>
      {/* Tab Header Bar */}
      <div
        className={cn(
          "flex items-center gap-1 overflow-x-auto scrollbar-none rounded-xl border border-zinc-800 bg-zinc-950 p-1 text-xs",
          tabListClassName
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentId
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-medium transition-colors outline-none shrink-0",
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 rounded-lg bg-zinc-800 border border-zinc-700/60 shadow-sm"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                      isActive ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Swipeable Tab Content Area with Touch & Drag Gesture */}
      <div className="relative w-full overflow-hidden min-h-[200px] touch-pan-y">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 350, damping: 30 },
              opacity: { duration: 0.15 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing select-none"
          >
            {currentTab?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Mobile Swipe Hint Indicator */}
      <div className="flex items-center justify-center gap-1.5 py-1 sm:hidden">
        {tabs.map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              idx === currentIndex ? "w-4 bg-indigo-500" : "w-1.5 bg-zinc-800"
            )}
          />
        ))}
      </div>
    </div>
  )
}
