/**
 * ONE Definition Language (ODL) Parser
 * 
 * Converts YAML ODL source files to AST
 * Uses YAML for human-readable definitions
 */

import type {
  ODLDocument,
  EntityDefinitionNode,
  WorkflowDefinitionNode,
  Definition,
  CompileError,
} from '@/types/odl'

export class ODLParser {
  private errors: CompileError[] = []
  private currentFile: string = ''
  private currentLine: number = 1

  /**
   * Parse ODL source file (YAML format)
   * Returns AST or errors
   */
  parse(source: string, filename: string): {
    ast: ODLDocument | null
    errors: CompileError[]
  } {
    this.currentFile = filename
    this.errors = []

    try {
      // Parse YAML structure
      const yamlAst = this.parseYAML(source)

      // Convert to ODL AST
      const document = this.buildASTFromYAML(yamlAst)

      return { ast: document, errors: this.errors }
    } catch (error) {
      this.errors.push({
        code: 'PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown parse error',
        location: {
          file: this.currentFile,
          line: this.currentLine,
          column: 0,
        },
        severity: 'error',
      })

      return { ast: null, errors: this.errors }
    }
  }

  /**
   * Parse YAML content (simplified implementation)
   * In production, use a proper YAML library like js-yaml
   */
  private parseYAML(source: string): Record<string, unknown> {
    // This is a simplified YAML parser
    // Production version should use js-yaml or similar
    const lines = source.split('\n')
    const result: Record<string, unknown> = {}

    let currentKey = ''
    let currentObj: any = result
    const stack: any[] = [result]
    let currentIndent = 0

    for (const line of lines) {
      this.currentLine++

      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) continue

      const indent = line.search(/\S/)
      const content = line.trim()

      // Handle indentation
      if (indent > currentIndent) {
        // Going deeper
        if (currentKey && typeof currentObj[currentKey] === 'object') {
          currentObj = currentObj[currentKey]
          stack.push(currentObj)
        } else {
          currentObj[currentKey] = {}
          stack.push(currentObj[currentKey])
          currentObj = currentObj[currentKey]
        }
        currentIndent = indent
      } else if (indent < currentIndent) {
        // Going back up
        while (stack.length > 1 && indent < currentIndent) {
          currentObj = stack[stack.length - 2]
          stack.pop()
          currentIndent -= 2
        }
      }

      // Parse key: value
      if (content.includes(':')) {
        const [key, ...valueParts] = content.split(':')
        const value = valueParts.join(':').trim()

        currentKey = key.trim()

        // Parse value
        if (!value) {
          currentObj[currentKey] = {}
        } else if (value === 'true') {
          currentObj[currentKey] = true
        } else if (value === 'false') {
          currentObj[currentKey] = false
        } else if (!isNaN(Number(value))) {
          currentObj[currentKey] = Number(value)
        } else if (value.startsWith('"') && value.endsWith('"')) {
          currentObj[currentKey] = value.slice(1, -1)
        } else {
          currentObj[currentKey] = value
        }
      } else if (content.startsWith('-')) {
        // Array item
        if (!Array.isArray(currentObj[currentKey])) {
          currentObj[currentKey] = []
        }
        currentObj[currentKey].push(content.slice(1).trim())
      }
    }

