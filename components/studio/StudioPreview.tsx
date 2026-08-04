'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudioPage } from './types'

interface StudioPreviewProps {
  selectedPage?: StudioPage
}

export function StudioPreview({ selectedPage }: StudioPreviewProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card/80">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Preview</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Live Preview</h2>
      </div>

      <Card className="m-4 flex-1 bg-background/70">
        <CardHeader>
          <CardTitle>{selectedPage?.title || 'No workspace selected'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-medium text-foreground">ERP ONE</p>
            <p className="mt-1 text-xs">Live workspace preview for the selected page.</p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-semibold text-foreground">Customers</p>
              <p className="text-xs text-muted-foreground">Search, new record, and live list view.</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="font-semibold text-foreground">Table</p>
              <p className="text-xs text-muted-foreground">Interactive grid with actions and filters.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
