'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { metadataEngine } from '@/core/engines/metadata-engine';
import { componentRegistry } from '@/core/engines/component-registry';
import { templateRegistry } from '@/core/engines/template-registry';
import { moduleSDK } from '@/core/module-sdk';

interface ExplorerNode {
  id: string;
  label: string;
  kind: string;
  itemId: string;
  description: string;
  data: any;
  children?: ExplorerNode[];
}

interface DesignerMode {
  id: string;
  label: string;
}

interface StudioComponent {
  id: string;
  kind: string;
  title: string;
  entityId?: string;
  size: 'small' | 'medium' | 'large';
  properties: Record<string, unknown>;
}

interface StudioPage {
  id: string;
  name: string;
  title: string;
  entityId?: string;
  components: StudioComponent[];
}

interface StudioWorkspace {
  id: string;
  name: string;
  pages: StudioPage[];
}

export default function PlatformStudio() {
  const [selectedNodeId, setSelectedNodeId] = useState('workspace-page:customers');
  const [activeDesignerMode, setActiveDesignerMode] = useState('design');
  const [refreshKey, setRefreshKey] = useState(0);
  const [workspace, setWorkspace] = useState<StudioWorkspace>({
    id: 'crm',
    name: 'CRM Workspace',
    pages: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        title: 'CRM Dashboard',
        entityId: 'platform.party',
        components: [
          { id: 'card-1', kind: 'card', title: 'Revenue Overview', entityId: 'platform.party', size: 'medium', properties: { metric: 'Revenue' } },
          { id: 'card-2', kind: 'chart', title: 'Pipeline', entityId: 'platform.party', size: 'medium', properties: { chart: 'bar' } },
        ],
      },
      {
        id: 'customers',
        name: 'Customers',
        title: 'Customers',
        entityId: 'platform.party',
        components: [
          { id: 'list-1', kind: 'table', title: 'Customer List', entityId: 'platform.party', size: 'large', properties: { columns: ['Name', 'Email', 'Status'] } },
          { id: 'form-1', kind: 'form', title: 'Customer Details', entityId: 'platform.party', size: 'medium', properties: { fields: ['Name', 'Email', 'Phone'] } },
        ],
      },
      {
        id: 'invoices',
        name: 'Invoices',
        title: 'Invoices',
        entityId: 'platform.money',
        components: [
          { id: 'invoice-list', kind: 'table', title: 'Invoice List', entityId: 'platform.money', size: 'large', properties: { columns: ['Number', 'Amount', 'Status'] } },
          { id: 'timeline-1', kind: 'timeline', title: 'Approval Timeline', entityId: 'platform.money', size: 'medium', properties: { items: ['Draft', 'Review', 'Approved'] } },
        ],
      },
      {
        id: 'activities',
        name: 'Activities',
        title: 'Activities',
        entityId: 'platform.activity',
        components: [
          { id: 'activity-list', kind: 'timeline', title: 'Activity Timeline', entityId: 'platform.activity', size: 'medium', properties: { items: ['Call', 'Email', 'Meeting'] } },
        ],
      },
    ],
  });
  const [selectedPageId, setSelectedPageId] = useState('customers');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('list-1');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentKind, setNewComponentKind] = useState('card');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [aiPrompt, setAiPrompt] = useState('Create a customer onboarding workspace for freight operations');
  const [logs, setLogs] = useState<string[]>([
    '[BOOT] Bootstrap package installed core platform modules',
    '[VALIDATION] Composer validation passed',
    '[RUNTIME] Workspace preview is ready',
  ]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const metadataStats = metadataEngine.getStats();
  const componentStats = componentRegistry.getStats();
  const templateStats = templateRegistry.getStats();
  const moduleStats = moduleSDK.getStats();

  const selectedPage = workspace.pages.find((page) => page.id === selectedPageId) || workspace.pages[0];
  const selectedComponent = selectedPage?.components.find((component) => component.id === selectedComponentId) || selectedPage?.components[0];

  const explorerTree = useMemo<ExplorerNode[]>(() => {
    const entityNodes = metadataEngine.getAllEntities().map((entity) => ({
      id: `entity:${entity.id}`,
      label: entity.label,
      kind: 'entity',
      itemId: entity.id,
      description: `${entity.module} • ${entity.fields.size} fields`,
      data: entity,
    }));

    const pageNodes = workspace.pages.map((page) => ({
      id: `workspace-page:${page.id}`,
      label: page.title,
      kind: 'page',
      itemId: page.id,
      description: page.entityId || 'workspace page',
      data: page,
    }));

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
          { id: 'components-root', label: 'Components', kind: 'group', itemId: 'components', description: 'Reusable components', children: componentRegistry.getAll().map((registered) => ({ id: `component:${registered.metadata.id}`, label: registered.metadata.name, kind: 'component', itemId: registered.metadata.id, description: registered.metadata.category, data: registered.metadata })) },
          { id: 'workflows-root', label: 'Workflows', kind: 'group', itemId: 'workflows', description: 'Automation flows', children: [] },
          { id: 'api-root', label: 'API', kind: 'group', itemId: 'api', description: 'Generated endpoints', children: [] },
        ],
      },
    ];
  }, [refreshKey, workspace.pages]);

  const findNode = (nodes: ExplorerNode[], targetId: string): ExplorerNode | undefined => {
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children) {
        const child = findNode(node.children, targetId);
        if (child) return child;
      }
    }
    return undefined;
  };

  const selectedNode = findNode(explorerTree, selectedNodeId) || explorerTree[0]?.children?.[0]?.children?.[0];

  const designerModes: DesignerMode[] = [
    { id: 'design', label: 'Design' },
    { id: 'odl', label: 'ODL' },
    { id: 'json', label: 'JSON' },
    { id: 'graph', label: 'Graph' },
    { id: 'preview', label: 'Preview' },
  ];

  useEffect(() => {
    if (!selectedPage) return;
    const layout = {
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
    };
    metadataEngine.registerLayout(layout);
  }, [selectedPageId, workspace.pages]);

  useEffect(() => {
    if (!selectedPage) return;
    const entity = metadataEngine.getEntity(selectedPage.entityId || 'platform.party');
    if (entity) {
      setLogs((current) => [...current, `[LAYOUT] ${selectedPage.title} synchronized to runtime`].slice(-8));
    }
  }, [selectedPageId]);

  const pushLog = (message: string) => {
    setLogs((current) => [...current, message].slice(-8));
  };

  const updateSelectedPage = (changes: Partial<StudioPage>) => {
    if (!selectedPage) return;
    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) => (page.id === selectedPage.id ? { ...page, ...changes } : page)),
    }));
    pushLog(`[WORKSPACE] ${selectedPage.title} updated`);
  };

  const addComponent = () => {
    if (!selectedPage) return;
    const title = newComponentName.trim() || `${newComponentKind.charAt(0).toUpperCase()}${newComponentKind.slice(1)}`;
    const component: StudioComponent = {
      id: `cmp-${Date.now()}`,
      kind: newComponentKind,
      title,
      entityId: selectedPage.entityId,
      size: 'medium',
      properties: {},
    };
    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) => page.id === selectedPage.id ? { ...page, components: [...page.components, component] } : page),
    }));
    setSelectedComponentId(component.id);
    pushLog(`[PALETTE] Added ${newComponentKind} to ${selectedPage.title}`);
    setNewComponentName('');
    refresh();
  };

  const removeComponent = (componentId: string) => {
    if (!selectedPage) return;
    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) => page.id === selectedPage.id ? { ...page, components: page.components.filter((component) => component.id !== componentId) } : page),
    }));
    setSelectedComponentId(null);
    pushLog(`[CANVAS] Removed component from ${selectedPage.title}`);
    refresh();
  };

  const updateSelectedComponent = (changes: Partial<StudioComponent>) => {
    if (!selectedPage || !selectedComponent) return;
    setWorkspace((current) => ({
      ...current,
      pages: current.pages.map((page) => page.id === selectedPage.id ? {
        ...page,
        components: page.components.map((component) => component.id === selectedComponent.id ? { ...component, ...changes, properties: { ...component.properties, ...(changes.properties || {}) } } : component),
      } : page),
    }));
    refresh();
  };

  const addFieldToPage = () => {
    if (!selectedPage || !newFieldName.trim()) return;
    const entityId = selectedPage.entityId || 'platform.party';
    const entity = metadataEngine.getEntity(entityId);
    if (!entity) return;
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
    };
    entity.fields.set(field.name, field as any);
    metadataEngine.updateEntity(entity.id, { fields: entity.fields } as any);
    pushLog(`[FIELD] Added ${field.name} to ${entity.label}`);
    setNewFieldName('');
    refresh();
  };

  const generateAiWorkspace = () => {
    if (!aiPrompt.trim()) return;
    const pageId = `${aiPrompt.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const newPage: StudioPage = {
      id: pageId,
      name: aiPrompt.split(' ').slice(0, 3).join(' '),
      title: aiPrompt.split(' ').slice(0, 3).join(' '),
      entityId: 'platform.party',
      components: [
        { id: `ai-card-${Date.now()}`, kind: 'card', title: 'Overview', entityId: 'platform.party', size: 'medium', properties: { metric: 'Generated' } },
        { id: `ai-table-${Date.now()}`, kind: 'table', title: 'Records', entityId: 'platform.party', size: 'large', properties: { columns: ['Name', 'Status'] } },
      ],
    };
    setWorkspace((current) => ({ ...current, pages: [...current.pages, newPage] }));
    setSelectedPageId(newPage.id);
    setSelectedComponentId(newPage.components[0].id);
    pushLog(`[AI] Generated workspace page from prompt`);
    refresh();
  };

  const generatedOdl = useMemo(() => {
    const lines = [`workspace ${workspace.name.toLowerCase().replace(/\s+/g, '_')}`];
    workspace.pages.forEach((page) => {
      lines.push(`page ${page.name.toLowerCase().replace(/\s+/g, '_')} {`);
      page.components.forEach((component) => {
        lines.push(`  component ${component.kind} "${component.title}" bound_to ${component.entityId || 'unknown'}`);
      });
      lines.push('}');
    });
    return lines.join('\n');
  }, [workspace]);

  const previewComponents = selectedPage?.components || [];

  const renderPreview = () => {
    if (!selectedPage) return null;
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-background/70 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{selectedPage.title}</h3>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Live</span>
          </div>
          <div className={`mt-3 space-y-3 ${previewMode === 'mobile' ? 'max-w-[320px]' : previewMode === 'tablet' ? 'max-w-[640px]' : 'max-w-full'}`}>
            {previewComponents.map((component) => (
              <div key={component.id} className="rounded border border-border bg-card p-3 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">{component.title}</div>
                {component.kind === 'table' && <div className="mt-2 text-xs">Rows • {component.properties.columns?.join(', ')}</div>}
                {component.kind === 'form' && <div className="mt-2 text-xs">Fields • {component.properties.fields?.join(', ')}</div>}
                {component.kind === 'chart' && <div className="mt-2 text-xs">Chart • {component.properties.chart}</div>}
                {component.kind === 'timeline' && <div className="mt-2 text-xs">Timeline • {component.properties.items?.join(' → ')}</div>}
                {component.kind === 'card' && <div className="mt-2 text-xs">Card • {component.properties.metric}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div key={refreshKey} className="flex h-full flex-col bg-background">
      <header className="border-b border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Enterprise Visual Composer</p>
            <h1 className="text-xl font-semibold text-foreground">ONE Studio</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { pushLog('[RUN] Workspace launched locally'); refresh(); }}>Run</Button>
            <Button variant="outline" onClick={() => { pushLog('[VALIDATION] Composer validation passed'); refresh(); }}>Validate</Button>
            <Button onClick={() => { pushLog('[AI] Composer ready'); refresh(); }}>AI</Button>
            <Button variant="outline" onClick={refresh}>Refresh</Button>
          </div>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[260px_minmax(0,1fr)_360px] overflow-hidden">
        <aside className="border-r border-border bg-card/70 p-3 overflow-auto min-h-0">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explorer</p>
            <p className="text-sm text-muted-foreground">Workspace-first application tree</p>
          </div>
          <div className="space-y-1">
            {explorerTree.map((node) => (
              <div key={node.id}>
                <div className="rounded px-2 py-2 text-sm font-semibold text-foreground">{node.label}</div>
                {node.children?.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedNodeId === child.id ? 'default' : 'ghost'}
                    onClick={() => {
                      setSelectedNodeId(child.id);
                      if (child.kind === 'page') {
                        setSelectedPageId(child.itemId);
                        setSelectedComponentId(null);
                      }
                    }}
                    className="ml-2 w-full justify-start px-2 py-2 text-left text-sm"
                  >
                    <span className="mr-2">•</span>
                    <span>
                      <span className="block">{child.label}</span>
                      <span className="text-xs opacity-80">{child.description}</span>
                    </span>
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex flex-col overflow-hidden">
          <div className="border-b border-border bg-card/80 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Designer</p>
                <h2 className="text-lg font-semibold text-foreground">{selectedPage?.title || 'Workspace'}</h2>
              </div>
              <Tabs defaultValue={activeDesignerMode} className="flex gap-2">
                <TabsList variant="line" className="flex-wrap gap-2">
                  {designerModes.map((mode) => (
                    <TabsTrigger key={mode.id} value={mode.id} onClick={() => setActiveDesignerMode(mode.id)}>
                      {mode.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeDesignerMode === 'design' && (
              <div className="space-y-4">
                <Card className="bg-background/70">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Component Palette</CardTitle>
                      <CardDescription>Drag-ready building blocks for the workspace.</CardDescription>
                    </div>
                    <Badge variant="secondary">Drag-ready</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-3">
                      {['card', 'table', 'chart', 'timeline', 'form', 'tabs', 'kanban', 'calendar', 'map'].map((kind) => (
                        <Button key={kind} variant="outline" className="h-auto items-start justify-start px-3 py-3 text-left" onClick={() => { setNewComponentKind(kind); addComponent(); }}>
                          <span className="block font-medium">{kind}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">Drop on canvas</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/70">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Workspace Canvas</CardTitle>
                      <CardDescription>Compose the page surface from reusable building blocks.</CardDescription>
                    </div>
                    <Button onClick={addComponent}>Add Selected</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedPage?.components.map((component) => (
                        <Button key={component.id} variant={selectedComponent?.id === component.id ? 'default' : 'outline'} className="h-auto items-start justify-start px-3 py-3 text-left" onClick={() => setSelectedComponentId(component.id)}>
                          <span className="block font-medium">{component.title}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{component.kind} • {component.entityId}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/70">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Property Inspector</CardTitle>
                      <CardDescription>Fine-tune the selected component without leaving the canvas.</CardDescription>
                    </div>
                    <Badge variant="secondary">Figma-style</Badge>
                  </CardHeader>
                  <CardContent>
                    {selectedComponent ? (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-sm text-muted-foreground">Title</label>
                          <Input value={selectedComponent.title} onChange={(event) => updateSelectedComponent({ title: event.target.value })} />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-muted-foreground">Entity</label>
                          <Select value={selectedComponent.entityId || ''} onChange={(event) => updateSelectedComponent({ entityId: event.target.value })}>
                            {metadataEngine.getAllEntities().map((entity) => <option key={entity.id} value={entity.id}>{entity.label}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-muted-foreground">Size</label>
                          <Select value={selectedComponent.size} onChange={(event) => updateSelectedComponent({ size: event.target.value as StudioComponent['size'] })}>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </Select>
                        </div>
                        <div>
                          <label className="mb-1 block text-sm text-muted-foreground">Description</label>
                          <Textarea value={selectedComponent.properties.description as string || ''} onChange={(event) => updateSelectedComponent({ properties: { ...selectedComponent.properties, description: event.target.value } })} className="min-h-20" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Select a component to inspect its properties.</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-background/70">
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Page Data Model</CardTitle>
                      <CardDescription>Bind the canvas to a live entity and extend its schema.</CardDescription>
                    </div>
                    <Badge variant="secondary">Live binding</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Page Name</label>
                        <Input value={selectedPage?.name || ''} onChange={(event) => updateSelectedPage({ name: event.target.value, title: event.target.value })} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Entity Binding</label>
                        <Select value={selectedPage?.entityId || ''} onChange={(event) => updateSelectedPage({ entityId: event.target.value })}>
                          {metadataEngine.getAllEntities().map((entity) => <option key={entity.id} value={entity.id}>{entity.label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-muted-foreground">Add Field</label>
                        <div className="flex flex-wrap gap-2">
                          <Input value={newFieldName} onChange={(event) => setNewFieldName(event.target.value)} placeholder="New field" className="flex-1 min-w-[140px]" />
                          <Select value={newFieldType} onChange={(event) => setNewFieldType(event.target.value)} className="w-[140px]">
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="boolean">Boolean</option>
                            <option value="select">Select</option>
                          </Select>
                          <Button onClick={addFieldToPage}>Add</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeDesignerMode === 'odl' && (
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <h3 className="font-semibold text-foreground">Live ODL</h3>
                <pre className="mt-3 overflow-auto rounded border border-border bg-card p-3 font-mono text-sm text-muted-foreground">{generatedOdl}</pre>
              </div>
            )}

            {activeDesignerMode === 'json' && (
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <h3 className="font-semibold text-foreground">JSON Workspace</h3>
                <pre className="mt-3 overflow-auto rounded border border-border bg-card p-3 font-mono text-sm text-muted-foreground">{JSON.stringify(workspace, null, 2)}</pre>
              </div>
            )}

            {activeDesignerMode === 'graph' && (
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <h3 className="font-semibold text-foreground">Dependency Graph</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Workspace</span>
                  <span>→</span>
                  <span className="rounded-full bg-muted px-3 py-1">Pages</span>
                  <span>→</span>
                  <span className="rounded-full bg-muted px-3 py-1">Entities</span>
                  <span>→</span>
                  <span className="rounded-full bg-muted px-3 py-1">Components</span>
                </div>
              </div>
            )}

            {activeDesignerMode === 'preview' && renderPreview()}
          </div>
        </main>

        <aside className="border-l border-border bg-card/70 p-3 overflow-auto">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
              <p className="text-sm text-muted-foreground">Live application canvas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={previewMode === 'desktop' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewMode('desktop')}>Desktop</Button>
              <Button variant={previewMode === 'mobile' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewMode('mobile')}>Mobile</Button>
            </div>
          </div>
          {renderPreview()}
          <Card className="mt-4 bg-background/70">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>AI Composer</CardTitle>
                <CardDescription>Generate a new workspace page using a prompt.</CardDescription>
              </div>
              <Badge variant="secondary">Prompt-driven</Badge>
            </CardHeader>
            <CardContent>
              <Textarea value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} className="min-h-24" />
              <Button onClick={generateAiWorkspace} className="mt-3">Generate Workspace</Button>
            </CardContent>
          </Card>
          <Card className="mt-4 bg-background/70">
            <CardHeader>
              <CardTitle>Runtime Console</CardTitle>
              <CardDescription>Studio events and runtime sync updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 font-mono text-xs text-muted-foreground">
                {logs.map((entry, index) => (
                  <div key={`${entry}-${index}`}>{entry}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
