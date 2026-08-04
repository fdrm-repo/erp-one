'use client'

import { Badge } from '@/components/ui/badge'
import type { StudioLog } from './types'

interface StudioStatusBarProps {
  pageCount: number
  componentCount: number
  selectedPageTitle: string
  selectedComponentTitle?: string
  consoleOpen: boolean
  logs: StudioLog[]
}

export function StudioStatusBar({
  pageCount,
  componentCount,
  selectedPageTitle,
  selectedComponentTitle,
  consoleOpen,
  logs,
}: StudioStatusBarProps) {
  return (
    <div className="border-t border-border bg-card/90 px-4 py-3 text-sm text-muted-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Pages: {pageCount}</Badge>
          <Badge variant="secondary">Components: {componentCount}</Badge>
          <span>
            Page: <span className="font-medium text-foreground">{selectedPageTitle || 'None'}</span>
          </span>
          <span>
            Selected: <span className="font-medium text-foreground">{selectedComponentTitle || 'None'}</span>
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          <span>{consoleOpen ? 'Console open' : 'Console hidden'}</span>
          <span className="mx-2">•</span>
          <span>{logs.length} recent events</span>
        </div>
      </div>
    </div>
  )
}
