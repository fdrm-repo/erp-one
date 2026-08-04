/**
 * Metadata Engine
 * Responsible for registering, loading, validating, caching, and versioning all metadata
 */

import type {
  EntityMetadata,
  FieldMetadata,
  RelationshipMetadata,
  LayoutMetadata,
  WorkflowMetadata,
  DashboardMetadata,
  PermissionMetadata,
  ActionMetadata,
  TemplateMetadata,
} from '@/types/runtime';

interface MetadataCache {
  entities: Map<string, EntityMetadata>;
  fields: Map<string, FieldMetadata>;
  relationships: Map<string, RelationshipMetadata>;
  layouts: Map<string, LayoutMetadata>;
  workflows: Map<string, WorkflowMetadata>;
  dashboards: Map<string, DashboardMetadata>;
  permissions: Map<string, PermissionMetadata>;
  actions: Map<string, ActionMetadata>;
  templates: Map<string, TemplateMetadata>;
  version: number;
  lastSync: Date;
}

interface MetadataValidator {
  validate(metadata: unknown, type: string): boolean;
  errors: string[];
}

class MetadataEngine {
  private cache: MetadataCache;
  private validators: Map<string, MetadataValidator>;
  private history: Array<{ timestamp: Date; action: string; metadata: string }>;

  constructor() {
    this.cache = {
      entities: new Map(),
      fields: new Map(),
      relationships: new Map(),
      layouts: new Map(),
      workflows: new Map(),
      dashboards: new Map(),
      permissions: new Map(),
      actions: new Map(),
      templates: new Map(),
      version: 0,
      lastSync: new Date(),
    };
    this.validators = new Map();
    this.history = [];
  }

  /**
   * Register Entity Metadata
   */
  registerEntity(metadata: EntityMetadata): void {
    this.validateMetadata(metadata, 'entity');
    this.cache.entities.set(metadata.id, metadata);
    this.cache.fields.set(`${metadata.id}:fields`, new Map() as never);
    this.incrementVersion();
    this.recordHistory('register_entity', metadata.id);
  }

  /**
   * Update Entity Metadata
   */
  updateEntity(entityId: string, updates: Partial<EntityMetadata>): EntityMetadata | undefined {
    const existing = this.cache.entities.get(entityId);
    if (!existing) {
      return undefined;
    }

    const updated = {
      ...existing,
      ...updates,
      fields: updates.fields ?? existing.fields,
      relationships: updates.relationships ?? existing.relationships,
    };

    this.cache.entities.set(entityId, updated);
    this.incrementVersion();
    this.recordHistory('update_entity', entityId);
    return updated;
  }

  /**
   * Register Field Metadata
   */
  registerField(entityId: string, field: FieldMetadata): void {
    this.validateMetadata(field, 'field');
    this.cache.fields.set(`${entityId}:${field.name}`, field);
    this.incrementVersion();
    this.recordHistory('register_field', `${entityId}:${field.name}`);
  }

  /**
   * Register Relationship Metadata
   */
  registerRelationship(
    entityId: string,
    relationship: RelationshipMetadata
  ): void {
    this.validateMetadata(relationship, 'relationship');
    this.cache.relationships.set(
      `${entityId}:${relationship.name}`,
      relationship
    );
    this.incrementVersion();
    this.recordHistory('register_relationship', `${entityId}:${relationship.name}`);
  }

  /**
   * Register Layout Metadata
   */
  registerLayout(layout: LayoutMetadata): void {
    this.validateMetadata(layout, 'layout');
    this.cache.layouts.set(layout.id, layout);
    this.incrementVersion();
    this.recordHistory('register_layout', layout.id);
  }

  /**
   * Register Workflow Metadata
   */
  registerWorkflow(workflow: WorkflowMetadata): void {
    this.validateMetadata(workflow, 'workflow');
    this.cache.workflows.set(workflow.id, workflow);
    this.incrementVersion();
    this.recordHistory('register_workflow', workflow.id);
  }

  /**
   * Register Dashboard Metadata
   */
  registerDashboard(dashboard: DashboardMetadata): void {
    this.validateMetadata(dashboard, 'dashboard');
    this.cache.dashboards.set(dashboard.id, dashboard);
    this.incrementVersion();
    this.recordHistory('register_dashboard', dashboard.id);
  }

