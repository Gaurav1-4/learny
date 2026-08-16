"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { CloudSyncHydrator } from "@/components/sync/cloud-sync-hydrator"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CloudSyncHydrator />
      {children}
    </SessionProvider>
  )
}
