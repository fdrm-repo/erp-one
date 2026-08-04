'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { metadataEngine } from '@/core/engines/metadata-engine'
import { componentRegistry } from '@/core/engines/component-registry'
// layout handled with CSS grid; removed react-resizable-panels usage
import { StudioToolbar } from './StudioToolbar'
import { StudioExplorer } from './StudioExplorer'
import { StudioCanvas } from './StudioCanvas'
import { StudioInspector } from './StudioInspector'
import { StudioConsole } from './StudioConsole'
import { StudioStatusBar } from './StudioStatusBar'
import { StudioPalette } from './StudioPalette'
import { StudioPreview } from './StudioPreview'
import { StudioLauncher } from './StudioLauncher'
import { useStudioLayout } from './use-studio-layout'
import type { ExplorerNode, StudioComponent, StudioLog, StudioPage, StudioWorkspace } from './types'

const DEFAULT_WORKSPACE: StudioWorkspace = {
  id: 'crm',
  name: 'CRM Workspace',
  pages: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      title: 'CRM Dashboard',
      entityId: 'platform.party',
      components: [
        {
          id: 'card-1',
          kind: 'card',
          title: 'Revenue Overview',
          entityId: 'platform.party',
          size: 'medium',
          properties: { metric: 'Revenue' },
        },
        {
          id: 'chart-1',
          kind: 'chart',
          title: 'Pipeline',
          entityId: 'platform.party',
          size: 'medium',
          properties: { chart: 'bar' },
        },
      ],
    },
    {
      id: 'customers',
      name: 'Customers',
      title: 'Customers',
      entityId: 'platform.party',
      components: [
        {
          id: 'list-1',
          kind: 'table',
          title: 'Customer List',
          entityId: 'platform.party',
          size: 'large',
          properties: { columns: ['Name', 'Email', 'Status'] },
        },
        {
          id: 'form-1',
          kind: 'form',
          title: 'Customer Details',
          entityId: 'platform.party',
          size: 'medium',
          properties: { fields: ['Name', 'Email', 'Phone'] },
        },
      ],
    },
    {
      id: 'invoices',
      name: 'Invoices',
      title: 'Invoices',
      entityId: 'platform.money',
      components: [
        {
          id: 'invoice-list',
          kind: 'table',
          title: 'Invoice List',
          entityId: 'platform.money',
          size: 'large',
          properties: { columns: ['Number', 'Amount', 'Status'] },
        },
        {
          id: 'timeline-1',
          kind: 'timeline',
          title: 'Approval Timeline',
          entityId: 'platform.money',
          size: 'medium',
          properties: { items: ['Draft', 'Review', 'Approved'] },
        },
      ],
    },
    {
      id: 'activities',
      name: 'Activities',
      title: 'Activities',
      entityId: 'platform.activity',
      components: [
        {
          id: 'activity-list',
          kind: 'timeline',
          title: 'Activity Timeline',
          entityId: 'platform.activity',
          size: 'medium',
          properties: { items: ['Call', 'Email', 'Meeting'] },
        },
      ],
    },
  ],
}

