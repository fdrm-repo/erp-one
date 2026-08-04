/**
 * Platform Runtime Type System
 * Core abstractions that never reference business concepts
 */

// Generic Entity - No business knowledge
export interface Entity {
  id: string;
  __typename: string;
  __module: string;
  __metadata?: Record<string, unknown>;
}

// Generic Field Metadata
export type FieldType =
  | 'text'
  | 'number'
  | 'money'
  | 'percentage'
  | 'date'
  | 'time'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'reference'
  | 'lookup'
  | 'user'
  | 'department'
  | 'branch'
  | 'country'
  | 'currency'
  | 'port'
  | 'airport'
  | 'container'
  | 'barcode'
  | 'qrcode'
  | 'file'
  | 'image'
  | 'video'
  | 'signature'
  | 'map'
  | 'json'
  | 'markdown'
  | 'richtext'
  | 'formula'
  | 'computed'
  | 'custom';

export interface FieldMetadata {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  importable?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number | boolean }>;
  validation?: ValidationRule[];
  permissions?: FieldPermission;
  customComponent?: string;
  metadata?: Record<string, unknown>;
}

export interface FieldPermission {
  read?: boolean;
  write?: boolean;
  roles?: Record<string, FieldPermission>;
}

export interface ValidationRule {
  type: string;
  message: string;
  value?: unknown;
  condition?: (value: unknown, context: unknown) => boolean;
}

// Entity Metadata - Defines business objects generically
export interface EntityMetadata {
  id: string;
  module: string;
  name: string;
  label: string;
  plural: string;
  icon?: string;
  description?: string;
  fields: Map<string, FieldMetadata>;
  relationships: Map<string, RelationshipMetadata>;
  features: {
    listView: boolean;
    workspace: boolean;
    history: boolean;
    audit: boolean;
    permissions: boolean;
    search: boolean;
    api: boolean;
    timeline: boolean;
    attachments: boolean;
    activities: boolean;
    approvals: boolean;
  };
}

// Relationships - Metadata only
export type RelationshipType =
  | 'one-to-one'
  | 'one-to-many'
  | 'many-to-many'
  | 'polymorphic'
  | 'tree'
  | 'nested'
  | 'self-reference'
  | 'dynamic-reference';

export interface RelationshipMetadata {
  id: string;
  name: string;
  type: RelationshipType;
  targetEntity: string;
  sourceField: string;
  targetField: string;
  metadata?: Record<string, unknown>;
}

// Component Metadata
export interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  supportedFieldTypes: FieldType[];
  props: Record<string, unknown>;
  customProps?: Record<string, unknown>;
}

// Template Metadata
export type TemplateType =
  | 'workspace'
  | 'dashboard'
  | 'masterdetail'
  | 'wizard'
  | 'settings'
  | 'analytics'
  | 'timeline'
  | 'kanban'
  | 'calendar'
  | 'approval'
  | 'reports'
  | 'portal'
  | 'mobile'
  | 'custom';

export interface TemplateMetadata {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;
  layout: LayoutMetadata;
  actions?: ActionMetadata[];
}

// Layout Metadata - Generic UI composition
export interface LayoutMetadata {
  id: string;
  name: string;
  type: 'flex' | 'grid' | 'section' | 'row' | 'column';
  sections: LayoutSection[];
  metadata?: Record<string, unknown>;
}

export interface LayoutSection {
  id: string;
  name: string;
  type: 'section' | 'tab' | 'row' | 'grid' | 'column';
  layout?: 'single' | 'two-column' | 'three-column';
  fields?: string[];
  sections?: LayoutSection[];
  metadata?: Record<string, unknown>;
}

// Action Metadata - No hardcoded buttons
export type ActionType =
  | 'save'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'print'
  | 'duplicate'
  | 'export'
  | 'archive'
  | 'custom'
  | 'workflow'
  | 'api';

export interface ActionMetadata {
  id: string;
  name: string;
  label: string;
  type: ActionType;
  icon?: string;
  color?: string;
  condition?: string;
  handler: ActionHandler;
  confirmation?: boolean;
  confirmMessage?: string;
  metadata?: Record<string, unknown>;
}

export type ActionHandler = (context: ActionContext) => Promise<void>;

export interface ActionContext {
  entity: Entity;
  user: unknown;
  tenantId: string;
  formData?: Record<string, unknown>;
}

// Permission Metadata
export interface PermissionMetadata {
  id: string;
  entity?: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'custom';
  roles: Map<string, boolean>;
  fieldPermissions?: Map<string, FieldPermission>;
  conditions?: string[];
}

// Workflow Metadata
export interface WorkflowMetadata {
  id: string;
  entity: string;
  name: string;
  states: Map<string, WorkflowState>;
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  id: string;
  name: string;
  label: string;
  color?: string;
  actions?: ActionMetadata[];
}

export interface WorkflowTransition {
  id: string;
  from: string;
  to: string;
  label: string;
  condition?: string;
  actions?: ActionMetadata[];
}

// Dashboard Metadata
export interface DashboardMetadata {
  id: string;
  module: string;
  name: string;
  label: string;
  layout: 'grid' | 'flex';
  widgets: WidgetMetadata[];
}

export interface WidgetMetadata {
  id: string;
  type: 'card' | 'chart' | 'table' | 'timeline' | 'kanban' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  config: Record<string, unknown>;
  permissions?: PermissionMetadata[];
}

// Module Manifest - Convention over Configuration
export interface ModuleManifest {
  id: string;
  name: string;
  code: string;
  version: string;
  description?: string;
  author?: string;
  icon?: string;
  dependencies: string[];
  entities: string[];
  dashboards: string[];
  workflows: string[];
  reports: string[];
  permissions: string[];
  features: Record<string, boolean>;
}

// Data Provider - Database abstraction
export interface DataProvider {
  query<T extends Entity>(query: Query): Promise<T[]>;
  queryOne<T extends Entity>(query: Query): Promise<T | null>;
  create<T extends Entity>(entity: Omit<T, 'id'>): Promise<T>;
  update<T extends Entity>(id: string, data: Partial<T>): Promise<T>;
  delete(entityType: string, id: string): Promise<void>;
}

export interface Query {
  entity: string;
  filter?: Record<string, unknown>;
  sort?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
}

// Runtime - Core abstraction
export interface RuntimeConfig {
  name: string;
  version: string;
  dataProvider: DataProvider;
  modules: Map<string, ModuleManifest>;
}

export interface RuntimeContext {
  config: RuntimeConfig;
  tenantId: string;
  userId: string;
  userRole: string;
  permissions: Set<string>;
}
