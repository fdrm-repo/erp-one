/**
 * Layout Engine
 * Metadata-driven layout rendering
 * Generates UI structure from layout schemas
 */

import type { LayoutSchema, LayoutSection, EntitySchema, FieldSchema } from '@/types';
import { metadataRegistry } from './metadata-registry';

export interface ResolvedLayout {
  name: string;
  entity: string;
  type: 'form' | 'list' | 'card' | 'dashboard' | 'report';
  sections: ResolvedSection[];
  fields: Map<string, FieldSchema>;
}

export interface ResolvedSection {
  id: string;
  name: string;
  type: 'section' | 'tab' | 'row' | 'grid';
  fields: FieldSchema[];
  layout?: 'single' | 'two-column' | 'three-column';
}

class LayoutEngine {
  private static instance: LayoutEngine;
  private resolvedLayouts: Map<string, ResolvedLayout> = new Map();

  private constructor() {}

  public static getInstance(): LayoutEngine {
    if (!LayoutEngine.instance) {
      LayoutEngine.instance = new LayoutEngine();
    }
    return LayoutEngine.instance;
  }

  /**
   * Resolve layout - combine layout schema with field schemas
   */
  public resolveLayout(entity: string, layoutName: string): ResolvedLayout | null {
    const cacheKey = `${entity}:${layoutName}`;

    // Check cache
    if (this.resolvedLayouts.has(cacheKey)) {
      return this.resolvedLayouts.get(cacheKey)!;
    }

    // Get layout schema
    const layoutSchema = metadataRegistry.getLayout(entity, layoutName);
    if (!layoutSchema) {
      console.warn(`[LayoutEngine] Layout not found: ${entity}:${layoutName}`);
      return null;
    }

    // Get entity schema
    const entitySchema = metadataRegistry.getEntity(entity);
    if (!entitySchema) {
      console.warn(`[LayoutEngine] Entity not found: ${entity}`);
      return null;
    }

    // Build field map
    const fieldMap = new Map<string, FieldSchema>();
    entitySchema.fields.forEach((field) => {
      fieldMap.set(field.name, field);
    });

    // Resolve sections
    const resolvedSections: ResolvedSection[] = layoutSchema.sections.map((section) => {
      const fields = section.fields
        .map((fieldName) => fieldMap.get(fieldName))
        .filter((field) => field !== undefined) as FieldSchema[];

      return {
        id: section.id,
        name: section.name,
        type: section.type,
        fields,
        layout: section.layout,
      };
    });

    const resolved: ResolvedLayout = {
      name: layoutSchema.name,
      entity: layoutSchema.entity,
      type: layoutSchema.type,
      sections: resolvedSections,
      fields: fieldMap,
    };

    // Cache
    this.resolvedLayouts.set(cacheKey, resolved);

    return resolved;
  }

  /**
   * Get default layout for entity and type
   */
  public getDefaultLayout(entity: string, type: 'form' | 'list'): ResolvedLayout | null {
    const layouts = metadataRegistry.getLayoutsByEntity(entity);
    const defaultLayout = layouts.find((l) => l.type === type);

    if (!defaultLayout) {
      return null;
    }

    return this.resolveLayout(entity, defaultLayout.name);
  }

  /**
   * Generate layout from entity (no explicit layout schema)
   */
  public generateLayoutFromEntity(entity: string, type: 'form' | 'list'): ResolvedLayout | null {
    const entitySchema = metadataRegistry.getEntity(entity);
    if (!entitySchema) {
      return null;
    }

    const layout: ResolvedLayout = {
      name: `auto-${type}`,
      entity,
      type,
      sections: [
        {
          id: 'main',
          name: 'Main',
          type: 'section',
          fields: entitySchema.fields,
          layout:
            type === 'form'
              ? entitySchema.fields.length > 5
                ? 'two-column'
                : 'single'
              : undefined,
        },
      ],
      fields: new Map(entitySchema.fields.map((f) => [f.name, f])),
    };

    return layout;
  }

  /**
   * Get grid layout for responsive design
   */
  public getGridLayout(columnCount: number): {
    mobile: number;
    tablet: number;
    desktop: number;
  } {
    return {
      mobile: 1,
      tablet: Math.max(1, Math.floor(columnCount / 2)),
      desktop: columnCount,
    };
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.resolvedLayouts.clear();
  }

  /**
   * Get cache stats
   */
  public getCacheStats(): {
    cachedLayouts: number;
  } {
    return {
      cachedLayouts: this.resolvedLayouts.size,
    };
  }
}

export const layoutEngine = LayoutEngine.getInstance();
