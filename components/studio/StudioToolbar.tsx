'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StudioToolbarProps {
  onRun: () => void
  onValidate: () => void
  onAi: () => void
  onRefresh: () => void
}

export function StudioToolbar({ onRun, onValidate, onAi, onRefresh }: StudioToolbarProps) {
  return (
    <header className="border-b border-border bg-card px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Enterprise Visual Composer
          </p>
          <h1 className="text-xl font-semibold text-foreground">ONE Studio</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onRun}>
            Run
          </Button>
          <Button variant="outline" onClick={onValidate}>
            Validate
          </Button>
          <Button onClick={onAi}>AI</Button>
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Live workspace
          </Badge>
        </div>
      </div>
    </header>
  )
}
