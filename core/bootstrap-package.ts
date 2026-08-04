import type {
  ComponentMetadata,
  DashboardMetadata,
  EntityMetadata,
  LayoutMetadata,
  ModuleManifest,
  PermissionMetadata,
  TemplateMetadata,
  WorkflowMetadata,
} from '@/types/runtime';
import { componentRegistry } from './engines/component-registry';
import { entityEngine } from './engines/entity-engine';
import { metadataEngine } from './engines/metadata-engine';
import { templateRegistry } from './engines/template-registry';
import { moduleSDK } from './module-sdk';

function createField(
  name: string,
  label: string,
  type: ComponentMetadata['supportedFieldTypes'][number] | 'text',
  options?: Record<string, unknown>
) {
  return {
    id: `${name}`,
    name,
    label,
    type: type as any,
    required: false,
    searchable: true,
    sortable: true,
    filterable: true,
    metadata: undefined,
    ...options,
  };
}

function createEntity(
  module: string,
  name: string,
  label: string,
  fields: Array<ReturnType<typeof createField>>,
  overrides?: Partial<EntityMetadata>
): EntityMetadata {
  const entity = entityEngine.createEntity(module, name, label, {
    listView: true,
    workspace: true,
    history: true,
    audit: true,
    permissions: true,
    search: true,
    api: true,
    timeline: true,
    attachments: true,
    activities: true,
    approvals: true,
    ...(overrides?.features ?? {}),
  } as any);

  entityEngine.registerEntity(entity);
  fields.forEach((field) => entityEngine.addField(entity.id, field));

  return {
    ...entity,
    ...overrides,
    fields: entity.fields,
    relationships: entity.relationships,
  };
}

function createLayout(id: string, name: string): LayoutMetadata {
  return {
    id,
    name,
    type: 'grid',
    sections: [
      {
        id: `${id}-main`,
        name: 'Main',
        type: 'section',
        layout: 'two-column',
        fields: ['name', 'status'],
      },
    ],
  };
}

function createTemplate(id: string, name: string, type: TemplateMetadata['type'], layout: LayoutMetadata): TemplateMetadata {
  return {
    id,
    name,
    type,
    description: `${name} template`,
    layout,
  };
}

function createDashboard(module: string, id: string, name: string): DashboardMetadata {
  return {
    id,
    module,
    name,
    label: name,
    layout: 'grid',
    widgets: [
      {
        id: `${id}-summary`,
        type: 'card',
        title: `${name} Summary`,
        size: 'medium',
        config: { metric: 'overview' },
      },
    ],
  };
}

function createPermission(entity: string, id: string, resource: string): PermissionMetadata {
  return {
    id,
    entity,
    resource,
    action: 'read',
    roles: new Map([['admin', true], ['user', true]]),
  };
}

function createWorkflow(entity: string, id: string): WorkflowMetadata {
  return {
    id,
    entity,
    name: id,
    states: new Map([
      ['draft', { id: 'draft', name: 'Draft', label: 'Draft' }],
      ['approved', { id: 'approved', name: 'Approved', label: 'Approved' }],
    ]),
    transitions: [
      { id: `${id}-submit`, from: 'draft', to: 'approved', label: 'Approve' },
    ],
  };
}

function createComponent(id: string, name: string, category: string, fieldTypes: string[]): ComponentMetadata {
  return {
    id,
    name,
    category,
    supportedFieldTypes: fieldTypes as any,
    props: { label: name },
  };
}

