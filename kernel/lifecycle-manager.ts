/**
 * Lifecycle Manager
 * 
 * Controls the lifecycle of all modules.
 * Handles state transitions and lifecycle events.
 * 
 * States: installing → installed → starting → running → stopping → stopped
 */

import type { ILifecycleManager, ModuleMetadata, ModuleState } from '@/types/kernel'

interface ModuleRegistry {
  metadata: ModuleMetadata
  state: ModuleState
  stateCallbacks: Set<(state: ModuleState) => void>
}

export class LifecycleManager implements ILifecycleManager {
  private modules: Map<string, ModuleRegistry> = new Map()

  /**
   * Register a module for lifecycle management
   */
  register(module: ModuleMetadata): void {
    if (this.modules.has(module.id)) {
      throw new Error(`[LifecycleManager] Module already registered: ${module.id}`)
    }

    this.modules.set(module.id, {
      metadata: module,
      state: 'installed',
      stateCallbacks: new Set(),
    })

    console.debug('[LifecycleManager] Registered module:', {
      id: module.id,
      name: module.name,
      version: module.version,
    })
  }

  /**
   * Install a module
   */
  async install(moduleId: string): Promise<void> {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    console.info(`[LifecycleManager] Installing module: ${moduleId}`)

    this.setState(moduleId, 'installing')

    try {
      if (registry.metadata.lifecycle?.install) {
        await registry.metadata.lifecycle.install()
      }

      this.setState(moduleId, 'installed')
      console.info(`[LifecycleManager] Module installed: ${moduleId}`)
    } catch (error) {
      this.setState(moduleId, 'failed')
      console.error(`[LifecycleManager] Module installation failed: ${moduleId}`, error)
      throw error
    }
  }

  /**
   * Start a module
   */
  async start(moduleId: string): Promise<void> {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    if (registry.state !== 'installed') {
      throw new Error(
        `[LifecycleManager] Cannot start module in state: ${registry.state}`
      )
    }

    console.info(`[LifecycleManager] Starting module: ${moduleId}`)

    this.setState(moduleId, 'starting')

    try {
      if (registry.metadata.lifecycle?.start) {
        await registry.metadata.lifecycle.start()
      }

      this.setState(moduleId, 'running')
      console.info(`[LifecycleManager] Module started: ${moduleId}`)
    } catch (error) {
      this.setState(moduleId, 'failed')
      console.error(`[LifecycleManager] Module start failed: ${moduleId}`, error)
      throw error
    }
  }

  /**
   * Stop a module
   */
  async stop(moduleId: string): Promise<void> {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    if (registry.state !== 'running') {
      console.warn(`[LifecycleManager] Module not running: ${moduleId}`)
      return
    }

    console.info(`[LifecycleManager] Stopping module: ${moduleId}`)

    this.setState(moduleId, 'stopping')

    try {
      if (registry.metadata.lifecycle?.stop) {
        await registry.metadata.lifecycle.stop()
      }

      this.setState(moduleId, 'stopped')
      console.info(`[LifecycleManager] Module stopped: ${moduleId}`)
    } catch (error) {
      this.setState(moduleId, 'failed')
      console.error(`[LifecycleManager] Module stop failed: ${moduleId}`, error)
      throw error
    }
  }

  /**
   * Uninstall a module
   */
  async uninstall(moduleId: string): Promise<void> {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    console.info(`[LifecycleManager] Uninstalling module: ${moduleId}`)

    this.setState(moduleId, 'uninstalling')

    try {
      if (registry.metadata.lifecycle?.uninstall) {
        await registry.metadata.lifecycle.uninstall()
      }

      this.modules.delete(moduleId)
      console.info(`[LifecycleManager] Module uninstalled: ${moduleId}`)
    } catch (error) {
      this.setState(moduleId, 'failed')
      console.error(`[LifecycleManager] Module uninstall failed: ${moduleId}`, error)
      throw error
    }
  }

  /**
   * Update a module
   */
  async update(moduleId: string): Promise<void> {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    console.info(`[LifecycleManager] Updating module: ${moduleId}`)

    this.setState(moduleId, 'updating')

    try {
      if (registry.metadata.lifecycle?.update) {
        await registry.metadata.lifecycle.update()
      }

      this.setState(moduleId, 'installed')
      console.info(`[LifecycleManager] Module updated: ${moduleId}`)
    } catch (error) {
      this.setState(moduleId, 'failed')
      console.error(`[LifecycleManager] Module update failed: ${moduleId}`, error)
      throw error
    }
  }

  /**
   * Get module state
   */
  getState(moduleId: string): ModuleState {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    return registry.state
  }

  /**
   * Set module state and notify listeners
   */
  private setState(moduleId: string, state: ModuleState): void {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      return
    }

    const oldState = registry.state
    registry.state = state

    console.debug('[LifecycleManager] State changed', {
      moduleId,
      oldState,
      newState: state,
    })

    // Notify callbacks
    for (const callback of registry.stateCallbacks) {
      try {
        callback(state)
      } catch (error) {
        console.error('[LifecycleManager] Callback error', error)
      }
    }
  }

  /**
   * Listen for state changes
   */
  onStateChange(moduleId: string, callback: (state: ModuleState) => void): () => void {
    const registry = this.modules.get(moduleId)
    if (!registry) {
      throw new Error(`[LifecycleManager] Module not found: ${moduleId}`)
    }

    registry.stateCallbacks.add(callback)

    return () => {
      registry.stateCallbacks.delete(callback)
    }
  }

  /**
   * Get all modules
   */
  getModules(): ModuleMetadata[] {
    return Array.from(this.modules.values()).map((m) => m.metadata)
  }

  /**
   * Get lifecycle statistics
   */
  getStats() {
    const byState: Record<string, number> = {}

    for (const registry of this.modules.values()) {
      byState[registry.state] = (byState[registry.state] || 0) + 1
    }

    return {
      totalModules: this.modules.size,
      byState,
    }
  }

  /**
   * Dispose the lifecycle manager
   */
  async dispose(): Promise<void> {
    // Stop all running modules
    for (const [moduleId, registry] of this.modules) {
      if (registry.state === 'running') {
        try {
          await this.stop(moduleId)
        } catch (error) {
          console.error(`[LifecycleManager] Error stopping module: ${moduleId}`, error)
        }
      }
    }

    this.modules.clear()
    console.info('[LifecycleManager] Lifecycle manager disposed')
  }
}
