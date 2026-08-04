/**
 * Core Type Definitions for ERP ONE Platform
 * Everything is metadata-driven and type-safe
 */

// Metadata Foundation
export interface Metadata {
  id: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Entity Schema
export interface FieldSchema extends Metadata {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'email' | 'phone' | 'currency' | 'checkbox' | 'relation' | 'link';
  required: boolean;
  readOnly: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: ValidationRule[];
  metadata?: Record<string, unknown>;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  message: string;
  value?: string | number | RegExp;
}

export interface EntitySchema extends Metadata {
  name: string;
  label: string;
  module: string;
  plural: string;
  fields: FieldSchema[];
  relationships?: RelationshipSchema[];
  permissions?: PermissionSchema;
  features?: {
    audit: boolean;
    timeline: boolean;
    attachments: boolean;
    comments: boolean;
    approvals: boolean;
  };
}

// Relationship Schema
export interface RelationshipSchema extends Metadata {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  targetEntity: string;
  sourceField: string;
  targetField: string;
}

// Layout Schema
export interface LayoutSchema extends Metadata {
  name: string;
  entity: string;
  type: 'form' | 'list' | 'card' | 'dashboard' | 'report';
  sections: LayoutSection[];
}

export interface LayoutSection {
  id: string;
  name: string;
  type: 'section' | 'tab' | 'row' | 'grid';
  fields: string[];
  layout?: 'single' | 'two-column' | 'three-column';
}

// Permission Schema
export interface PermissionSchema extends Metadata {
  entity: string;
  roles: Record<string, RolePermission>;
}

export interface RolePermission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  fieldPermissions?: Record<string, FieldPermission>;
}

export interface FieldPermission {
  read: boolean;
  write: boolean;
}

// Workflow Schema
export interface WorkflowSchema extends Metadata {
  name: string;
  entity: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

export interface WorkflowState {
  id: string;
  name: string;
  label: string;
  color?: string;
  actions?: string[];
}

export interface WorkflowTransition {
  from: string;
  to: string;
  label: string;
  conditions?: string[];
  actions?: string[];
}

// Dashboard Schema
export interface DashboardSchema extends Metadata {
  name: string;
  module: string;
  layout: 'grid' | 'flex';
  widgets: WidgetSchema[];
}

export interface WidgetSchema extends Metadata {
  type: 'chart' | 'metric' | 'list' | 'table' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, unknown>;
}

// Module Manifest
export interface ModuleManifest extends Metadata {
  name: string;
  code: string;
  description: string;
  version: string;
  author: string;
  dependencies: string[];
  entities: string[];
  dashboards: string[];
  routes: string[];
  permissions: string[];
  workflows: string[];
  features: Record<string, boolean>;
}

// Platform Context
export interface PlatformContext {
  tenantId: string;
  userId: string;
  userRole: string;
  workspaceId?: string;
  permissions: Set<string>;
}

// Theme Configuration
export interface ThemeConfig extends Metadata {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    destructive: string;
    muted: string;
    mutedForeground: string;
    foreground: string;
    background: string;
    card: string;
    cardForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
  radius: string;
}

// Navigation Schema
export interface NavigationSchema extends Metadata {
  module: string;
  items: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  children?: NavigationItem[];
  role?: string;
  feature?: string;
}
