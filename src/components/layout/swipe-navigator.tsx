"use client"

import { useRef, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"

const TAB_ORDER = ["/dashboard", "/courses", "/calendar", "/study"]

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const swiping = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    swiping.current = false
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (swiping.current) return

      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      // Only trigger if horizontal swipe is dominant and long enough
      if (Math.abs(deltaX) < 70 || Math.abs(deltaY) > Math.abs(deltaX) * 0.6) return

      swiping.current = true

      // Find current tab index
      const currentIndex = TAB_ORDER.findIndex(
        (tab) => pathname === tab || (tab !== "/dashboard" && pathname.startsWith(tab))
      )
      if (currentIndex === -1) return

      if (deltaX < 0 && currentIndex < TAB_ORDER.length - 1) {
        // Swipe left → next tab
        router.push(TAB_ORDER[currentIndex + 1])
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe right → previous tab
        router.push(TAB_ORDER[currentIndex - 1])
      }
    },
    [pathname, router]
  )

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="md:hidden contents"
    >
      {children}
    </div>
  )
}
