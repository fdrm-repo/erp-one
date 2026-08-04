/**
 * Template Registry
 * Never manually build pages
 * Modules select Templates and the Runtime renders them
 */

import type { TemplateMetadata, TemplateType } from '@/types/runtime';

interface RegisteredTemplate {
  metadata: TemplateMetadata;
  renderer: (entity: string, config: any) => any;
}

class TemplateRegistry {
  private templates: Map<string, RegisteredTemplate>;
  private templatesByType: Map<TemplateType, string[]>;
  private templatesByModule: Map<string, string[]>;

  constructor() {
    this.templates = new Map();
    this.templatesByType = new Map();
    this.templatesByModule = new Map();
  }

  /**
   * Register a Template
   */
  register(
    metadata: TemplateMetadata,
    renderer: (entity: string, config: any) => any
  ): void {
    if (this.templates.has(metadata.id)) {
      console.warn(`Template ${metadata.id} already registered. Updating.`);
    }

    this.templates.set(metadata.id, { metadata, renderer });

    // Index by type
    if (!this.templatesByType.has(metadata.type)) {
      this.templatesByType.set(metadata.type, []);
    }
    this.templatesByType.get(metadata.type)!.push(metadata.id);
  }

  /**
   * Resolve template by ID
   */
  resolve(templateId: string): RegisteredTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Resolve template by type and optional entity
   */
  resolveByType(type: TemplateType, entity?: string): RegisteredTemplate | undefined {
    const templateIds = this.templatesByType.get(type) || [];
    if (templateIds.length === 0) return undefined;
    
    // If entity specified, try to find entity-specific template first
    if (entity) {
      for (const templateId of templateIds) {
        const template = this.templates.get(templateId);
        if (template?.metadata.name.includes(entity)) {
          return template;
        }
      }
    }

    // Return first template of type
    return this.templates.get(templateIds[0]);
  }

  /**
   * Resolve all templates of a type
   */
  resolveAllByType(type: TemplateType): RegisteredTemplate[] {
    const templateIds = this.templatesByType.get(type) || [];
    return templateIds
      .map(id => this.templates.get(id))
      .filter(Boolean) as RegisteredTemplate[];
  }

  /**
   * Render template
   */
  render(
    templateId: string,
    entity: string,
    config: any
  ): any {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return template.renderer(entity, config);
  }

  /**
   * Get default template for type
   */
  getDefaultTemplate(type: TemplateType): RegisteredTemplate | undefined {
    const templateIds = this.templatesByType.get(type) || [];
    if (templateIds.length === 0) return undefined;
    return this.templates.get(templateIds[0]);
  }

  /**
   * Unregister template
   */
  unregister(templateId: string): void {
    const template = this.templates.get(templateId);
    if (!template) return;

    this.templates.delete(templateId);

    // Remove from type index
    const typeTemplates = this.templatesByType.get(template.metadata.type);
    if (typeTemplates) {
      const index = typeTemplates.indexOf(templateId);
      if (index > -1) typeTemplates.splice(index, 1);
    }
  }

  /**
   * Get all registered templates
   */
  getAll(): RegisteredTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get all template types
   */
  getAllTypes(): TemplateType[] {
    return Array.from(this.templatesByType.keys());
  }

  /**
   * Get templates by type
   */
  getByType(type: TemplateType): RegisteredTemplate[] {
    const templateIds = this.templatesByType.get(type) || [];
    return templateIds
      .map(id => this.templates.get(id))
      .filter(Boolean) as RegisteredTemplate[];
  }

  /**
   * Get registry stats
   */
  getStats(): Record<string, unknown> {
    return {
      totalTemplates: this.templates.size,
      types: Array.from(this.templatesByType.keys()),
      templatesByType: Object.fromEntries(
        Array.from(this.templatesByType.entries()).map(([type, ids]) => [
          type,
          ids.length,
        ])
      ),
    };
  }

  /**
   * Clear registry
   */
  clear(): void {
    this.templates.clear();
    this.templatesByType.clear();
    this.templatesByModule.clear();
  }
}

// Singleton instance
export const templateRegistry = new TemplateRegistry();
