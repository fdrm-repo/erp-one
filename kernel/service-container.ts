/**
 * Service Container - IoC / Dependency Injection
 * 
 * The Service Container is the foundational component that manages all platform services.
 * No service should instantiate another service directly.
 * Everything must be resolved through the container.
 * 
 * Supported Lifetimes:
 * - singleton: One instance for the entire application lifetime
 * - transient: New instance every time it's resolved
 * - scoped: One instance per scope (e.g., per request)
 */

import type { ServiceDescriptor, IServiceContainer } from '@/types/kernel'

interface ServiceInstance {
  descriptor: ServiceDescriptor
  instance?: any
  scope?: string
}

export class ServiceContainer implements IServiceContainer {
  private services: Map<string, ServiceInstance> = new Map()
  private singletons: Map<string, any> = new Map()
  private scopedInstances: Map<string, Map<string, any>> = new Map()
  private resolutionStack: Set<string> = new Set()

  /**
   * Register a service in the container
   */
  register(id: string, descriptor: ServiceDescriptor): void {
    if (this.services.has(id)) {
      console.warn(`[ServiceContainer] Overwriting service: ${id}`)
    }

    this.services.set(id, {
      descriptor,
      instance: undefined,
    })

    console.debug(`[ServiceContainer] Registered service: ${id}`, {
      lifetime: descriptor.lifetime,
      dependencies: descriptor.dependencies,
    })
  }

  /**
   * Resolve a service from the container
   * Handles dependency injection automatically
   */
  resolve<T>(id: string, scope?: string): T {
    if (!this.services.has(id)) {
      throw new Error(`[ServiceContainer] Service not found: ${id}`)
    }

    // Detect circular dependencies
    if (this.resolutionStack.has(id)) {
      const circular = Array.from(this.resolutionStack).join(' -> ') + ` -> ${id}`
      throw new Error(`[ServiceContainer] Circular dependency detected: ${circular}`)
    }

    this.resolutionStack.add(id)

    try {
      const service = this.services.get(id)!
      const { descriptor } = service

      // Handle singleton lifetime
      if (descriptor.lifetime === 'singleton') {
        if (this.singletons.has(id)) {
          return this.singletons.get(id)
        }

        const instance = descriptor.factory(this)
        this.singletons.set(id, instance)
        return instance as T
      }

      // Handle scoped lifetime
      if (descriptor.lifetime === 'scoped') {
        const scopeKey = scope || 'default'

        if (!this.scopedInstances.has(scopeKey)) {
          this.scopedInstances.set(scopeKey, new Map())
        }

        const scopeMap = this.scopedInstances.get(scopeKey)!

        if (scopeMap.has(id)) {
          return scopeMap.get(id)
        }

        const instance = descriptor.factory(this)
        scopeMap.set(id, instance)
        return instance as T
      }

      // Handle transient lifetime
      const instance = descriptor.factory(this)
      return instance as T
    } finally {
      this.resolutionStack.delete(id)
    }
  }

  /**
   * Resolve all services matching a pattern
   */
  resolveAll<T>(id: string): T[] {
    const results: T[] = []

    for (const [serviceId, _] of this.services) {
      if (serviceId.includes(id)) {
        results.push(this.resolve<T>(serviceId))
      }
    }

    return results
  }

  /**
   * Check if a service is registered
   */
  has(id: string): boolean {
    return this.services.has(id)
  }

  /**
   * Create a new scope for scoped services
   */
  createScope(scopeId: string): IServiceContainer {
    return new ScopedServiceContainer(this, scopeId)
  }

  /**
   * Clear a scope's instances
   */
  clearScope(scope: string): void {
    this.scopedInstances.delete(scope)
    console.debug(`[ServiceContainer] Cleared scope: ${scope}`)
  }

  /**
   * Dispose the container and all singletons
   */
  async dispose(): Promise<void> {
    // Call dispose on all singletons if they have a dispose method
    for (const [id, instance] of this.singletons) {
      if (instance && typeof instance.dispose === 'function') {
        try {
          await instance.dispose()
          console.debug(`[ServiceContainer] Disposed singleton: ${id}`)
        } catch (error) {
          console.error(`[ServiceContainer] Error disposing singleton: ${id}`, error)
        }
      }
    }

    // Clear all instances
    this.singletons.clear()
    this.scopedInstances.clear()
    this.services.clear()
    this.resolutionStack.clear()

    console.info('[ServiceContainer] Container disposed')
  }

  /**
   * Get container statistics
   */
  getStats() {
    return {
      servicesRegistered: this.services.size,
      singletonsCreated: this.singletons.size,
      scopesActive: this.scopedInstances.size,
    }
  }
}

/**
 * Scoped Service Container
 * Extends the main container with scope-specific instance management
 */
class ScopedServiceContainer implements IServiceContainer {
  constructor(
    private parent: ServiceContainer,
    private scopeId: string
  ) {}

  register(id: string, descriptor: ServiceDescriptor): void {
    this.parent.register(id, descriptor)
  }

  resolve<T>(id: string): T {
    return this.parent.resolve<T>(id, this.scopeId)
  }

  resolveAll<T>(id: string): T[] {
    return this.parent.resolveAll<T>(id)
  }

  has(id: string): boolean {
    return this.parent.has(id)
  }

  async dispose(): Promise<void> {
    this.parent.clearScope(this.scopeId)
  }
}
