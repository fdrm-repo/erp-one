/**
 * Navigation Engine
 * Metadata-driven navigation rendering
 * Builds navigation from module manifests and schemas
 */

import type { NavigationItem, NavigationSchema } from '@/types';
import { metadataRegistry } from './metadata-registry';
import { authService } from './auth';

class NavigationEngine {
  private static instance: NavigationEngine;
  private compiledNavigation: NavigationItem[] | null = null;

  private constructor() {}

  public static getInstance(): NavigationEngine {
    if (!NavigationEngine.instance) {
      NavigationEngine.instance = new NavigationEngine();
    }
    return NavigationEngine.instance;
  }

  /**
   * Build navigation from all loaded modules
   */
  public buildNavigation(): NavigationItem[] {
    const modules = metadataRegistry.listModules();
    const navigationItems: NavigationItem[] = [];

    modules.forEach((module) => {
      const nav = metadataRegistry.getNavigation(module.code);
      if (nav && nav.items) {
        navigationItems.push(...nav.items);
      }
    });

    // Sort by some criteria (could be alphabetical, by importance, etc.)
    return this.filterByPermissions(navigationItems);
  }

  /**
   * Get navigation
   */
  public getNavigation(): NavigationItem[] {
    if (!this.compiledNavigation) {
      this.compiledNavigation = this.buildNavigation();
    }
    return this.compiledNavigation;
  }

  /**
   * Filter navigation items by user permissions
   */
  private filterByPermissions(items: NavigationItem[]): NavigationItem[] {
    const context = authService.getContext();
    if (!context) {
      return [];
    }

    return items
      .filter((item) => this.canAccess(item))
      .map((item) => ({
        ...item,
        children: item.children
          ? item.children.filter((child) => this.canAccess(child))
          : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0 || !item.path);
  }

  /**
   * Check if user can access navigation item
   */
  private canAccess(item: NavigationItem): boolean {
    const context = authService.getContext();
    if (!context) {
      return false;
    }

    // Check role
    if (item.role && item.role !== context.userRole) {
      return false;
    }

    // Could check permissions, features, etc.
    return true;
  }

  /**
   * Get navigation breadcrumb
   */
  public getBreadcrumb(path: string): NavigationItem[] {
    const items = this.getNavigation();
    const breadcrumb: NavigationItem[] = [];

    const findPath = (items: NavigationItem[], targetPath: string): boolean => {
      for (const item of items) {
        if (item.path === targetPath) {
          breadcrumb.push(item);
          return true;
        }

        if (item.children) {
          if (findPath(item.children, targetPath)) {
            breadcrumb.unshift(item);
            return true;
          }
        }
      }

      return false;
    };

    findPath(items, path);
    return breadcrumb;
  }

  /**
   * Search navigation
   */
  public search(query: string): NavigationItem[] {
    const items = this.getNavigation();
    const results: NavigationItem[] = [];

    const search = (items: NavigationItem[]): void => {
      items.forEach((item) => {
        if (item.label.toLowerCase().includes(query.toLowerCase())) {
          results.push(item);
        }

        if (item.children) {
          search(item.children);
        }
      });
    };

    search(items);
    return results;
  }

  /**
   * Invalidate cache
   */
  public invalidate(): void {
    this.compiledNavigation = null;
  }

  /**
   * Export navigation as JSON
   */
  public export(): Record<string, unknown> {
    return {
      items: this.getNavigation(),
      timestamp: new Date().toISOString(),
    };
  }
}

export const navigationEngine = NavigationEngine.getInstance();
