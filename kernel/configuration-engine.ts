/**
 * Configuration Engine
 * 
 * Manages layered configuration with automatic merging.
 * Priority: Environment > Tenant > Company > Module > User > Runtime
 * 
 * Configuration is never hardcoded.
 * All configuration comes from layers.
 */

import type { ConfigLayer, IConfigurationEngine, ConfigValue } from '@/types/kernel'

type ConfigListener = (key: string, value: any) => void

export class ConfigurationEngine implements IConfigurationEngine {
  private config: Map<string, ConfigValue> = new Map()
  private listeners: Map<string, Set<ConfigListener>> = new Map()
  private layerPriority: Record<ConfigLayer, number> = {
    environment: 6,
    tenant: 5,
    company: 4,
    module: 3,
    user: 2,
    runtime: 1,
  }

  /**
   * Get a configuration value with automatic layer resolution
   */
  get<T>(key: string, defaultValue?: T): T {
    const value = this.config.get(key)

    if (!value) {
      return defaultValue as T
    }

    return value.value as T
  }

  /**
   * Set a configuration value in a specific layer
   */
  set(key: string, value: any, layer: ConfigLayer = 'runtime'): void {
    const existing = this.config.get(key)

    // Only update if this layer has higher priority or key doesn't exist
    if (
      !existing ||
      this.layerPriority[layer] >= this.layerPriority[existing.layer]
    ) {
      this.config.set(key, {
        value,
        layer,
        timestamp: new Date(),
      })

      console.debug(`[ConfigurationEngine] Set config: ${key} = ${JSON.stringify(value)} (layer: ${layer})`)

      // Notify listeners
      this.notifyListeners(key, value)
    }
  }

  /**
   * Merge configuration from an object into a specific layer
   */
  merge(config: Record<string, any>, layer: ConfigLayer = 'runtime'): void {
    for (const [key, value] of Object.entries(config)) {
      this.set(key, value, layer)
    }

    console.info(`[ConfigurationEngine] Merged configuration for layer: ${layer}`, {
      keysAdded: Object.keys(config).length,
    })
  }

  /**
   * Listen for changes to a configuration key pattern
   */
  listen(pattern: string, callback: ConfigListener): void {
    if (!this.listeners.has(pattern)) {
      this.listeners.set(pattern, new Set())
    }

    this.listeners.get(pattern)!.add(callback)
  }

  /**
   * Get all configuration values
   */
  getAll(): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {}

    for (const [key, value] of this.config) {
      result[key] = value
    }

    return result
  }

  /**
   * Get configuration by layer
   */
  getByLayer(layer: ConfigLayer): Record<string, any> {
    const result: Record<string, any> = {}

    for (const [key, config] of this.config) {
      if (config.layer === layer) {
        result[key] = config.value
      }
    }

    return result
  }

  /**
   * Clear configuration for a specific layer
   */
  clearLayer(layer: ConfigLayer): void {
    const keysToDelete: string[] = []

    for (const [key, config] of this.config) {
      if (config.layer === layer) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.config.delete(key)
    }

    console.info(`[ConfigurationEngine] Cleared layer: ${layer}`, {
      keysRemoved: keysToDelete.length,
    })
  }

  /**
   * Get configuration statistics
   */
  getStats() {
    const byLayer: Record<string, number> = {}

    for (const config of this.config.values()) {
      byLayer[config.layer] = (byLayer[config.layer] || 0) + 1
    }

    return {
      totalKeys: this.config.size,
      byLayer,
      listeners: this.listeners.size,
    }
  }

  /**
   * Notify listeners of configuration changes
   */
  private notifyListeners(key: string, value: any): void {
    // Notify exact match listeners
    const exactListeners = this.listeners.get(key)
    if (exactListeners) {
      for (const callback of exactListeners) {
        try {
          callback(key, value)
        } catch (error) {
          console.error(`[ConfigurationEngine] Listener error for key: ${key}`, error)
        }
      }
    }

    // Notify pattern match listeners
    for (const [pattern, listeners] of this.listeners) {
      if (pattern !== key && this.matchesPattern(key, pattern)) {
        for (const callback of listeners) {
          try {
            callback(key, value)
          } catch (error) {
            console.error(`[ConfigurationEngine] Listener error for pattern: ${pattern}`, error)
          }
        }
      }
    }
  }

  /**
   * Check if a key matches a pattern
   */
  private matchesPattern(key: string, pattern: string): boolean {
    // Simple wildcard matching
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
    return regex.test(key)
  }

  /**
   * Dispose the configuration engine
   */
  async dispose(): Promise<void> {
    this.config.clear()
    this.listeners.clear()
    console.info('[ConfigurationEngine] Configuration engine disposed')
  }
}
