/**
 * Runtime Context Service
 * 
 * Everything executes inside a Runtime Context.
 * Context contains all the information about the current execution:
 * - Who is the user?
 * - What tenant/company?
 * - What permissions?
 * - What features are enabled?
 * - What is the locale/timezone?
 * 
 * Services should never request context independently.
 * Context is injected into every service.
 */

import type { RuntimeContext, IContextService } from '@/types/kernel'

export class ContextService implements IContextService {
  private contextStack: RuntimeContext[] = []
  private listeners: Set<(context: RuntimeContext) => void> = new Set()

  /**
   * Create a new runtime context
   */
  create(config: Partial<RuntimeContext>): RuntimeContext {
    const context: RuntimeContext = {
      tenantId: config.tenantId || 'default',
      companyId: config.companyId,
      branchId: config.branchId,
      departmentId: config.departmentId,
      userId: config.userId || 'anonymous',
      sessionId: config.sessionId || this.generateSessionId(),
      locale: config.locale || 'en-US',
      currency: config.currency || 'USD',
      timezone: config.timezone || 'UTC',
      permissions: config.permissions || new Set(),
      roles: config.roles || [],
      features: config.features || new Map(),
      theme: config.theme || 'light',
      language: config.language || 'en',
      metadata: config.metadata || new Map(),
    }

    console.debug('[ContextService] Created context', {
      tenantId: context.tenantId,
      userId: context.userId,
      sessionId: context.sessionId,
    })

    this.contextStack.push(context)
    this.notifyListeners(context)

    return context
  }

  /**
   * Get the current runtime context
   */
  current(): RuntimeContext {
    if (this.contextStack.length === 0) {
      // Create default context if none exists
      return this.create({})
    }

    return this.contextStack[this.contextStack.length - 1]
  }

  /**
   * Push a new context onto the stack
   */
  push(context: RuntimeContext): void {
    this.contextStack.push(context)
    this.notifyListeners(context)
    console.debug('[ContextService] Pushed context', {
      tenantId: context.tenantId,
      userId: context.userId,
      depth: this.contextStack.length,
    })
  }

  /**
   * Pop the current context from the stack
   */
  pop(): RuntimeContext | undefined {
    const context = this.contextStack.pop()
    if (context) {
      console.debug('[ContextService] Popped context', {
        tenantId: context.tenantId,
        userId: context.userId,
        depth: this.contextStack.length,
      })
    }
    return context
  }

  /**
   * Set a value in the current context
   */
  set(key: keyof RuntimeContext, value: any): void {
    const context = this.current()
    ;(context as any)[key] = value

    console.debug('[ContextService] Updated context', {
      key,
      value: typeof value === 'object' ? Object.keys(value).length : value,
    })

    this.notifyListeners(context)
  }

  /**
   * Get a value from the current context
   */
  get<T>(key: keyof RuntimeContext): T {
    const context = this.current()
    return (context as any)[key] as T
  }

  /**
   * Check if the current user has a permission
   */
  has(permission: string): boolean {
    const context = this.current()
    return context.permissions.has(permission)
  }

  /**
   * Add a permission to the current context
   */
  grantPermission(permission: string): void {
    const context = this.current()
    context.permissions.add(permission)
    console.debug('[ContextService] Granted permission', { permission })
    this.notifyListeners(context)
  }

  /**
   * Remove a permission from the current context
   */
  revokePermission(permission: string): void {
    const context = this.current()
    context.permissions.delete(permission)
    console.debug('[ContextService] Revoked permission', { permission })
    this.notifyListeners(context)
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    const context = this.current()
    const enabled = context.features.get(feature)
    return enabled === true
  }

  /**
   * Enable a feature in the current context
   */
  enableFeature(feature: string): void {
    const context = this.current()
    context.features.set(feature, true)
    console.debug('[ContextService] Enabled feature', { feature })
    this.notifyListeners(context)
  }

  /**
   * Disable a feature in the current context
   */
  disableFeature(feature: string): void {
    const context = this.current()
    context.features.set(feature, false)
    console.debug('[ContextService] Disabled feature', { feature })
    this.notifyListeners(context)
  }

  /**
   * Add a role to the current context
   */
  addRole(role: string): void {
    const context = this.current()
    if (!context.roles.includes(role)) {
      context.roles.push(role)
      console.debug('[ContextService] Added role', { role })
      this.notifyListeners(context)
    }
  }

  /**
   * Remove a role from the current context
   */
  removeRole(role: string): void {
    const context = this.current()
    const index = context.roles.indexOf(role)
    if (index !== -1) {
      context.roles.splice(index, 1)
      console.debug('[ContextService] Removed role', { role })
      this.notifyListeners(context)
    }
  }

  /**
   * Check if the current user has a role
   */
  hasRole(role: string): boolean {
    const context = this.current()
    return context.roles.includes(role)
  }

  /**
   * Execute code within a specific context
   */
  async withContext<T>(context: RuntimeContext, fn: () => Promise<T>): Promise<T> {
    this.push(context)
    try {
      return await fn()
    } finally {
      this.pop()
    }
  }

  /**
   * Listen for context changes
   */
  onChange(callback: (context: RuntimeContext) => void): () => void {
    this.listeners.add(callback)

    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Get context statistics
   */
  getStats() {
    const context = this.current()
    return {
      tenantId: context.tenantId,
      userId: context.userId,
      sessionId: context.sessionId,
      permissions: context.permissions.size,
      roles: context.roles.length,
      features: context.features.size,
      stackDepth: this.contextStack.length,
    }
  }

  /**
   * Notify all listeners of context changes
   */
  private notifyListeners(context: RuntimeContext): void {
    for (const listener of this.listeners) {
      try {
        listener(context)
      } catch (error) {
        console.error('[ContextService] Listener error', error)
      }
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Dispose the context service
   */
  async dispose(): Promise<void> {
    this.contextStack = []
    this.listeners.clear()
    console.info('[ContextService] Context service disposed')
  }
}
