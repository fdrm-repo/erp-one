/**
 * Module Loader
 * Dynamically loads, registers, and manages modules
 * Each module is completely self-contained and installable
 */

import type { ModuleManifest, EntitySchema, LayoutSchema, WorkflowSchema, NavigationSchema } from '@/types';
import { metadataRegistry } from './metadata-registry';
import { eventBus, SystemEvents } from './event-bus';

export interface IModule {
  manifest: ModuleManifest;
  initialize?: () => Promise<void>;
  destroy?: () => Promise<void>;
  getEntities?: () => EntitySchema[];
  getLayouts?: () => LayoutSchema[];
  getWorkflows?: () => WorkflowSchema[];
  getNavigation?: () => NavigationSchema;
}

class ModuleLoader {
  private static instance: ModuleLoader;
  private loadedModules: Map<string, IModule> = new Map();
  private loadingQueue: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): ModuleLoader {
    if (!ModuleLoader.instance) {
      ModuleLoader.instance = new ModuleLoader();
    }
    return ModuleLoader.instance;
  }

  /**
   * Load a module
   */
  public async loadModule(moduleCode: string, module: IModule): Promise<boolean> {
    try {
      if (this.loadedModules.has(moduleCode)) {
        console.warn(`[ModuleLoader] Module already loaded: ${moduleCode}`);
        return true;
      }

      if (this.loadingQueue.has(moduleCode)) {
        console.warn(`[ModuleLoader] Module is already loading: ${moduleCode}`);
        return false;
      }

      this.loadingQueue.add(moduleCode);

      // Check dependencies
      const { manifest } = module;
      for (const dep of manifest.dependencies) {
        if (!this.loadedModules.has(dep)) {
          console.error(`[ModuleLoader] Dependency not found: ${dep}`);
          return false;
        }
      }

      // Register module in metadata registry
      metadataRegistry.registerModule(manifest);

      // Load module entities
      if (module.getEntities) {
        const entities = module.getEntities();
        entities.forEach((entity) => metadataRegistry.registerEntity(entity));
      }

      // Load module layouts
      if (module.getLayouts) {
        const layouts = module.getLayouts();
        layouts.forEach((layout) => metadataRegistry.registerLayout(layout));
      }

      // Load module workflows
      if (module.getWorkflows) {
        const workflows = module.getWorkflows();
        workflows.forEach((workflow) => metadataRegistry.registerWorkflow(workflow));
      }

      // Load module navigation
      if (module.getNavigation) {
        const navigation = module.getNavigation();
        metadataRegistry.registerNavigation(navigation);
      }

      // Initialize module
      if (module.initialize) {
        await module.initialize();
      }

      this.loadedModules.set(moduleCode, module);
      this.loadingQueue.delete(moduleCode);

      console.log(`[ModuleLoader] Module loaded: ${moduleCode}`);
      await eventBus.emit(SystemEvents.MODULE_INSTALLED, { module: moduleCode });

      return true;
    } catch (error) {
      console.error(`[ModuleLoader] Failed to load module ${moduleCode}:`, error);
      this.loadingQueue.delete(moduleCode);
      return false;
    }
  }

  /**
   * Unload a module
   */
  public async unloadModule(moduleCode: string): Promise<boolean> {
    try {
      const module = this.loadedModules.get(moduleCode);
      if (!module) {
        console.warn(`[ModuleLoader] Module not found: ${moduleCode}`);
        return false;
      }

      // Cleanup
      if (module.destroy) {
        await module.destroy();
      }

      this.loadedModules.delete(moduleCode);
      console.log(`[ModuleLoader] Module unloaded: ${moduleCode}`);
      await eventBus.emit(SystemEvents.MODULE_UNINSTALLED, { module: moduleCode });

      return true;
    } catch (error) {
      console.error(`[ModuleLoader] Failed to unload module ${moduleCode}:`, error);
      return false;
    }
  }

  /**
   * Get loaded module
   */
  public getModule(moduleCode: string): IModule | undefined {
    return this.loadedModules.get(moduleCode);
  }

  /**
   * Get all loaded modules
   */
  public getLoadedModules(): IModule[] {
    return Array.from(this.loadedModules.values());
  }

  /**
   * Check if module is loaded
   */
  public isModuleLoaded(moduleCode: string): boolean {
    return this.loadedModules.has(moduleCode);
  }

  /**
   * Get loading status
   */
  public getStatus(): {
    loaded: number;
    loading: number;
    modules: Array<{ code: string; loaded: boolean }>;
  } {
    return {
      loaded: this.loadedModules.size,
      loading: this.loadingQueue.size,
      modules: Array.from(this.loadedModules.keys()).map((code) => ({
        code,
        loaded: true,
      })),
    };
  }

  /**
   * Clear all modules
   */
  public async clearAll(): Promise<void> {
    const modules = Array.from(this.loadedModules.keys());
    for (const moduleCode of modules) {
      await this.unloadModule(moduleCode);
    }
  }
}

export const moduleLoader = ModuleLoader.getInstance();
