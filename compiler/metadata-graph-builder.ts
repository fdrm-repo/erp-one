/**
 * Metadata Graph Builder
 * 
 * Converts ODL AST to Metadata Graph
 * Metadata Graph is what the Runtime consumes
 */

import type {
  MetadataGraph,
  CompiledEntity,
  CompiledField,
  CompiledRelationship,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  CompileError,
  ODLDocument,
} from '@/types/odl'

export class MetadataGraphBuilder {
  private errors: CompileError[] = []
  private graph: MetadataGraph = {
    entities: new Map(),
    relationships: new Map(),
    workflows: new Map(),
    permissions: new Map(),
    automations: new Map(),
    dashboards: new Map(),
    dependencyGraph: { nodes: [], edges: [], cycles: [] },
    typeDefinitions: [],
  }

  /**
   * Build metadata graph from ODL AST
   */
  build(documents: ODLDocument[]): {
    graph: MetadataGraph | null
    errors: CompileError[]
  } {
    this.errors = []
    this.graph = {
      entities: new Map(),
      relationships: new Map(),
      workflows: new Map(),
      permissions: new Map(),
      automations: new Map(),
      dashboards: new Map(),
      dependencyGraph: { nodes: [], edges: [], cycles: [] },
      typeDefinitions: [],
    }

    // Pass 1: Collect all entity definitions
    for (const doc of documents) {
      for (const def of doc.definitions) {
        if (def.type === 'entity') {
          this.collectEntity(def)
        }
      }
    }

    // Pass 2: Resolve relationships
    for (const entity of this.graph.entities.values()) {
      this.resolveRelationships(entity)
    }

    // Pass 3: Detect circular dependencies
    this.detectCircularDependencies()

    // Pass 4: Generate type definitions
    this.generateTypeDefinitions()

    if (this.errors.length > 0) {
      return { graph: null, errors: this.errors }
    }

    return { graph: this.graph, errors: [] }
  }

  /**
   * Collect entity definition into graph
   */
  private collectEntity(entityDef: any): void {
    const entityName = entityDef.name

    if (this.graph.entities.has(entityName)) {
      this.addError(
        `Entity '${entityName}' already defined`,
        entityDef.location.line
      )
      return
    }

    const compiled: CompiledEntity = {
      name: entityName,
      fields: new Map(),
      relationships: new Map(),
      permissions: [],
      workflows: [],
      automations: [],
    }

    // Process members
    for (const member of entityDef.members || []) {
      if (member.type === 'field') {
        this.addField(compiled, member.data)
      } else if (member.type === 'relationship') {
        this.addRelationship(compiled, member.data)
      } else if (member.type === 'permission') {
        compiled.permissions.push(member.data)
      } else if (member.type === 'workflow') {
        compiled.workflows.push(member.data)
      } else if (member.type === 'automation') {
        compiled.automations.push(member.data)
      }
    }

    this.graph.entities.set(entityName, compiled)

    // Add to dependency graph
    this.graph.dependencyGraph.nodes.push({
      id: entityName,
      type: 'entity',
      name: entityName,
    })
  }

  /**
   * Add field to entity
   */
  private addField(entity: CompiledEntity, fieldDef: any): void {
    const fieldName = fieldDef.name

    if (entity.fields.has(fieldName)) {
      this.addError(
        `Field '${fieldName}' already defined in entity '${entity.name}'`,
        0
      )
      return
    }

    const field: CompiledField = {
      name: fieldName,
      type: fieldDef.type || 'text',
      label: fieldDef.label || fieldName,
      required: fieldDef.required || false,
      unique: fieldDef.unique || false,
      validation: fieldDef.validation,
    }

    entity.fields.set(fieldName, field)
  }

  /**
   * Add relationship to entity
   */
  private addRelationship(entity: CompiledEntity, relDef: any): void {
    const relName = relDef.name

    if (entity.relationships.has(relName)) {
      this.addError(
        `Relationship '${relName}' already defined in entity '${entity.name}'`,
        0
      )
      return
    }

    const relationship: CompiledRelationship = {
      name: relName,
      from: entity.name,
      to: relDef.target || '',
      type: relDef.type || 'hasMany',
    }

    entity.relationships.set(relName, relationship)
    this.graph.relationships.set(`${entity.name}.${relName}`, relationship)

    // Add dependency edge
    this.graph.dependencyGraph.edges.push({
      from: entity.name,
      to: relDef.target,
      type: 'relates',
    })
  }

