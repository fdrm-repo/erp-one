/**
 * Dependency Resolver
 * 
 * Resolves module dependencies and detects circular dependencies.
 * Ensures that modules are loaded in the correct order.
 */

import type { IDependencyResolver, DependencyGraph, ModuleMetadata } from '@/types/kernel'

export class DependencyResolver implements IDependencyResolver {
  private graph: Map<string, Set<string>> = new Map()
  private modules: Map<string, ModuleMetadata> = new Map()

  /**
   * Register a module's dependencies
   */
  registerModule(module: ModuleMetadata): void {
    this.modules.set(module.id, module)

    if (!this.graph.has(module.id)) {
      this.graph.set(module.id, new Set())
    }

    for (const dep of module.dependencies || []) {
      this.graph.get(module.id)!.add(dep)
    }

    console.debug('[DependencyResolver] Registered module', {
      id: module.id,
      dependencies: module.dependencies?.length || 0,
    })
  }

  /**
   * Resolve dependencies for a module (topological sort)
   */
  async resolve(moduleId: string): Promise<string[]> {
    const cycles = this.detectCycles()
    if (cycles.length > 0) {
      throw new Error(
        `[DependencyResolver] Circular dependencies detected: ${cycles
          .map((c) => c.join(' -> '))
          .join(', ')}`
      )
    }

    const resolved: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (id: string) => {
      if (resolved.includes(id)) {
        return
      }

      if (visiting.has(id)) {
        throw new Error(`[DependencyResolver] Circular dependency: ${id}`)
      }

      visiting.add(id)

      const deps = this.graph.get(id) || new Set()
      for (const dep of deps) {
        visit(dep)
      }

      visiting.delete(id)
      resolved.push(id)
    }

    visit(moduleId)

    return resolved.reverse()
  }

  /**
   * Get the dependency graph
   */
  getGraph(): DependencyGraph {
    return {
      modules: new Map(this.modules),
      graph: new Map(this.graph),
    }
  }

  /**
   * Detect circular dependencies
   */
  detectCycles(): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const visit = (node: string, path: string[]) => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const neighbors = this.graph.get(node) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visit(neighbor, [...path])
        } else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor)
          const cycle = path.slice(cycleStart).concat(neighbor)
          cycles.push(cycle)
        }
      }

      recursionStack.delete(node)
    }

    for (const node of this.graph.keys()) {
      if (!visited.has(node)) {
        visit(node, [])
      }
    }

    return cycles
  }

  /**
   * Validate dependencies
   */
  validateDependencies(moduleId: string): boolean {
    const module = this.modules.get(moduleId)
    if (!module) {
      return false
    }

    for (const dep of module.dependencies || []) {
      if (!this.modules.has(dep)) {
        console.warn(`[DependencyResolver] Missing dependency: ${dep} for module: ${moduleId}`)
        return false
      }
    }

    return true
  }

  /**
   * Get dependency statistics
   */
  getStats() {
    return {
      modules: this.modules.size,
      dependencies: Array.from(this.graph.values()).reduce((sum, deps) => sum + deps.size, 0),
      cycles: this.detectCycles().length,
    }
  }

  /**
   * Dispose the dependency resolver
   */
  async dispose(): Promise<void> {
    this.graph.clear()
    this.modules.clear()
    console.info('[DependencyResolver] Dependency resolver disposed')
  }
}