    return result
  }

  /**
   * Build ODL AST from YAML structure
   */
  private buildASTFromYAML(yamlAst: Record<string, unknown>): ODLDocument {
    const definitions: Definition[] = []

    // Find entity definitions
    if (yamlAst.entity) {
      const entityDef = this.parseEntityDefinition(yamlAst)
      if (entityDef) definitions.push(entityDef)
    }

    // Find workflow definitions
    if (yamlAst.workflow) {
      const workflowDef = this.parseWorkflowDefinition(yamlAst)
      if (workflowDef) definitions.push(workflowDef)
    }

    return { definitions }
  }

  /**
   * Parse entity definition from YAML
   */
  private parseEntityDefinition(
    yamlAst: Record<string, unknown>
  ): EntityDefinitionNode | null {
    const name = String(yamlAst.entity)

    if (!name) {
      this.addError('Entity must have a name', this.currentLine)
      return null
    }

    return {
      type: 'entity',
      name,
      attributes: {
        label: yamlAst.label || name,
        description: yamlAst.description,
      },
      members: this.parseEntityMembers(yamlAst),
      location: {
        file: this.currentFile,
        line: this.currentLine,
        column: 0,
      },
    }
  }

  /**
   * Parse entity members (fields, relationships, permissions, etc.)
   */
  private parseEntityMembers(yamlAst: Record<string, unknown>): any[] {
    const members: any[] = []

    // Parse fields
    if (Array.isArray(yamlAst.field)) {
      for (const field of yamlAst.field) {
        members.push({
          type: 'field',
          data: field,
        })
      }
    }

    // Parse relationships
    if (Array.isArray(yamlAst.relationship)) {
      for (const rel of yamlAst.relationship) {
        members.push({
          type: 'relationship',
          data: rel,
        })
      }
    }

    // Parse permissions
    if (Array.isArray(yamlAst.permission)) {
      for (const perm of yamlAst.permission) {
        members.push({
          type: 'permission',
          data: perm,
        })
      }
    }

    // Parse workflows
    if (Array.isArray(yamlAst.workflow)) {
      for (const wf of yamlAst.workflow) {
        members.push({
          type: 'workflow',
          data: wf,
        })
      }
    }

    // Parse automations
    if (Array.isArray(yamlAst.automation)) {
      for (const auto of yamlAst.automation) {
        members.push({
          type: 'automation',
          data: auto,
        })
      }
    }

    return members
  }

  /**
   * Parse workflow definition from YAML
   */
  private parseWorkflowDefinition(
    yamlAst: Record<string, unknown>
  ): WorkflowDefinitionNode | null {
    const name = String(yamlAst.workflow)

    if (!name) {
      this.addError('Workflow must have a name', this.currentLine)
      return null
    }

    return {
      type: 'workflow',
      name,
      states: this.parseWorkflowStates(yamlAst),
      transitions: this.parseWorkflowTransitions(yamlAst),
      location: {
        file: this.currentFile,
        line: this.currentLine,
        column: 0,
      },
    }
  }

  /**
   * Parse workflow states
   */
  private parseWorkflowStates(yamlAst: Record<string, unknown>): any[] {
    const states: any[] = []

    if (Array.isArray(yamlAst.state)) {
      for (const state of yamlAst.state) {
        states.push({
          type: 'state',
          name: state,
          attributes: {},
          location: {
            file: this.currentFile,
            line: this.currentLine,
            column: 0,
          },
        })
      }
    }

    return states
  }

  /**
   * Parse workflow transitions
   */
  private parseWorkflowTransitions(yamlAst: Record<string, unknown>): any[] {
    const transitions: any[] = []

    // Parse from → to style transitions
    if (typeof yamlAst.transitions === 'string') {
      const transStr = yamlAst.transitions
      const parts = transStr.split('→').map((p: string) => p.trim())

      for (let i = 0; i < parts.length - 1; i++) {
        transitions.push({
          type: 'transition',
          from: parts[i],
          to: parts[i + 1],
          attributes: {},
          location: {
            file: this.currentFile,
            line: this.currentLine,
            column: 0,
          },
        })
      }
    }

    return transitions
  }

  /**
   * Add parse error
   */
  private addError(message: string, line: number): void {
    this.errors.push({
      code: 'PARSE_ERROR',
      message,
      location: {
        file: this.currentFile,
        line,
        column: 0,
      },
      severity: 'error',
    })
  }
}

/**
 * Parse multiple ODL files
 */
export async function parseODLFiles(
  files: Array<{ filename: string; source: string }>
): Promise<{
  documents: ODLDocument[]
  errors: CompileError[]
}> {
  const parser = new ODLParser()
  const documents: ODLDocument[] = []
  const allErrors: CompileError[] = []

  for (const file of files) {
    const { ast, errors } = parser.parse(file.source, file.filename)

    if (ast) {
      documents.push(ast)
    }

    allErrors.push(...errors)
  }

  return { documents, errors: allErrors }
}
