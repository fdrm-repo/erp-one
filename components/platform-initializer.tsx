'use client'

/**
 * Platform Initializer
 * Boots all platform systems and loads core modules
 * Runs once on app startup
 */

import React, { useEffect, useState } from 'react'
import {
  authService,
  metadataEngine,
  navigationEngine,
  themeEngine,
} from '@/core'
import { bootstrapPlatformRuntime } from '@/core/bootstrap-package'

interface PlatformInitializerProps {
  children: React.ReactNode
  onReady?: () => void
}

export default function PlatformInitializer({
  children,
  onReady,
}: PlatformInitializerProps) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializePlatform = async () => {
      try {
        console.log('[Platform] Initializing ERP ONE Platform...')

        console.log('[Platform] Loading theme engine...')
        themeEngine.setActiveTheme('default')

        console.log('[Platform] Initializing authentication...')
        await authService.login('user-demo', 'admin', 'tenant-1')

        console.log('[Platform] Bootstrapping platform modules...')
        const bootstrapResult = await bootstrapPlatformRuntime()
        console.log('[Platform] Bootstrap complete:', bootstrapResult)

        console.log('[Platform] Building navigation...')
        navigationEngine.buildNavigation()

        const stats = metadataEngine.getStats()
        console.log('[Platform] Initialization complete:', stats)

        setIsReady(true)
        onReady?.()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown initialization error'
        console.error('[Platform] Initialization error:', errorMessage)
        setError(errorMessage)
      }
    }

    void initializePlatform()
  }, [onReady])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Platform Error
          </h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-lg font-semibold text-foreground mb-1">
            Loading Platform
          </h1>
          <p className="text-sm text-muted-foreground">Initializing ERP ONE...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
