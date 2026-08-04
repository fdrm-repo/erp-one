/**
 * Module SDK
 * Every module is installable using this SDK
 * Convention over Configuration pattern inspired by Rails and Odoo
 * 
 * Module structure:
 * module/
 *   ├── manifest.ts
 *   ├── entities/
 *   │   └── *.ts
 *   ├── layouts/
 *   │   └── *.ts
 *   ├── workflows/
 *   │   └── *.ts
 *   ├── dashboards/
 *   │   └── *.ts
 *   ├── navigation/
 *   │   └── *.ts
 *   ├── permissions/
 *   │   └── *.ts
 *   ├── reports/
 *   │   └── *.ts
 *   └── automation/
 *       └── *.ts
 */

import type {
  ModuleManifest,
  EntityMetadata,
  LayoutMetadata,
  WorkflowMetadata,
  DashboardMetadata,
  PermissionMetadata,
} from '@/types/runtime';
import { metadataEngine } from './engines/metadata-engine';
import { entityEngine } from './engines/entity-engine';
import { navigationEngine } from './navigation-engine';

interface ModuleContext {
  manifest: ModuleManifest;
  entities: Map<string, EntityMetadata>;
  layouts: Map<string, LayoutMetadata>;
  workflows: Map<string, WorkflowMetadata>;
  dashboards: Map<string, DashboardMetadata>;
  permissions: Map<string, PermissionMetadata>;
}

interface ModuleOptions {
  manifest: ModuleManifest;
  entities?: EntityMetadata[];
  layouts?: LayoutMetadata[];
  workflows?: WorkflowMetadata[];
  dashboards?: DashboardMetadata[];
  permissions?: PermissionMetadata[];
}

class ModuleSDK {
  private modules: Map<string, ModuleContext>;

  constructor() {
    this.modules = new Map();
  }

  /**
   * Create and install a module
   * Convention over Configuration: automatic discovery and registration
   */
  async createModule(options: ModuleOptions): Promise<ModuleContext> {
    const { manifest } = options;

    // Validate manifest
    this.validateManifest(manifest);

    // Create module context
    const context: ModuleContext = {
      manifest,
      entities: new Map(),
      layouts: new Map(),
      workflows: new Map(),
      dashboards: new Map(),
      permissions: new Map(),
    };

    // Register entities with automatic features
    if (options.entities) {
      options.entities.forEach(entity => {
        entityEngine.registerEntity(entity);
        context.entities.set(entity.id, entity);
      });
    }

    // Register layouts
    if (options.layouts) {
      options.layouts.forEach(layout => {
        metadataEngine.registerLayout(layout);
        context.layouts.set(layout.id, layout);
      });
    }

    // Register workflows
    if (options.workflows) {
      options.workflows.forEach(workflow => {
        metadataEngine.registerWorkflow(workflow);
        context.workflows.set(workflow.id, workflow);
      });
    }

    // Register dashboards
    if (options.dashboards) {
      options.dashboards.forEach(dashboard => {
        metadataEngine.registerDashboard(dashboard);
        context.dashboards.set(dashboard.id, dashboard);
      });
    }

    // Register permissions
    if (options.permissions) {
      options.permissions.forEach(permission => {
        metadataEngine.registerPermission(permission);
        context.permissions.set(permission.id, permission);
      });
    }

    // Store module context
    this.modules.set(manifest.id, context);

    // Update navigation if available
    this.updateNavigation(manifest);

    console.log(`[Module SDK] Module "${manifest.name}" installed successfully`);

    return context;
  }

  /**
   * Install module from discovered convention structure
   * Assumes module follows the standard folder structure
   */
  async installModuleFromDirectory(modulePath: string): Promise<ModuleContext> {
    // This would typically load from the module directory
    // For now, returns null - implementation depends on bundler
    throw new Error(
      'Directory-based module loading requires dynamic imports. Implement in your build system.'
    );
  }

  /**
   * Uninstall module and cascade-delete its metadata
   */
  async uninstallModule(moduleId: string): Promise<void> {
    const context = this.modules.get(moduleId);
    if (!context) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Unregister all entities (cascade delete)
    context.entities.forEach(entity => {
      metadataEngine.unregisterEntity(entity.id);
    });

    // Remove module context
    this.modules.delete(moduleId);

    console.log(`[Module SDK] Module "${context.manifest.name}" uninstalled successfully`);
  }

  /**
   * Get installed module
   */
  getModule(moduleId: string): ModuleContext | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * List all installed modules
   */
  listModules(): ModuleManifest[] {
    return Array.from(this.modules.values()).map(ctx => ctx.manifest);
  }

  /**
   * Validate module dependencies
   */
  validateDependencies(manifest: ModuleManifest): boolean {
    if (!manifest.dependencies || manifest.dependencies.length === 0) {
      return true;
    }

    const installed = Array.from(this.modules.keys());
    const missing = manifest.dependencies.filter(dep => !installed.includes(dep));

    if (missing.length > 0) {
      throw new Error(
        `Module "${manifest.name}" has missing dependencies: ${missing.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Validate manifest structure
   */
  private validateManifest(manifest: ModuleManifest): void {
    if (!manifest.id) throw new Error('Module manifest must have an id');
    if (!manifest.name) throw new Error('Module manifest must have a name');
    if (!manifest.version) throw new Error('Module manifest must have a version');

    this.validateDependencies(manifest);
  }

  /**
   * Update navigation for installed module
   */
  private updateNavigation(manifest: ModuleManifest): void {
    if (!manifest.entities || manifest.entities.length === 0) {
      return;
    }

    // Create navigation items for module entities
    const moduleNavItems = manifest.entities.map(entityId => ({
      id: entityId,
      label: entityId.split('.')[1] || entityId,
      path: `/entities/${entityId}`,
    }));

    // This would typically update the global navigation
    // Implementation depends on how navigation is stored
  }

  /**
   * Get module statistics
   */
  getStats(): Record<string, unknown> {
    const stats = {
      totalModules: this.modules.size,
      totalEntities: 0,
      totalLayouts: 0,
      totalWorkflows: 0,
      totalDashboards: 0,
      modules: Array.from(this.modules.values()).map(ctx => ({
        id: ctx.manifest.id,
        name: ctx.manifest.name,
        version: ctx.manifest.version,
        entities: ctx.entities.size,
        layouts: ctx.layouts.size,
        workflows: ctx.workflows.size,
        dashboards: ctx.dashboards.size,
      })),
    };

    // Calculate totals
    Array.from(this.modules.values()).forEach(ctx => {
      stats.totalEntities += ctx.entities.size;
      stats.totalLayouts += ctx.layouts.size;
      stats.totalWorkflows += ctx.workflows.size;
      stats.totalDashboards += ctx.dashboards.size;
    });

    return stats;
  }

  /**
   * Clear all modules
   */
  clear(): void {
    this.modules.forEach((ctx, id) => {
      try {
        this.uninstallModule(id);
      } catch {
        // Ignore errors during cleanup
      }
    });
  }
}

// Singleton instance
export const moduleSDK = new ModuleSDK();

export type { ModuleContext, ModuleOptions };
