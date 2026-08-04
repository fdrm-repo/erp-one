/**
 * Metadata Registry
 * Central store for all entity schemas, layouts, workflows, and permissions
 * Singleton pattern - single source of truth for metadata
 */

import type {
  EntitySchema,
  LayoutSchema,
  WorkflowSchema,
  DashboardSchema,
  PermissionSchema,
  ModuleManifest,
  NavigationSchema,
  ThemeConfig,
} from '@/types';

class MetadataRegistry {
  private static instance: MetadataRegistry;

  private entities: Map<string, EntitySchema> = new Map();
  private layouts: Map<string, LayoutSchema> = new Map();
  private workflows: Map<string, WorkflowSchema> = new Map();
  private dashboards: Map<string, DashboardSchema> = new Map();
  private permissions: Map<string, PermissionSchema> = new Map();
  private modules: Map<string, ModuleManifest> = new Map();
  private navigation: Map<string, NavigationSchema> = new Map();
  private theme: ThemeConfig | null = null;

  private constructor() {}

  public static getInstance(): MetadataRegistry {
    if (!MetadataRegistry.instance) {
      MetadataRegistry.instance = new MetadataRegistry();
    }
    return MetadataRegistry.instance;
  }

  // Entity Schema Methods
  public registerEntity(schema: EntitySchema): void {
    this.entities.set(schema.name, schema);
  }

  public getEntity(name: string): EntitySchema | undefined {
    return this.entities.get(name);
  }

  public listEntities(): EntitySchema[] {
    return Array.from(this.entities.values());
  }

  public hasEntity(name: string): boolean {
    return this.entities.has(name);
  }

  // Layout Schema Methods
  public registerLayout(schema: LayoutSchema): void {
    const key = `${schema.entity}:${schema.name}`;
    this.layouts.set(key, schema);
  }

  public getLayout(entity: string, name: string): LayoutSchema | undefined {
    return this.layouts.get(`${entity}:${name}`);
  }

  public getLayoutsByEntity(entity: string): LayoutSchema[] {
    return Array.from(this.layouts.values()).filter(
      (layout) => layout.entity === entity
    );
  }

  // Workflow Schema Methods
  public registerWorkflow(schema: WorkflowSchema): void {
    const key = `${schema.entity}:${schema.name}`;
    this.workflows.set(key, schema);
  }

  public getWorkflow(entity: string, name: string): WorkflowSchema | undefined {
    return this.workflows.get(`${entity}:${name}`);
  }

  // Dashboard Schema Methods
  public registerDashboard(schema: DashboardSchema): void {
    const key = `${schema.module}:${schema.name}`;
    this.dashboards.set(key, schema);
  }

  public getDashboard(module: string, name: string): DashboardSchema | undefined {
    return this.dashboards.get(`${module}:${name}`);
  }

  public getDashboardsByModule(module: string): DashboardSchema[] {
    return Array.from(this.dashboards.values()).filter(
      (dash) => dash.module === module
    );
  }

  // Permission Schema Methods
  public registerPermissions(schema: PermissionSchema): void {
    this.permissions.set(schema.entity, schema);
  }

  public getPermissions(entity: string): PermissionSchema | undefined {
    return this.permissions.get(entity);
  }

  // Module Manifest Methods
  public registerModule(manifest: ModuleManifest): void {
    this.modules.set(manifest.code, manifest);
  }

  public getModule(code: string): ModuleManifest | undefined {
    return this.modules.get(code);
  }

  public listModules(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  // Navigation Schema Methods
  public registerNavigation(schema: NavigationSchema): void {
    this.navigation.set(schema.module, schema);
  }

  public getNavigation(module: string): NavigationSchema | undefined {
    return this.navigation.get(module);
  }

  public getAllNavigation(): NavigationSchema[] {
    return Array.from(this.navigation.values());
  }

  // Theme Methods
  public setTheme(config: ThemeConfig): void {
    this.theme = config;
  }

  public getTheme(): ThemeConfig | null {
    return this.theme;
  }

  // Utility Methods
  public clear(): void {
    this.entities.clear();
    this.layouts.clear();
    this.workflows.clear();
    this.dashboards.clear();
    this.permissions.clear();
    this.modules.clear();
    this.navigation.clear();
    this.theme = null;
  }

  public getStats(): {
    entities: number;
    layouts: number;
    workflows: number;
    dashboards: number;
    modules: number;
    navigation: number;
  } {
    return {
      entities: this.entities.size,
      layouts: this.layouts.size,
      workflows: this.workflows.size,
      dashboards: this.dashboards.size,
      modules: this.modules.size,
      navigation: this.navigation.size,
    };
  }
}

export const metadataRegistry = MetadataRegistry.getInstance();
