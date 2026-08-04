'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { StudioComponent, StudioPage } from './types'

interface StudioCanvasProps {
  pages: StudioPage[]
  selectedPage?: StudioPage
  selectedComponent?: StudioComponent | null
  selectedPageId: string
  selectedComponentId: string | null
  previewMode: 'desktop' | 'tablet' | 'mobile'
  newComponentKind: string
  setNewComponentKind: (kind: string) => void
  onSelectPage: (pageId: string) => void
  onAddComponent: () => void
  onSelectComponent: (componentId: string) => void
  onRemoveComponent: (componentId: string) => void
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void
}

const componentKinds = ['card', 'table', 'chart', 'timeline', 'form', 'tabs', 'kanban', 'calendar', 'map']

export function StudioCanvas({
  pages,
  selectedPage,
  selectedComponent,
  selectedPageId,
  selectedComponentId,
  previewMode,
  newComponentKind,
  setNewComponentKind,
  onSelectPage,
  onAddComponent,
  onSelectComponent,
  onRemoveComponent,
  onPreviewModeChange,
}: StudioCanvasProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr] min-h-0">
        <Card className="min-h-0 bg-background/70">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Figma-style Canvas</CardTitle>
              <CardDescription>Compose pages with reusable, bound components.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Design mode</Badge>
              <Button variant={previewMode === 'desktop' ? 'default' : 'outline'} size="sm" onClick={() => onPreviewModeChange('desktop')}>
                Desktop
              </Button>
              <Button variant={previewMode === 'tablet' ? 'default' : 'outline'} size="sm" onClick={() => onPreviewModeChange('tablet')}>
                Tablet
              </Button>
              <Button variant={previewMode === 'mobile' ? 'default' : 'outline'} size="sm" onClick={() => onPreviewModeChange('mobile')}>
                Mobile
              </Button>
            </div>
          </CardHeader>

          <div className="border-b border-border bg-background/70 px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant={selectedPageId === page.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSelectPage(page.id)}
                  className="rounded-full px-3"
                >
                  {page.name}
                </Button>
              ))}
            </div>
          </div>

          <CardContent className="min-h-[420px] overflow-hidden">
            <div className="flex h-full min-h-0 flex-col">
              <div className="mb-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="mb-3 text-sm text-muted-foreground">Page surface</div>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-background/80 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{selectedPage?.title || 'Select a page'}</p>
                          <p className="text-xs text-muted-foreground">Entity binding: {selectedPage?.entityId || 'unbound'}</p>
                        </div>
                        <Badge variant="outline">{selectedPage?.components.length ?? 0} components</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        This is the active page canvas. Click a component below to inspect or remove it.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(selectedPage?.components ?? []).map((component) => (
                        <div
                          key={component.id}
                          className={`group rounded-xl border p-4 transition ${selectedComponentId === component.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/70'}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-foreground">{component.title}</p>
                              <p className="text-xs text-muted-foreground">{component.kind}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant={selectedComponentId === component.id ? 'default' : 'outline'} size="sm" onClick={() => onSelectComponent(component.id)}>
                                Select
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => onRemoveComponent(component.id)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground">
                            Bound to {component.entityId || 'none'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 text-sm font-semibold text-foreground">Component Palette</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {componentKinds.map((kind) => (
                        <Button
                          key={kind}
                          variant={newComponentKind === kind ? 'default' : 'outline'}
                          onClick={() => setNewComponentKind(kind)}
                          className="justify-start"
                        >
                          {kind}
                        </Button>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Pick a block and add it to the page canvas. Components are bound to the selected page entity.
                    </p>
                    <Button className="mt-4 w-full" onClick={onAddComponent}>
                      Add {newComponentKind}
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 text-sm font-semibold text-foreground">Selected Component</div>
                    {selectedComponent ? (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{selectedComponent.title}</p>
                        <p>{selectedComponent.kind} • {selectedComponent.size}</p>
                        <p>Entity: {selectedComponent.entityId || 'none'}</p>
                        <p className="text-xs text-muted-foreground">Use the inspector to edit the component details.</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Choose a component to focus its properties.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
