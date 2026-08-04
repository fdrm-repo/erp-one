/**
 * ONE Definition Language (ODL) Type System
 * 
 * ODL is the source of truth for defining business applications.
 * These types represent ODL constructs at compile time.
 */

// ============================================================================
// Field Types
// ============================================================================

export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'richtext'
  | 'json'
  | 'file'
  | 'image'
  | 'choice'
  | 'multiChoice'
  | 'reference'
  | 'hasMany'
  | 'manyToMany'

export interface FieldDefinition {
  name: string
  type: FieldType
  label?: string
  description?: string
  required?: boolean
  unique?: boolean
  default?: unknown
  validation?: FieldValidation
  directives?: Record<string, unknown>
  version?: string
  deprecated?: boolean
}

export interface FieldValidation {
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  custom?: string[]
}

// ============================================================================
// Entity Definition
// ============================================================================

export interface EntityDefinition {
  name: string
  label?: string
  description?: string
  version?: string
  deprecated?: boolean

  fields: FieldDefinition[]
  relationships: RelationshipDefinition[]

  permissions: PermissionDefinition[]
  workflows: WorkflowDefinition[]
  automations: AutomationDefinition[]
  dashboards: DashboardDefinition[]
  reports: ReportDefinition[]
  templates: TemplateDefinition[]

  directives?: Record<string, unknown>
}

// ============================================================================
// Relationships
// ============================================================================

export interface RelationshipDefinition {
  name: string
  type: 'hasMany' | 'manyToMany' | 'belongsTo'
  target: string // Entity name
  label?: string
  inverse?: string
  cascade?: boolean
}

// ============================================================================
// Permissions
// ============================================================================

export type PermissionAction = 'read' | 'write' | 'delete' | 'approve' | 'execute'

export interface PermissionDefinition {
  name?: string
  entity: string
  action: PermissionAction
  field?: string
  roles: string[]
  condition?: string
}

// ============================================================================
// Workflows
// ============================================================================

export interface WorkflowDefinition {
  name: string
  label?: string
  description?: string

  states: WorkflowStateDefinition[]
  transitions: WorkflowTransitionDefinition[]
  permissions: WorkflowPermissionDefinition[]
}

export interface WorkflowStateDefinition {
  name: string
  label?: string
  description?: string
  transitions: string[]
}

export interface WorkflowTransitionDefinition {
  from: string
  to: string
  label?: string
  condition?: string
  actions?: string[]
}

export interface WorkflowPermissionDefinition {
  from: string
  to: string
  roles: string[]
}

// ============================================================================
// Automations
// ============================================================================

export interface AutomationDefinition {
  name: string
  label?: string
  description?: string

  trigger: AutomationTrigger
  conditions?: AutomationCondition[]
  actions: AutomationAction[]
  enabled?: boolean
}

export interface AutomationTrigger {
  type: 'created' | 'updated' | 'deleted' | 'state_changed' | 'scheduled'
  entity: string
  field?: string
  from?: string
  to?: string
  schedule?: string
}

export interface AutomationCondition {
  field: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in'
  value: unknown
}

export interface AutomationAction {
  type: string
  params?: Record<string, unknown>
}

// ============================================================================
// Dashboards
// ============================================================================

export interface DashboardDefinition {
  name: string
  label?: string
  description?: string

  widgets: DashboardWidgetDefinition[]
}

export interface DashboardWidgetDefinition {
  name: string
  type: 'chart' | 'table' | 'metric' | 'list' | 'timeline'
  label?: string
  entity?: string
  metric?: string
  dimensions?: string[]
  filters?: string[]
  limit?: number
}

// ============================================================================
// Reports
// ============================================================================

export interface ReportDefinition {
  name: string
  label?: string
  description?: string

  entity: string
  groupBy?: string[]
  aggregations: ReportAggregation[]
  filters?: ReportFilter[]
  sorts?: ReportSort[]
  exports?: ('pdf' | 'excel' | 'csv')[]
}

export interface ReportAggregation {
  field: string
  type: 'sum' | 'avg' | 'min' | 'max' | 'count'
}

export interface ReportFilter {
  field: string
  operator: string
  value: unknown
}

export interface ReportSort {
  field: string
  direction: 'asc' | 'desc'
}

// ============================================================================
// Templates
// ============================================================================

