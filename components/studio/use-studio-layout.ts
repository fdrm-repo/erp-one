'use client'

import { useEffect, useState } from 'react'
import type { StudioLayoutState } from './types'

const STORAGE_KEY = 'erp-one.studio.layout'
const DEFAULT_LAYOUT: StudioLayoutState = {
  horizontalLayout: {
    explorer: 22,
    canvas: 56,
    inspector: 22,
  },
  consoleOpen: true,
}

export function useStudioLayout() {
  const [layout, setLayout] = useState<StudioLayoutState>(DEFAULT_LAYOUT)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY)
      if (!storedValue) {
        return
      }

      const parsed = JSON.parse(storedValue) as Partial<StudioLayoutState>
      setLayout({
        ...DEFAULT_LAYOUT,
        ...parsed,
        horizontalLayout: {
          ...DEFAULT_LAYOUT.horizontalLayout,
          ...(parsed.horizontalLayout ?? {}),
        },
      })
    } catch {
      setLayout(DEFAULT_LAYOUT)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  const updateLayout = (changes: Partial<StudioLayoutState>) => {
    setLayout((current) => ({
      ...current,
      ...changes,
      horizontalLayout: {
        ...current.horizontalLayout,
        ...(changes.horizontalLayout ?? {}),
      },
    }))
  }

  return {
    layout,
    updateLayout,
  }
}