  /**
   * Resolve all relationships
   */
  private resolveRelationships(entity: CompiledEntity): void {
    for (const relationship of entity.relationships.values()) {
      const targetEntity = this.graph.entities.get(relationship.to)

      if (!targetEntity) {
        this.addError(
          `Relationship '${relationship.name}' references unknown entity '${relationship.to}'`,
          0
        )
        continue
      }

      // Verify target entity exists
      // In production, additional validation would happen here
    }
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: DependencyNode[][] = []

    for (const entity of this.graph.entities.keys()) {
      if (!visited.has(entity)) {
        this.visitNode(entity, visited, recursionStack, [], cycles)
      }
    }

    this.graph.dependencyGraph.cycles = cycles

    if (cycles.length > 0) {
      for (const cycle of cycles) {
        const cycleStr = cycle.map((n) => n.name).join(' -> ')
        this.addError(`Circular dependency detected: ${cycleStr}`, 0)
      }
    }
  }

  /**
   * Visit node during cycle detection
   */
  private visitNode(
    nodeId: string,
    visited: Set<string>,
    stack: Set<string>,
    path: DependencyNode[],
    cycles: DependencyNode[][]
  ): void {
    visited.add(nodeId)
    stack.add(nodeId)

    const node = this.graph.dependencyGraph.nodes.find((n) => n.id === nodeId)
    if (node) {
      path.push(node)
    }

    // Find edges from this node
    const edges = this.graph.dependencyGraph.edges.filter((e) => e.from === nodeId)

    for (const edge of edges) {
      if (!visited.has(edge.to)) {
        this.visitNode(edge.to, visited, stack, path, cycles)
      } else if (stack.has(edge.to)) {
        // Found a cycle
        const cycleStart = path.findIndex((n) => n.id === edge.to)
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), { id: edge.to, type: 'entity', name: edge.to }])
        }
      }
    }

    stack.delete(nodeId)
  }

  /**
   * Generate TypeScript type definitions from metadata
   */
  private generateTypeDefinitions(): void {
    for (const entity of this.graph.entities.values()) {
      const typeDef = {
        name: entity.name,
        kind: 'interface' as const,
        fields: Array.from(entity.fields.values()).map((field) => ({
          name: field.name,
          type: this.mapFieldTypeToTypeScript(field.type),
          optional: !field.required,
          description: field.label,
        })),
        description: `Auto-generated type for ${entity.name}`,
      }

      this.graph.typeDefinitions.push(typeDef)
    }
  }

  /**
   * Map ODL field type to TypeScript type
   */
  private mapFieldTypeToTypeScript(fieldType: string): string {
    const mapping: Record<string, string> = {
      text: 'string',
      email: 'string',
      phone: 'string',
      url: 'string',
      number: 'number',
      decimal: 'number',
      boolean: 'boolean',
      date: 'Date',
      datetime: 'Date',
      time: 'string',
      richtext: 'string',
      json: 'Record<string, unknown>',
      file: 'File',
      image: 'File',
      choice: 'string',
      multiChoice: 'string[]',
      reference: 'string',
      hasMany: 'unknown[]',
      manyToMany: 'unknown[]',
    }

    return mapping[fieldType] || 'unknown'
  }

  /**
   * Add compile error
   */
  private addError(message: string, line: number): void {
    this.errors.push({
      code: 'GRAPH_ERROR',
      message,
      location: {
        file: '',
        line,
        column: 0,
      },
      severity: 'error',
    })
  }
}

/**
 * Build metadata graph from ODL documents
 */
export function buildMetadataGraph(
  documents: ODLDocument[]
): {
  graph: MetadataGraph | null
  errors: CompileError[]
} {
  const builder = new MetadataGraphBuilder()
  return builder.build(documents)
}

/**
 * Export metadata graph as JSON for runtime
 */
export function serializeMetadataGraph(graph: MetadataGraph): string {
  const serialized = {
    entities: Array.from(graph.entities.entries()).map(([name, entity]) => ({
      name,
      fields: Array.from(entity.fields.entries()).map(([fname, field]) => ({
        name: fname,
        ...field,
      })),
      relationships: Array.from(entity.relationships.entries()).map(([rname, rel]) => ({
        name: rname,
        ...rel,
      })),
      permissions: entity.permissions,
      workflows: entity.workflows,
      automations: entity.automations,
    })),
    relationships: Array.from(graph.relationships.entries()).map(([key, rel]) => ({
      key,
      ...rel,
    })),
    dependencyGraph: {
      nodes: graph.dependencyGraph.nodes,
      edges: graph.dependencyGraph.edges,
      cycles: graph.dependencyGraph.cycles,
    },
    typeDefinitions: graph.typeDefinitions,
  }

  return JSON.stringify(serialized, null, 2)
}
