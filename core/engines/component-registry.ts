/**
 * Component Registry
 * Every UI Component registers itself
 * Renderers only ask: ComponentRegistry.resolve()
 */

import type { ComponentMetadata, FieldType } from '@/types/runtime';

interface RegisteredComponent {
  metadata: ComponentMetadata;
  component: any;
}

class ComponentRegistry {
  private components: Map<string, RegisteredComponent>;
  private componentsByFieldType: Map<FieldType, string[]>;
  private componentsByCategory: Map<string, string[]>;

  constructor() {
    this.components = new Map();
    this.componentsByFieldType = new Map();
    this.componentsByCategory = new Map();
  }

  /**
   * Register a UI Component
   */
  register(metadata: ComponentMetadata, component: any): void {
    if (this.components.has(metadata.id)) {
      console.warn(`Component ${metadata.id} already registered. Updating.`);
    }

    this.components.set(metadata.id, { metadata, component });

    // Index by category
    if (!this.componentsByCategory.has(metadata.category)) {
      this.componentsByCategory.set(metadata.category, []);
    }
    this.componentsByCategory.get(metadata.category)!.push(metadata.id);

    // Index by supported field types
    metadata.supportedFieldTypes.forEach(fieldType => {
      if (!this.componentsByFieldType.has(fieldType)) {
        this.componentsByFieldType.set(fieldType, []);
      }
      this.componentsByFieldType.get(fieldType)!.push(metadata.id);
    });
  }

  /**
   * Resolve component by ID
   */
  resolve(componentId: string): RegisteredComponent | undefined {
    return this.components.get(componentId);
  }

  /**
   * Resolve component for field type
   */
  resolveForFieldType(fieldType: FieldType): RegisteredComponent | undefined {
    const componentIds = this.componentsByFieldType.get(fieldType) || [];
    if (componentIds.length === 0) return undefined;
    
    // Return first registered component for this field type
    const componentId = componentIds[0];
    return this.components.get(componentId);
  }

  /**
   * Resolve all components for field type
   */
  resolveAllForFieldType(fieldType: FieldType): RegisteredComponent[] {
    const componentIds = this.componentsByFieldType.get(fieldType) || [];
    return componentIds
      .map(id => this.components.get(id))
      .filter(Boolean) as RegisteredComponent[];
  }

  /**
   * Resolve components by category
   */
  resolveByCategory(category: string): RegisteredComponent[] {
    const componentIds = this.componentsByCategory.get(category) || [];
    return componentIds
      .map(id => this.components.get(id))
      .filter(Boolean) as RegisteredComponent[];
  }

  /**
   * Unregister component
   */
  unregister(componentId: string): void {
    const registered = this.components.get(componentId);
    if (!registered) return;

    this.components.delete(componentId);

    // Remove from category index
    const categoryComponents = this.componentsByCategory.get(registered.metadata.category);
    if (categoryComponents) {
      const index = categoryComponents.indexOf(componentId);
      if (index > -1) categoryComponents.splice(index, 1);
    }

    // Remove from field type index
    registered.metadata.supportedFieldTypes.forEach(fieldType => {
      const fieldComponents = this.componentsByFieldType.get(fieldType);
      if (fieldComponents) {
        const index = fieldComponents.indexOf(componentId);
        if (index > -1) fieldComponents.splice(index, 1);
      }
    });
  }

  /**
   * Get all registered components
   */
  getAll(): RegisteredComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * Get registry stats
   */
  getStats(): Record<string, unknown> {
    return {
      totalComponents: this.components.size,
      categories: Array.from(this.componentsByCategory.keys()),
      fieldTypes: Array.from(this.componentsByFieldType.keys()),
      componentsByCategory: Object.fromEntries(
        Array.from(this.componentsByCategory.entries()).map(([cat, ids]) => [
          cat,
          ids.length,
        ])
      ),
      componentsByFieldType: Object.fromEntries(
        Array.from(this.componentsByFieldType.entries()).map(([type, ids]) => [
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
    this.components.clear();
    this.componentsByFieldType.clear();
    this.componentsByCategory.clear();
  }
}

// Singleton instance
export const componentRegistry = new ComponentRegistry();
