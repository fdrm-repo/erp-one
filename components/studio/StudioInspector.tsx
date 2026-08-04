'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { StudioComponent, StudioPage } from './types'

interface StudioInspectorProps {
  selectedComponent?: StudioComponent | null
  selectedPage?: StudioPage
  entities: Array<{ id: string; label: string }>
  newFieldName: string
  newFieldType: string
  onFieldNameChange: (value: string) => void
  onFieldTypeChange: (value: string) => void
  onAddField: () => void
  onUpdateSelectedComponent: (changes: Partial<StudioComponent>) => void
  onUpdateSelectedPage: (changes: Partial<StudioPage>) => void
}

export function StudioInspector({
  selectedComponent,
  selectedPage,
  entities,
  newFieldName,
  newFieldType,
  onFieldNameChange,
  onFieldTypeChange,
  onAddField,
  onUpdateSelectedComponent,
  onUpdateSelectedPage,
}: StudioInspectorProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card/80">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Inspector</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Properties</h2>
        <p className="text-sm text-muted-foreground">Configure selected components and page bindings.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Card className="bg-background/70">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Property Inspector</CardTitle>
              <CardDescription>Manage the selected component without leaving the canvas.</CardDescription>
            </div>
            <Badge variant="secondary">Figma-style</Badge>
          </CardHeader>
          <CardContent>
            {selectedComponent ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Title</label>
                  <Input
                    value={selectedComponent.title}
                    onChange={(event) => onUpdateSelectedComponent({ title: event.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Entity</label>
                  <Select
                    value={selectedComponent.entityId || ''}
                    onChange={(event) => onUpdateSelectedComponent({ entityId: event.target.value })}
                  >
                    {entities.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {entity.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Size</label>
                  <Select
                    value={selectedComponent.size}
                    onChange={(event) =>
                      onUpdateSelectedComponent({ size: event.target.value as StudioComponent['size'] })
                    }
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Description</label>
                  <Textarea
                    value={(selectedComponent.properties.description as string) || ''}
                    onChange={(event) =>
                      onUpdateSelectedComponent({
                        properties: {
                          ...selectedComponent.properties,
                          description: event.target.value,
                        },
                      })
                    }
                    className="min-h-[140px]"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                Select a component on the canvas to inspect its properties.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background/70">
          <CardHeader>
            <div>
              <CardTitle>Page Data Model</CardTitle>
              <CardDescription>Bind the page to an entity and extend its schema.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Page Name</label>
              <Input
                value={selectedPage?.name || ''}
                onChange={(event) => onUpdateSelectedPage({ name: event.target.value, title: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Entity Binding</label>
              <Select
                value={selectedPage?.entityId || ''}
                onChange={(event) => onUpdateSelectedPage({ entityId: event.target.value })}
              >
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Add Field</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={newFieldName}
                  onChange={(event) => onFieldNameChange(event.target.value)}
                  placeholder="New field"
                  className="flex-1 min-w-[140px]"
                />
                <Select
                  value={newFieldType}
                  onChange={(event) => onFieldTypeChange(event.target.value)}
                  className="w-full sm:w-[140px]"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                  <option value="select">Select</option>
                </Select>
                <Button onClick={onAddField}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