export interface TemplateDefinition {
  name: string
  label?: string
  type: 'workspace' | 'dashboard' | 'form' | 'report'
  sections: TemplateSection[]
}

export interface TemplateSection {
  name: string
  label?: string
  columns?: number
  fields?: string[]
  relationships?: string[]
  widgets?: string[]
}

// ============================================================================
// Compilation Output (Metadata Graph)
// ============================================================================

export interface MetadataGraph {
  entities: Map<string, CompiledEntity>
  relationships: Map<string, CompiledRelationship>
  workflows: Map<string, CompiledWorkflow>
  permissions: Map<string, CompiledPermission>
  automations: Map<string, CompiledAutomation>
  dashboards: Map<string, CompiledDashboard>
  dependencyGraph: DependencyGraph
  typeDefinitions: TypeDefinition[]
}

export interface CompiledEntity {
  name: string
  fields: Map<string, CompiledField>
  relationships: Map<string, CompiledRelationship>
  permissions: PermissionDefinition[]
  workflows: WorkflowDefinition[]
  automations: AutomationDefinition[]
}

export interface CompiledField {
  name: string
  type: FieldType
  label?: string
  required: boolean
  unique: boolean
  validation?: FieldValidation
}

export interface CompiledRelationship {
  name: string
  from: string
  to: string
  type: 'hasMany' | 'manyToMany' | 'belongsTo'
}

export interface CompiledWorkflow {
  name: string
  entity: string
  states: Map<string, WorkflowStateDefinition>
  transitions: WorkflowTransitionDefinition[]
}

export interface CompiledPermission {
  name?: string
  entity: string
  action: PermissionAction
  field?: string
  roles: string[]
}

export interface CompiledAutomation {
  name: string
  entity: string
  trigger: AutomationTrigger
  actions: AutomationAction[]
}

export interface CompiledDashboard {
  name: string
  widgets: DashboardWidgetDefinition[]
}

// ============================================================================
// Dependency Graph
// ============================================================================

export interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
  cycles: DependencyNode[][]
}

export interface DependencyNode {
  id: string
  type: 'entity' | 'workflow' | 'automation' | 'dashboard'
  name: string
}

export interface DependencyEdge {
  from: string
  to: string
  type: 'references' | 'relates' | 'triggers' | 'depends_on'
}

// ============================================================================
// Type Generation Output
// ============================================================================

export interface TypeDefinition {
  name: string
  kind: 'interface' | 'type' | 'enum'
  fields: TypeField[]
  description?: string
}

export interface TypeField {
  name: string
  type: string
  optional: boolean
  description?: string
}

// ============================================================================
// Compiler Errors
// ============================================================================

export interface CompileError {
  code: string
  message: string
  location: {
    file: string
    line: number
    column: number
  }
  severity: 'error' | 'warning'
}

// ============================================================================
// AST (Abstract Syntax Tree)
// ============================================================================

export interface ODLDocument {
  definitions: Definition[]
}

export type Definition =
  | EntityDefinitionNode
  | WorkflowDefinitionNode
  | PermissionDefinitionNode
  | AutomationDefinitionNode
  | DashboardDefinitionNode
  | ReportDefinitionNode

export interface ASTNode {
  type: string
  location: {
    file: string
    line: number
    column: number
  }
}

export interface EntityDefinitionNode extends ASTNode {
  type: 'entity'
  name: string
  attributes: Record<string, unknown>
  members: ASTNode[]
}

export interface WorkflowDefinitionNode extends ASTNode {
  type: 'workflow'
  name: string
  states: StateNode[]
  transitions: TransitionNode[]
}

export interface StateNode extends ASTNode {
  type: 'state'
  name: string
  attributes: Record<string, unknown>
}

export interface TransitionNode extends ASTNode {
  type: 'transition'
  from: string
  to: string
  attributes: Record<string, unknown>
}

export interface PermissionDefinitionNode extends ASTNode {
  type: 'permission'
  attributes: Record<string, unknown>
}

export interface AutomationDefinitionNode extends ASTNode {
  type: 'automation'
  attributes: Record<string, unknown>
}

export interface DashboardDefinitionNode extends ASTNode {
  type: 'dashboard'
  attributes: Record<string, unknown>
}

export interface ReportDefinitionNode extends ASTNode {
  type: 'report'
  attributes: Record<string, unknown>
}
