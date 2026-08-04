'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface StudioPaletteProps {
  selectedKind: string
  onSelectKind: (kind: string) => void
}

const paletteGroups = [
  {
    title: 'Layout',
    items: ['Grid', 'Tabs', 'Card', 'Section'],
  },
  {
    title: 'Field',
    items: ['Text', 'Money', 'Lookup', 'Date'],
  },
  {
    title: 'Widget',
    items: ['Table', 'Chart', 'Timeline', 'Kanban', 'Calendar'],
  },
]

export function StudioPalette({ selectedKind, onSelectKind }: StudioPaletteProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card/80">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Palette</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Component Library</h2>
        <p className="text-sm text-muted-foreground">Drag the building blocks into the canvas.</p>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-4">
        {paletteGroups.map((group) => (
          <Card key={group.title} className="bg-background/70">
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <Button
                    key={item}
                    variant={selectedKind === item.toLowerCase() ? 'default' : 'outline'}
                    onClick={() => onSelectKind(item.toLowerCase())}
                    className="justify-start"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-background/70">
          <CardHeader>
            <CardTitle>Quick Insert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Select a block type and add it directly to the current page canvas.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Drag</Badge>
              <Badge variant="secondary">Drop</Badge>
              <Badge variant="secondary">Design</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