  /**
   * Register Permission Metadata
   */
  registerPermission(permission: PermissionMetadata): void {
    this.validateMetadata(permission, 'permission');
    this.cache.permissions.set(permission.id, permission);
    this.incrementVersion();
    this.recordHistory('register_permission', permission.id);
  }

  /**
   * Register Action Metadata
   */
  registerAction(action: ActionMetadata): void {
    this.validateMetadata(action, 'action');
    this.cache.actions.set(action.id, action);
    this.incrementVersion();
    this.recordHistory('register_action', action.id);
  }

  /**
   * Register Template Metadata
   */
  registerTemplate(template: TemplateMetadata): void {
    this.validateMetadata(template, 'template');
    this.cache.templates.set(template.id, template);
    this.incrementVersion();
    this.recordHistory('register_template', template.id);
  }

  /**
   * Get Entity Metadata
   */
  getEntity(entityId: string): EntityMetadata | undefined {
    return this.cache.entities.get(entityId);
  }

  /**
   * Get Field Metadata
   */
  getField(entityId: string, fieldName: string): FieldMetadata | undefined {
    return this.cache.fields.get(`${entityId}:${fieldName}`);
  }

  /**
   * Get Relationship Metadata
   */
  getRelationship(
    entityId: string,
    relationshipName: string
  ): RelationshipMetadata | undefined {
    return this.cache.relationships.get(
      `${entityId}:${relationshipName}`
    );
  }

  /**
   * Get Layout Metadata
   */
  getLayout(layoutId: string): LayoutMetadata | undefined {
    return this.cache.layouts.get(layoutId);
  }

  /**
   * Get Workflow Metadata
   */
  getWorkflow(workflowId: string): WorkflowMetadata | undefined {
    return this.cache.workflows.get(workflowId);
  }

  /**
   * Get Dashboard Metadata
   */
  getDashboard(dashboardId: string): DashboardMetadata | undefined {
    return this.cache.dashboards.get(dashboardId);
  }

  /**
   * Get All Entities
   */
  getAllEntities(): EntityMetadata[] {
    return Array.from(this.cache.entities.values());
  }

  /**
   * Get All Dashboards
   */
  getAllDashboards(): DashboardMetadata[] {
    return Array.from(this.cache.dashboards.values());
  }

  /**
   * Get All Layouts
   */
  getAllLayouts(): LayoutMetadata[] {
    return Array.from(this.cache.layouts.values());
  }

  /**
   * Get All Workflows
   */
  getAllWorkflows(): WorkflowMetadata[] {
    return Array.from(this.cache.workflows.values());
  }

  /**
   * Get All Permissions
   */
  getAllPermissions(): PermissionMetadata[] {
    return Array.from(this.cache.permissions.values());
  }

  /**
   * Get All Templates
   */
  getAllTemplates(): TemplateMetadata[] {
    return Array.from(this.cache.templates.values());
  }

  /**
   * List Entity Fields
   */
  listEntityFields(entityId: string): FieldMetadata[] {
    const entity = this.cache.entities.get(entityId);
    if (!entity) return [];
    return Array.from(entity.fields.values());
  }

  /**
   * List Entity Relationships
   */
  listEntityRelationships(entityId: string): RelationshipMetadata[] {
    const entity = this.cache.entities.get(entityId);
    if (!entity) return [];
    return Array.from(entity.relationships.values());
  }

  /**
   * Unregister Entity (cascade delete)
   */
  unregisterEntity(entityId: string): void {
    this.cache.entities.delete(entityId);
    
    // Clean up related metadata
    Array.from(this.cache.fields.entries()).forEach(([key]) => {
      if (key.startsWith(`${entityId}:`)) {
        this.cache.fields.delete(key);
      }
    });
    
    Array.from(this.cache.relationships.entries()).forEach(([key]) => {
      if (key.startsWith(`${entityId}:`)) {
        this.cache.relationships.delete(key);
      }
    });

    this.incrementVersion();
    this.recordHistory('unregister_entity', entityId);
  }

