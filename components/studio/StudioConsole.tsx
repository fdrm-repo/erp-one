'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { StudioLog } from './types'

interface StudioConsoleProps {
  logs: StudioLog[]
}

export function StudioConsole({ logs }: StudioConsoleProps) {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden rounded-lg border border-border bg-card/80">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Console</p>
            <h2 className="text-lg font-semibold text-foreground">Runtime Log</h2>
          </div>
        </div>
      </div>
      <CardContent className="h-full overflow-y-auto p-4 font-mono text-xs text-muted-foreground">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No runtime events yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((entry) => (
              <div key={entry.id}>{entry.message}</div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  )
}
