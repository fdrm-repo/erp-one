/**
 * Entity Engine
 * Every business object becomes a generic Entity
 * The Runtime never knows about Customer, Shipment, Invoice, etc.
 * Only about Entity with automatically resolved features
 */

import type { Entity, EntityMetadata } from '@/types/runtime';
import { metadataEngine } from './metadata-engine';

interface EntityFeatures {
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
}

interface EntityOptions {
  listView?: boolean;
  workspace?: boolean;
  history?: boolean;
  audit?: boolean;
  permissions?: boolean;
  search?: boolean;
  api?: boolean;
  timeline?: boolean;
  attachments?: boolean;
  activities?: boolean;
  approvals?: boolean;
}

class EntityEngine {
  /**
   * Resolve Entity with all features
   * Every entity automatically gets these features
   */
  resolveEntity(metadata: EntityMetadata): EntityMetadata {
    const features: EntityFeatures = {
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
    };

    // Apply metadata overrides
    const overrides = metadata.features || {};
    Object.assign(features, overrides);

    return {
      ...metadata,
      features,
    };
  }

  /**
   * Create Entity with automatic features
   */
  createEntity(
    module: string,
    name: string,
    label: string,
    options?: EntityOptions
  ): EntityMetadata {
    const features: EntityFeatures = {
      listView: options?.listView ?? true,
      workspace: options?.workspace ?? true,
      history: options?.history ?? true,
      audit: options?.audit ?? true,
      permissions: options?.permissions ?? true,
      search: options?.search ?? true,
      api: options?.api ?? true,
      timeline: options?.timeline ?? true,
      attachments: options?.attachments ?? true,
      activities: options?.activities ?? true,
      approvals: options?.approvals ?? true,
    };

    const entity: EntityMetadata = {
      id: `${module}.${name}`,
      module,
      name,
      label,
      plural: `${label}s`,
      fields: new Map(),
      relationships: new Map(),
      features,
    };

    return entity;
  }

  /**
   * Register Entity with automatic features
   */
  registerEntity(metadata: EntityMetadata): void {
    const resolved = this.resolveEntity(metadata);
    metadataEngine.registerEntity(resolved);
  }

  /**
   * Get Entity with automatic features
   */
  getEntity(entityId: string): EntityMetadata | undefined {
    const metadata = metadataEngine.getEntity(entityId);
    if (!metadata) return undefined;
    return this.resolveEntity(metadata);
  }

  /**
   * Get all entities with their features
   */
  getAllEntities(): EntityMetadata[] {
    return metadataEngine.getAllEntities().map(m => this.resolveEntity(m));
  }

  /**
   * Add field to entity
   */
  addField(entityId: string, fieldMetadata: any): void {
    const entity = metadataEngine.getEntity(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);
    
    entity.fields.set(fieldMetadata.name, fieldMetadata);
    metadataEngine.registerField(entityId, fieldMetadata);
  }

  /**
   * Add relationship to entity
   */
  addRelationship(entityId: string, relationshipMetadata: any): void {
    const entity = metadataEngine.getEntity(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);
    
    entity.relationships.set(relationshipMetadata.name, relationshipMetadata);
    metadataEngine.registerRelationship(entityId, relationshipMetadata);
  }

  /**
   * Get list view automatically generated
   */
  getListView(entityId: string): any {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.features.listView) return null;

    return {
      entity: entityId,
      type: 'list',
      fields: Array.from(entity.fields.values())
        .filter(f => f.searchable || f.sortable)
        .slice(0, 10)
        .map(f => f.name),
    };
  }

  /**
   * Get workspace automatically generated
   */
  getWorkspace(entityId: string): any {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.features.workspace) return null;

    return {
      entity: entityId,
      type: 'workspace',
      sections: [
        {
          id: 'details',
          name: 'Details',
          fields: Array.from(entity.fields.values())
            .slice(0, 20)
            .map(f => f.name),
        },
        {
          id: 'relationships',
          name: 'Relationships',
          sections: Array.from(entity.relationships.values()).map(r => ({
            id: r.name,
            name: r.name,
            entity: r.targetEntity,
          })),
        },
        ...(entity.features.attachments
          ? [{ id: 'attachments', name: 'Attachments' }]
          : []),
        ...(entity.features.activities
          ? [{ id: 'activities', name: 'Activities' }]
          : []),
        ...(entity.features.timeline ? [{ id: 'timeline', name: 'Timeline' }] : []),
      ],
    };
  }

  /**
   * Get search configuration automatically
   */
  getSearchConfiguration(entityId: string): any {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.features.search) return null;

    return {
      entity: entityId,
      searchableFields: Array.from(entity.fields.values())
        .filter(f => f.searchable)
        .map(f => f.name),
      ranking: {
        primary: Array.from(entity.fields.values())
          .filter(f => f.name === 'name' || f.name === 'title')
          .map(f => f.name)[0],
        secondary: Array.from(entity.fields.values())
          .filter(f => f.searchable)
          .slice(0, 3)
          .map(f => f.name),
      },
    };
  }

  /**
   * Get API configuration automatically
   */
  getApiConfiguration(entityId: string): any {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.features.api) return null;

    return {
      entity: entityId,
      endpoints: [
        { method: 'GET', path: `/${entity.name}`, action: 'list' },
        { method: 'GET', path: `/${entity.name}/:id`, action: 'read' },
        { method: 'POST', path: `/${entity.name}`, action: 'create' },
        { method: 'PUT', path: `/${entity.name}/:id`, action: 'update' },
        { method: 'DELETE', path: `/${entity.name}/:id`, action: 'delete' },
      ],
    };
  }

  /**
   * Get audit configuration automatically
   */
  getAuditConfiguration(entityId: string): any {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.features.audit) return null;

    return {
      entity: entityId,
      trackFields: Array.from(entity.fields.values()).map(f => f.name),
      trackRelationships: Array.from(entity.relationships.values()).map(r => r.name),
    };
  }

  /**
   * Get permission schema automatically
   */
  getPermissionSchema(entityId: string): any {
    const entity = this.getEntity(entityId);
    if (!entity || !entity.features.permissions) return null;

    return {
      entity: entityId,
      permissions: ['create', 'read', 'update', 'delete'],
      fieldPermissions: Array.from(entity.fields.values()).map(f => ({
        field: f.name,
        permissions: ['read', 'write'],
      })),
    };
  }

  /**
   * Check if entity has feature
   */
  hasFeature(entityId: string, feature: keyof EntityFeatures): boolean {
    const entity = this.getEntity(entityId);
    if (!entity) return false;
    return entity.features[feature];
  }
}

// Singleton instance
export const entityEngine = new EntityEngine();
export type { EntityFeatures, EntityOptions };