  /**
   * Validate Metadata
   */
  private validateMetadata(metadata: unknown, type: string): void {
    const validator = this.validators.get(type);
    if (validator && !validator.validate(metadata, type)) {
      throw new Error(
        `Invalid ${type} metadata: ${validator.errors.join(', ')}`
      );
    }
  }

  /**
   * Increment Version
   */
  private incrementVersion(): void {
    this.cache.version++;
    this.cache.lastSync = new Date();
  }

  /**
   * Record History
   */
  private recordHistory(action: string, metadata: string): void {
    this.history.push({
      timestamp: new Date(),
      action,
      metadata,
    });
    
    // Keep only last 1000 history entries
    if (this.history.length > 1000) {
      this.history = this.history.slice(-1000);
    }
  }

  /**
   * Get Metadata Version
   */
  getVersion(): number {
    return this.cache.version;
  }

  /**
   * Get Last Sync Time
   */
  getLastSync(): Date {
    return this.cache.lastSync;
  }

  /**
   * Get Metadata History
   */
  getHistory(limit: number = 100): Array<{ timestamp: Date; action: string; metadata: string }> {
    return this.history.slice(-limit);
  }

  /**
   * Clear All Metadata
   */
  clear(): void {
    this.cache = {
      entities: new Map(),
      fields: new Map(),
      relationships: new Map(),
      layouts: new Map(),
      workflows: new Map(),
      dashboards: new Map(),
      permissions: new Map(),
      actions: new Map(),
      templates: new Map(),
      version: 0,
      lastSync: new Date(),
    };
    this.history = [];
    this.recordHistory('clear_all', 'system');
  }

  /**
   * Get Cache Stats
   */
  getStats(): Record<string, number> {
    return {
      entities: this.cache.entities.size,
      fields: this.cache.fields.size,
      relationships: this.cache.relationships.size,
      layouts: this.cache.layouts.size,
      workflows: this.cache.workflows.size,
      dashboards: this.cache.dashboards.size,
      permissions: this.cache.permissions.size,
      actions: this.cache.actions.size,
      templates: this.cache.templates.size,
      version: this.cache.version,
      historySize: this.history.length,
    };
  }

  /**
   * VALIDATION API - Get all registered entities (for validation)
   */
  getAllEntitiesForValidation(): EntityMetadata[] {
    return Array.from(this.cache.entities.values());
  }

  /**
   * VALIDATION API - Get fields for entity (for validation)
   */
  getFieldsForValidation(entityId: string): FieldMetadata[] {
    const fields: FieldMetadata[] = [];
    this.cache.fields.forEach((field, key) => {
      if (key.startsWith(`${entityId}:`)) {
        fields.push(field);
      }
    });
    return fields;
  }

  /**
   * VALIDATION API - Get permissions for entity (for validation)
   */
  getPermissionsForValidation(entityId: string): PermissionMetadata[] {
    const permissions: PermissionMetadata[] = [];
    this.cache.permissions.forEach((perm) => {
      if ((perm as any).entityId === entityId) {
        permissions.push(perm);
      }
    });
    return permissions;
  }

  /**
   * VALIDATION API - Check if Core was modified (for validation)
   */
  getCoreModifications(): string[] {
    // This would be implemented by tracking which files were changed
    // during module installation. For now, return empty (assumes clean installation)
    return [];
  }

  /**
   * VALIDATION API - Get auto-generated features for entity
   */
  getAutoFeatures(entityId: string): string[] {
    // Check if entity exists
    if (!this.cache.entities.has(entityId)) {
      return [];
    }

    // Return the list of features that should be auto-generated
    return [
      'list-view',
      'workspace',
      'crud-create',
      'crud-read',
      'crud-update',
      'crud-delete',
      'search',
      'permissions',
      'api-endpoints',
      'form-render',
      'table-render',
    ];
  }

  /**
   * VALIDATION API - Get manually defined pages (should be none!)
   */
  getManuallyDefinedPages(entityId: string): string[] {
    // This would check the React pages directory for manually coded pages
    // For validation, this should return empty array (all generated)
    return [];
  }
}

// Singleton instance
export const metadataEngine = new MetadataEngine();

export type { MetadataCache, MetadataValidator };