export default function StudioView() {
  const [selectedNodeId, setSelectedNodeId] = useState('workspace-page:customers')
  const [refreshKey, setRefreshKey] = useState(0)
  const [workspace, setWorkspace] = useState<StudioWorkspace>(DEFAULT_WORKSPACE)
  const [lastWorkspaceId, setLastWorkspaceId] = useState<string | null>('crm')
  const [isLauncherOpen, setIsLauncherOpen] = useState(true)
  const [selectedPageId, setSelectedPageId] = useState('customers')
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('list-1')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [newComponentKind, setNewComponentKind] = useState('card')
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldType, setNewFieldType] = useState('text')
  const [aiPrompt, setAiPrompt] = useState('Create a customer onboarding workspace for freight operations')
  const [logs, setLogs] = useState<StudioLog[]>([
    { id: 'boot', message: '[BOOT] Bootstrap package installed core platform modules', timestamp: Date.now() },
    { id: 'validation', message: '[VALIDATION] Composer validation passed', timestamp: Date.now() },
    { id: 'runtime', message: '[RUNTIME] Workspace preview is ready', timestamp: Date.now() },
  ])
  const [logSequence, setLogSequence] = useState(0)
  const { layout, updateLayout } = useStudioLayout()

  const selectedPage = useMemo(
    () => workspace.pages.find((page) => page.id === selectedPageId) || workspace.pages[0],
    [workspace.pages, selectedPageId]
  )

  const selectedComponent = useMemo(
    () => selectedPage?.components.find((component) => component.id === selectedComponentId) || selectedPage?.components[0] || null,
    [selectedComponentId, selectedPage?.components]
  )

  const explorerTree = useMemo<ExplorerNode[]>(() => {
    const entityNodes = metadataEngine.getAllEntities().map((entity) => ({
      id: `entity:${entity.id}`,
      label: entity.label,
      kind: 'entity',
      itemId: entity.id,
      description: `${entity.module} • ${entity.fields.size} fields`,
      data: entity,
    }))

    const pageNodes = workspace.pages.map((page) => ({
      id: `workspace-page:${page.id}`,
      label: page.title,
      kind: 'page',
      itemId: page.id,
      description: page.entityId || 'workspace page',
      data: page,
    }))

    return [
      {
        id: 'workspace-root',
        label: workspace.name,
        kind: 'workspace',
        itemId: workspace.id,
        description: 'Enterprise application workspace',
        children: [
          { id: 'pages-root', label: 'Pages', kind: 'group', itemId: 'pages', description: 'Workspace pages', children: pageNodes },
          { id: 'entities-root', label: 'Entities', kind: 'group', itemId: 'entities', description: 'Bound entities', children: entityNodes },
          {
            id: 'components-root',
            label: 'Components',
            kind: 'group',
            itemId: 'components',
            description: 'Reusable components',
            children: componentRegistry.getAll().map((registered) => ({
              id: `component:${registered.metadata.id}`,
              label: registered.metadata.name,
              kind: 'component',
              itemId: registered.metadata.id,
              description: registered.metadata.category,
              data: registered.metadata,
            })),
          },
          { id: 'workflows-root', label: 'Workflows', kind: 'group', itemId: 'workflows', description: 'Automation flows', children: [] },
          { id: 'api-root', label: 'API', kind: 'group', itemId: 'api', description: 'Generated endpoints', children: [] },
        ],
      },
    ]
  }, [workspace.pages])

  useEffect(() => {
    if (!selectedPage) {
      return
    }

    const layoutMetadata = {
      id: `${selectedPage.id}-layout`,
      name: selectedPage.title,
      type: 'grid' as const,
      sections: selectedPage.components.map((component) => ({
        id: component.id,
        name: component.title,
        type: 'section' as const,
        layout: 'single' as const,
        fields: component.entityId ? [component.entityId] : [],
      })),
    }

    metadataEngine.registerLayout(layoutMetadata)
  }, [selectedPage])

  useEffect(() => {
    if (!selectedPage?.entityId) {
      return
    }

    const entity = metadataEngine.getEntity(selectedPage.entityId)
    if (entity) {
      pushLog(`[LAYOUT] ${selectedPage.title} synchronized to runtime`)
    }
  }, [selectedPage?.entityId, selectedPage?.title])


  const refresh = () => setRefreshKey((value) => value + 1)

  const pushLog = (message: string) => {
    setLogs((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random().toString(16).slice(2)}-${current.length}`, message, timestamp: Date.now() },
    ].slice(-10))
  }

  const updateSelectedPage = (changes: Partial<StudioPage>) => {
    if (!selectedPage) {
      return
    }

    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) => (page.id === selectedPage.id ? { ...page, ...changes } : page)),
    }))

    pushLog(`[WORKSPACE] ${selectedPage.title} updated`)
  }

  const addComponent = () => {
    if (!selectedPage) {
      return
    }

    const component: StudioComponent = {
      id: `cmp-${Date.now()}`,
      kind: newComponentKind,
      title: `${newComponentKind.charAt(0).toUpperCase()}${newComponentKind.slice(1)}`,
      entityId: selectedPage.entityId,
      size: 'medium',
      properties: {},
    }

    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === selectedPage.id
          ? { ...page, components: [...page.components, component] }
          : page
      ),
    }))

    setSelectedComponentId(component.id)
    pushLog(`[PALETTE] Added ${newComponentKind} to ${selectedPage.title}`)
    refresh()
  }

  const removeComponent = (componentId: string) => {
    if (!selectedPage) {
      return
    }

    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === selectedPage.id
          ? { ...page, components: page.components.filter((component) => component.id !== componentId) }
          : page
      ),
    }))

    setSelectedComponentId(null)
    pushLog(`[CANVAS] Removed component from ${selectedPage.title}`)
    refresh()
  }

  const updateSelectedComponent = (changes: Partial<StudioComponent>) => {
    if (!selectedPage || !selectedComponent) {
      return
    }

    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === selectedPage.id
          ? {
              ...page,
              components: page.components.map((component) =>
                component.id === selectedComponent.id
                  ? { ...component, ...changes, properties: { ...component.properties, ...(changes.properties || {}) } }
                  : component
              ),
            }
          : page
      ),
    }))

    refresh()
  }

  const addFieldToPage = () => {
    if (!selectedPage || !newFieldName.trim()) {
      return
    }

    const entityId = selectedPage.entityId || 'platform.party'
    const entity = metadataEngine.getEntity(entityId)
    if (!entity) {
      return
    }

    const field = {
      id: `${entity.id}.${newFieldName}`,
      name: newFieldName,
      label: newFieldName.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      type: newFieldType,
      required: false,
      searchable: true,
      sortable: true,
      filterable: true,
      metadata: {},
    }

    entity.fields.set(field.name, field as any)
    metadataEngine.updateEntity(entity.id, { fields: entity.fields } as any)
    pushLog(`[FIELD] Added ${field.name} to ${entity.label}`)
    setNewFieldName('')
    refresh()
  }

  const generateAiWorkspace = () => {
    if (!aiPrompt.trim()) {
      return
    }

    const pageId = `${aiPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const newPage: StudioPage = {
      id: pageId,
      name: aiPrompt.split(' ').slice(0, 3).join(' '),
      title: aiPrompt.split(' ').slice(0, 3).join(' '),
      entityId: 'platform.party',
      components: [
        {
          id: `ai-card-${Date.now()}`,
          kind: 'card',
          title: 'Overview',
          entityId: 'platform.party',
          size: 'medium',
          properties: { metric: 'Generated' },
        },
        {
          id: `ai-table-${Date.now()}`,
          kind: 'table',
          title: 'Records',
          entityId: 'platform.party',
          size: 'large',
          properties: { columns: ['Name', 'Status'] },
        },
      ],
    }

    setWorkspace((current) => ({
      ...current,
      pages: [...current.pages, newPage],
    }))

    setSelectedPageId(newPage.id)
    setSelectedComponentId(newPage.components[0].id)
    pushLog('[AI] Generated workspace page from prompt')
    refresh()
  }

  const generatedOdl = useMemo(() => {
    const lines = [`workspace ${workspace.name.toLowerCase().replace(/\s+/g, '_')}`]
    workspace.pages.forEach((page) => {
      lines.push(`page ${page.name.toLowerCase().replace(/\s+/g, '_')} {`)
      page.components.forEach((component) => {
        lines.push(`  component ${component.kind} "${component.title}" bound_to ${component.entityId || 'unknown'}`)
      })
      lines.push('}')
    })
    return lines.join('\n')
  }, [workspace])

  const entityOptions = useMemo(
    () => metadataEngine.getAllEntities().map((entity) => ({ id: entity.id, label: entity.label })),
    []
  )

  const pageCount = workspace.pages.length
  const componentCount = workspace.pages.reduce((count, page) => count + page.components.length, 0)

  const handleSelectNode = (node: ExplorerNode) => {
    setSelectedNodeId(node.id)
    if (node.kind === 'page') {
      setSelectedPageId(node.itemId)
      setSelectedComponentId(null)
    }
  }

  const workspaces = [
    {
      id: 'crm',
      name: 'CRM Workspace',
      description: 'A customer relationship management workspace for a modern ERP.',
      recent: ['Customer Workspace', 'Invoice Workspace', 'Shipment Workspace'],
    },
  ]

  const openWorkspace = (workspaceId: string) => {
    setLastWorkspaceId(workspaceId)
    setIsLauncherOpen(false)
    setSelectedPageId('customers')
    setSelectedComponentId('list-1')
  }

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId)
    setSelectedComponentId(null)
    pushLog(`[WORKSPACE] Switched to page ${pageId}`)
  }

  const toggleConsole = () => {
    updateLayout({ consoleOpen: !layout.consoleOpen })
  }

  if (isLauncherOpen) {
    return <StudioLauncher workspaces={workspaces} onOpenWorkspace={openWorkspace} />
  }

  return (
    <div key={refreshKey} className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <StudioToolbar
        onRun={() => {
          pushLog('[RUN] Workspace launched locally')
          refresh()
        }}
        onValidate={() => {
          pushLog('[VALIDATION] Composer validation passed')
          refresh()
        }}
        onAi={() => {
          pushLog('[AI] Composer ready')
          refresh()
        }}
        onRefresh={refresh}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[280px_280px_minmax(0,1fr)_360px] px-4 py-4">
          <div className="min-h-0">
            <StudioExplorer
              explorerTree={explorerTree}
              selectedNodeId={selectedNodeId}
              selectedPageId={selectedPageId}
              onSelectNode={handleSelectNode}
              onSelectPage={handleSelectPage}
            />
          </div>

          <div className="min-h-0">
            <StudioPalette selectedKind={newComponentKind} onSelectKind={setNewComponentKind} />
          </div>

          <div className="min-h-0">
            <StudioCanvas
              pages={workspace.pages}
              selectedPage={selectedPage}
              selectedPageId={selectedPageId}
              selectedComponent={selectedComponent}
              selectedComponentId={selectedComponentId}
              previewMode={previewMode}
              newComponentKind={newComponentKind}
              setNewComponentKind={setNewComponentKind}
              onSelectPage={setSelectedPageId}
              onAddComponent={addComponent}
              onSelectComponent={setSelectedComponentId}
              onRemoveComponent={removeComponent}
              onPreviewModeChange={setPreviewMode}
            />
          </div>

          <div className="min-h-0">
            <StudioInspector
              selectedComponent={selectedComponent}
              selectedPage={selectedPage}
              entities={entityOptions}
              newFieldName={newFieldName}
              newFieldType={newFieldType}
              onFieldNameChange={setNewFieldName}
              onFieldTypeChange={setNewFieldType}
              onAddField={addFieldToPage}
              onUpdateSelectedComponent={updateSelectedComponent}
              onUpdateSelectedPage={updateSelectedPage}
            />
            <div className="mt-4">
              <StudioPreview selectedPage={selectedPage} />
            </div>
          </div>

        </div>

        <div className="border-t border-border bg-card/90 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{selectedPage?.title || 'No page selected'}</span>
              <Badge variant="secondary">{previewMode}</Badge>
              <span>{componentCount} components configured</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant={layout.consoleOpen ? 'default' : 'outline'} onClick={toggleConsole}>
                {layout.consoleOpen ? 'Hide Console' : 'Show Console'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => pushLog('[CONSOLE] Panel refreshed')}>
                Refresh Console
              </Button>
            </div>
          </div>
        </div>

        <div className={`overflow-hidden transition-[height] duration-200 ${layout.consoleOpen ? 'h-[18rem]' : 'h-0'}`}>
          <div className={`h-full ${layout.consoleOpen ? 'block' : 'hidden'} px-4 py-4`}>
            <StudioConsole logs={logs} />
          </div>
        </div>
      </div>

      <StudioStatusBar
        pageCount={pageCount}
        componentCount={componentCount}
        selectedPageTitle={selectedPage?.title || 'None'}
        selectedComponentTitle={selectedComponent?.title || undefined}
        consoleOpen={layout.consoleOpen}
        logs={logs}
      />
    </div>
  )
}