export async function bootstrapPlatformRuntime() {
  if (moduleSDK.listModules().length > 0) {
    return {
      bootstrapped: true,
      modules: moduleSDK.listModules().map((module) => module.id),
    };
  }

  const platformEntities = [
    createEntity('platform', 'party', 'Party', [
      createField('name', 'Name', 'text'),
      createField('code', 'Code', 'text'),
      createField('status', 'Status', 'select'),
    ]),
    createEntity('platform', 'organization', 'Organization', [
      createField('name', 'Name', 'text'),
      createField('taxId', 'Tax ID', 'text'),
    ]),
    createEntity('platform', 'person', 'Person', [
      createField('firstName', 'First Name', 'text'),
      createField('lastName', 'Last Name', 'text'),
      createField('email', 'Email', 'text'),
    ]),
    createEntity('platform', 'location', 'Location', [
      createField('name', 'Name', 'text'),
      createField('address', 'Address', 'text'),
    ]),
    createEntity('platform', 'document', 'Document', [
      createField('title', 'Title', 'text'),
      createField('category', 'Category', 'select'),
    ]),
    createEntity('platform', 'activity', 'Activity', [
      createField('subject', 'Subject', 'text'),
      createField('dueDate', 'Due Date', 'date'),
    ]),
    createEntity('platform', 'attachment', 'Attachment', [
      createField('filename', 'Filename', 'text'),
      createField('size', 'Size', 'number'),
    ]),
    createEntity('platform', 'money', 'Money', [
      createField('amount', 'Amount', 'money'),
      createField('currency', 'Currency', 'currency'),
    ]),
    createEntity('platform', 'workflow', 'Workflow', [
      createField('name', 'Name', 'text'),
      createField('state', 'State', 'select'),
    ]),
  ];

  const modules: Array<{
    manifest: ModuleManifest;
    entities?: EntityMetadata[];
    layouts?: LayoutMetadata[];
    workflows?: WorkflowMetadata[];
    dashboards?: DashboardMetadata[];
    permissions?: PermissionMetadata[];
  }> = [
    {
      manifest: {
        id: 'core',
        name: 'Core',
        code: 'core',
        version: '1.0.0',
        description: 'Core runtime foundation',
        dependencies: [],
        entities: ['core.entity'],
        dashboards: ['core-dashboard'],
        workflows: [],
        reports: [],
        permissions: ['core.read'],
        features: { bootstrap: true, diagnostics: true },
      },
      entities: [createEntity('core', 'entity', 'Entity', [createField('name', 'Name', 'text')])],
      layouts: [createLayout('core-layout', 'Core Layout')],
      dashboards: [createDashboard('core', 'core-dashboard', 'Core Dashboard')],
      permissions: [createPermission('core.entity', 'core.read', 'core.entity')],
    },
    {
      manifest: {
        id: 'platform',
        name: 'Platform',
        code: 'platform',
        version: '1.0.0',
        description: 'Canonical platform primitives',
        dependencies: ['core'],
        entities: platformEntities.map((entity) => entity.id),
        dashboards: ['platform-dashboard'],
        workflows: ['platform-workflow'],
        reports: [],
        permissions: ['platform.manage'],
        features: { bootstrap: true, explorer: true },
      },
      entities: platformEntities,
      layouts: [createLayout('platform-layout', 'Platform Layout')],
      workflows: [createWorkflow('platform.party', 'platform-workflow')],
      dashboards: [createDashboard('platform', 'platform-dashboard', 'Platform Dashboard')],
      permissions: [createPermission('platform.party', 'platform.manage', 'platform.party')],
    },
    {
      manifest: {
        id: 'identity',
        name: 'Identity',
        code: 'identity',
        version: '1.0.0',
        description: 'Identity and access primitives',
        dependencies: ['platform'],
        entities: ['identity.user', 'identity.role'],
        dashboards: ['identity-dashboard'],
        workflows: [],
        reports: [],
        permissions: ['identity.manage'],
        features: { bootstrap: true, security: true },
      },
      entities: [
        createEntity('identity', 'user', 'User', [createField('username', 'Username', 'text')]),
        createEntity('identity', 'role', 'Role', [createField('name', 'Name', 'text')]),
      ],
      layouts: [createLayout('identity-layout', 'Identity Layout')],
      dashboards: [createDashboard('identity', 'identity-dashboard', 'Identity Dashboard')],
      permissions: [createPermission('identity.user', 'identity.manage', 'identity.user')],
    },
    {
      manifest: {
        id: 'workspace',
        name: 'Workspace',
        code: 'workspace',
        version: '1.0.0',
        description: 'Workspace and navigation primitives',
        dependencies: ['platform'],
        entities: ['workspace.workspace'],
        dashboards: ['workspace-dashboard'],
        workflows: [],
        reports: [],
        permissions: ['workspace.manage'],
        features: { bootstrap: true, workspaces: true },
      },
      entities: [createEntity('workspace', 'workspace', 'Workspace', [createField('title', 'Title', 'text')])],
      layouts: [createLayout('workspace-layout', 'Workspace Layout')],
      dashboards: [createDashboard('workspace', 'workspace-dashboard', 'Workspace Dashboard')],
      permissions: [createPermission('workspace.workspace', 'workspace.manage', 'workspace.workspace')],
    },
    {
      manifest: {
        id: 'documents',
        name: 'Documents',
        code: 'documents',
        version: '1.0.0',
        description: 'Document management primitives',
        dependencies: ['platform'],
        entities: ['documents.document'],
        dashboards: ['documents-dashboard'],
        workflows: [],
        reports: [],
        permissions: ['documents.manage'],
        features: { bootstrap: true, documents: true },
      },
      entities: [createEntity('documents', 'document', 'Document', [createField('title', 'Title', 'text')])],
      layouts: [createLayout('documents-layout', 'Documents Layout')],
      dashboards: [createDashboard('documents', 'documents-dashboard', 'Documents Dashboard')],
      permissions: [createPermission('documents.document', 'documents.manage', 'documents.document')],
    },
    {
      manifest: {
        id: 'notifications',
        name: 'Notifications',
        code: 'notifications',
        version: '1.0.0',
        description: 'Notification primitives',
        dependencies: ['platform'],
        entities: ['notifications.notification'],
        dashboards: ['notifications-dashboard'],
        workflows: [],
        reports: [],
        permissions: ['notifications.manage'],
        features: { bootstrap: true, notifications: true },
      },
      entities: [createEntity('notifications', 'notification', 'Notification', [createField('message', 'Message', 'text')])],
      layouts: [createLayout('notifications-layout', 'Notifications Layout')],
      dashboards: [createDashboard('notifications', 'notifications-dashboard', 'Notifications Dashboard')],
      permissions: [createPermission('notifications.notification', 'notifications.manage', 'notifications.notification')],
    },
    {
      manifest: {
        id: 'approvals',
        name: 'Approvals',
        code: 'approvals',
        version: '1.0.0',
        description: 'Workflow approvals primitives',
        dependencies: ['platform'],
        entities: ['approvals.approval'],
        dashboards: ['approvals-dashboard'],
        workflows: ['approvals-workflow'],
        reports: [],
        permissions: ['approvals.manage'],
        features: { bootstrap: true, approvals: true },
      },
      entities: [createEntity('approvals', 'approval', 'Approval', [createField('subject', 'Subject', 'text')])],
      layouts: [createLayout('approvals-layout', 'Approvals Layout')],
      workflows: [createWorkflow('approvals.approval', 'approvals-workflow')],
      dashboards: [createDashboard('approvals', 'approvals-dashboard', 'Approvals Dashboard')],
      permissions: [createPermission('approvals.approval', 'approvals.manage', 'approvals.approval')],
    },
    {
      manifest: {
        id: 'diagnostics',
        name: 'Diagnostics',
        code: 'diagnostics',
        version: '1.0.0',
        description: 'Platform diagnostics and health',
        dependencies: ['platform'],
        entities: ['diagnostics.health'],
        dashboards: ['diagnostics-dashboard'],
        workflows: [],
        reports: [],
        permissions: ['diagnostics.manage'],
        features: { bootstrap: true, diagnostics: true },
      },
      entities: [createEntity('diagnostics', 'health', 'Health', [createField('status', 'Status', 'text')])],
      layouts: [createLayout('diagnostics-layout', 'Diagnostics Layout')],
      dashboards: [createDashboard('diagnostics', 'diagnostics-dashboard', 'Diagnostics Dashboard')],
      permissions: [createPermission('diagnostics.health', 'diagnostics.manage', 'diagnostics.health')],
    },
  ];

  const coreComponents = [
    createComponent('component.text', 'Text', 'input', ['text', 'richtext']),
    createComponent('component.money', 'Money', 'input', ['money']),
    createComponent('component.currency', 'Currency', 'input', ['currency']),
    createComponent('component.lookup', 'Lookup', 'input', ['lookup']),
    createComponent('component.table', 'Table', 'display', ['text']),
    createComponent('component.timeline', 'Timeline', 'display', ['date']),
    createComponent('component.chart', 'Chart', 'display', ['number']),
    createComponent('component.calendar', 'Calendar', 'display', ['date']),
    createComponent('component.badge', 'Badge', 'display', ['select']),
  ];

  const coreTemplates = [
    createTemplate('template.workspace', 'Workspace', 'workspace', createLayout('template-workspace-layout', 'Workspace Layout')),
    createTemplate('template.dashboard', 'Dashboard', 'dashboard', createLayout('template-dashboard-layout', 'Dashboard Layout')),
    createTemplate('template.list', 'List', 'masterdetail', createLayout('template-list-layout', 'List Layout')),
    createTemplate('template.wizard', 'Wizard', 'wizard', createLayout('template-wizard-layout', 'Wizard Layout')),
    createTemplate('template.calendar', 'Calendar', 'calendar', createLayout('template-calendar-layout', 'Calendar Layout')),
    createTemplate('template.kanban', 'Kanban', 'kanban', createLayout('template-kanban-layout', 'Kanban Layout')),
    createTemplate('template.approval', 'Approval', 'approval', createLayout('template-approval-layout', 'Approval Layout')),
  ];

  coreComponents.forEach((component) => {
    componentRegistry.register(component, {});
  });

  coreTemplates.forEach((template) => {
    templateRegistry.register(template, () => ({ ok: true }));
  });

  for (const module of modules) {
    await moduleSDK.createModule(module);
  }

  return {
    bootstrapped: true,
    modules: moduleSDK.listModules().map((module) => module.id),
    entities: metadataEngine.getStats().entities,
    components: componentRegistry.getStats().totalComponents,
    templates: templateRegistry.getStats().totalTemplates,
  };
}
