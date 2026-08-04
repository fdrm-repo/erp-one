/**
 * Authentication System
 * Metadata-driven permission and role management
 * Provides context for the entire application
 */

import type { PlatformContext } from '@/types';
import { eventBus, SystemEvents } from './event-bus';

class AuthService {
  private static instance: AuthService;
  private context: PlatformContext | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user
   */
  public async login(userId: string, userRole: string, tenantId: string): Promise<boolean> {
    try {
      this.context = {
        tenantId,
        userId,
        userRole,
        permissions: new Set(),
        workspaceId: undefined,
      };

      await eventBus.emit(SystemEvents.USER_LOGGED_IN, {
        userId,
        userRole,
        tenantId,
      });

      return true;
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    const userId = this.context?.userId;

    if (userId) {
      await eventBus.emit(SystemEvents.USER_LOGGED_OUT, { userId });
    }

    this.context = null;
  }

  /**
   * Get current context
   */
  public getContext(): PlatformContext | null {
    return this.context;
  }

  /**
   * Set workspace
   */
  public setWorkspace(workspaceId: string): void {
    if (this.context) {
      this.context.workspaceId = workspaceId;
    }
  }

  /**
   * Add permission
   */
  public addPermission(permission: string): void {
    if (this.context) {
      this.context.permissions.add(permission);
    }
  }

  /**
   * Remove permission
   */
  public removePermission(permission: string): void {
    if (this.context) {
      this.context.permissions.delete(permission);
    }
  }

  /**
   * Check permission
   */
  public hasPermission(permission: string): boolean {
    if (!this.context) return false;
    return this.context.permissions.has(permission);
  }

  /**
   * Check any permission
   */
  public hasAnyPermission(...permissions: string[]): boolean {
    if (!this.context) return false;
    return permissions.some((p) => this.context!.permissions.has(p));
  }

  /**
   * Check all permissions
   */
  public hasAllPermissions(...permissions: string[]): boolean {
    if (!this.context) return false;
    return permissions.every((p) => this.context!.permissions.has(p));
  }

  /**
   * Get user ID
   */
  public getUserId(): string | null {
    return this.context?.userId || null;
  }

  /**
   * Get user role
   */
  public getUserRole(): string | null {
    return this.context?.userRole || null;
  }

  /**
   * Get tenant ID
   */
  public getTenantId(): string | null {
    return this.context?.tenantId || null;
  }

  /**
   * Get workspace ID
   */
  public getWorkspaceId(): string | undefined {
    return this.context?.workspaceId;
  }

  /**
   * Check if authenticated
   */
  public isAuthenticated(): boolean {
    return this.context !== null;
  }

  /**
   * Set permissions from role
   */
  public setPermissionsFromRole(rolePermissions: string[]): void {
    if (this.context) {
      this.context.permissions.clear();
      rolePermissions.forEach((p) => this.context!.permissions.add(p));
    }
  }
}

export const authService = AuthService.getInstance();
