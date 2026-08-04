/**
 * ONE Platform - Enterprise Kernel Type Definitions
 * 
 * The Kernel is the foundational layer that orchestrates all platform services.
 * It is completely independent of business logic, UI, and persistence.
 * 
 * The Kernel only knows:
 * - Service lifecycle
 * - Dependency resolution
 * - Configuration management
 * - Event orchestration
 * - Runtime context
 * - Health and diagnostics
 */

// ============================================================================
// Service Container & Dependency Injection
// ============================================================================

export interface ServiceDescriptor {
  id: string
  factory: (container: IServiceContainer) => any
  lifetime: 'singleton' | 'transient' | 'scoped'
  dependencies: string[]
}

export interface IServiceContainer {
  register(id: string, descriptor: ServiceDescriptor): void
  resolve<T>(id: string): T
  resolveAll<T>(id: string): T[]
  has(id: string): boolean
  dispose(): Promise<void>
}

// ============================================================================
// Configuration Engine
// ============================================================================

export type ConfigLayer =
  | 'environment'
  | 'tenant'
  | 'company'
  | 'module'
  | 'user'
  | 'runtime'

export interface ConfigValue {
  value: any
  layer: ConfigLayer
  timestamp: Date
}

export interface IConfigurationEngine {
  get<T>(key: string, defaultValue?: T): T
  set(key: string, value: any, layer: ConfigLayer): void
  merge(config: Record<string, any>, layer: ConfigLayer): void
  listen(pattern: string, callback: (key: string, value: any) => void): void
  getAll(): Record<string, ConfigValue>
  dispose(): Promise<void>
}

// ============================================================================
// Runtime Context
// ============================================================================

export interface RuntimeContext {
  tenantId: string
  companyId?: string
  branchId?: string
  departmentId?: string
  userId: string
  sessionId: string
  locale: string
  currency: string
  timezone: string
  permissions: Set<string>
  roles: string[]
  features: Map<string, boolean>
  theme: string
  language: string
  metadata: Map<string, any>
}

export interface IContextService {
  current(): RuntimeContext
  create(config: Partial<RuntimeContext>): RuntimeContext
  set(key: keyof RuntimeContext, value: any): void
  get<T>(key: keyof RuntimeContext): T
  has(permission: string): boolean
  isFeatureEnabled(feature: string): boolean
  dispose(): Promise<void>
}

// ============================================================================
// Module Lifecycle
// ============================================================================

export type ModuleState =
  | 'installing'
  | 'installed'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'updating'
  | 'uninstalling'
  | 'disabled'
  | 'failed'

export interface IModuleLifecycle {
  install(): Promise<void>
  start(): Promise<void>
  stop(): Promise<void>
  uninstall(): Promise<void>
  update(): Promise<void>
  getState(): ModuleState
  onStateChange(callback: (state: ModuleState) => void): void
}

export interface ModuleMetadata {
  id: string
  name: string
  version: string
  dependencies: string[]
  lifecycle?: IModuleLifecycle
  state?: ModuleState
}

export interface ILifecycleManager {
  register(module: ModuleMetadata): void
  install(moduleId: string): Promise<void>
  start(moduleId: string): Promise<void>
  stop(moduleId: string): Promise<void>
  uninstall(moduleId: string): Promise<void>
  getState(moduleId: string): ModuleState
  dispose(): Promise<void>
}

// ============================================================================
// Dependency Resolution
// ============================================================================

export interface DependencyGraph {
  modules: Map<string, ModuleMetadata>
  graph: Map<string, Set<string>>
}

export interface IDependencyResolver {
  resolve(moduleId: string): Promise<string[]>
  getGraph(): DependencyGraph
  detectCycles(): string[][]
  validateDependencies(moduleId: string): boolean
}

// ============================================================================
// Feature Flags
// ============================================================================

export type FlagScope = 'tenant' | 'company' | 'user' | 'environment' | 'runtime'

export interface FeatureFlag {
  id: string
  name: string
  enabled: boolean
  scope: FlagScope
  scopeId?: string
  rolloutPercentage?: number
}

export interface IFeatureFlagEngine {
  register(flag: FeatureFlag): void
  isEnabled(flagId: string, scopeId?: string): boolean
  enable(flagId: string, scope: FlagScope, scopeId?: string): void
  disable(flagId: string, scope: FlagScope, scopeId?: string): void
  list(): FeatureFlag[]
  dispose(): Promise<void>
}

// ============================================================================
// Cache Management
// ============================================================================

export type CacheStrategy = 'memory' | 'redis' | 'distributed' | 'edge'

export interface CacheEntry<T> {
  value: T
  expiresAt?: Date
  tags?: string[]
}

export interface ICacheManager {
  get<T>(key: string): T | undefined
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): void
  has(key: string): boolean
  delete(key: string): void
  deleteByTag(tag: string): void
  clear(): void
  getStats(): CacheStats
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  entries: number
}

// ============================================================================
// Scheduling
// ============================================================================

export interface ScheduledTask {
  id: string
  name: string
  schedule: string
  handler: () => Promise<void>
  timezone?: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

export interface ISchedulerEngine {
  register(task: ScheduledTask): void
  unregister(taskId: string): void
  start(): Promise<void>
  stop(): Promise<void>
  trigger(taskId: string): Promise<void>
  list(): ScheduledTask[]
  dispose(): Promise<void>
}

// ============================================================================
// Job Queue
// ============================================================================

export type JobPriority = 'low' | 'normal' | 'high' | 'critical'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying'

export interface Job<T = any> {
  id: string
  type: string
  data: T
  priority: JobPriority
  status: JobStatus
  retries: number
  maxRetries: number
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
  error?: string
}

export interface IJobQueue {
  enqueue<T>(type: string, data: T, priority?: JobPriority): Promise<string>
  dequeue<T>(type: string): Promise<Job<T> | undefined>
  getJob<T>(jobId: string): Promise<Job<T> | undefined>
  markCompleted(jobId: string): Promise<void>
  markFailed(jobId: string, error: string): Promise<void>
  retry(jobId: string): Promise<void>
  getStats(): QueueStats
  dispose(): Promise<void>
}

export interface QueueStats {
  pending: number
  processing: number
  completed: number
  failed: number
  deadLetter: number
}

// ============================================================================
// Transaction Management
// ============================================================================

export type TransactionIsolation = 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable'

export interface Transaction {
  id: string
  state: 'active' | 'committed' | 'rolled-back'
  isolation: TransactionIsolation
  operations: any[]
}

export interface ITransactionManager {
  begin(isolation?: TransactionIsolation): Promise<Transaction>
  commit(transactionId: string): Promise<void>
  rollback(transactionId: string): Promise<void>
  current(): Transaction | undefined
  execute<T>(operation: () => Promise<T>, isolation?: TransactionIsolation): Promise<T>
  dispose(): Promise<void>
}

// ============================================================================
// Audit Engine
// ============================================================================

export type AuditableEntity = 'entity' | 'field' | 'workflow' | 'permission' | 'api' | 'configuration' | 'login' | 'system'

export interface AuditRecord {
  id: string
  timestamp: Date
  userId: string
  action: string
  entity: AuditableEntity
  entityId: string
  changes: Record<string, { old: any; new: any }>
  context: RuntimeContext
}

export interface IAuditEngine {
  log(record: Omit<AuditRecord, 'id' | 'timestamp'>): Promise<void>
  query(filters: AuditQueryFilter): Promise<AuditRecord[]>
  getHistory(entity: AuditableEntity, entityId: string): Promise<AuditRecord[]>
  dispose(): Promise<void>
}

export interface AuditQueryFilter {
  userId?: string
  entity?: AuditableEntity
  entityId?: string
  action?: string
  from?: Date
  to?: Date
  limit?: number
}

// ============================================================================
// Health Monitoring
// ============================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export interface HealthCheck {
  name: string
  status: HealthStatus
  details?: Record<string, any>
  timestamp: Date
}

export interface IHealthMonitor {
  register(checkId: string, check: () => Promise<HealthCheck>): void
  check(checkId?: string): Promise<HealthCheck[]>
  getStatus(): HealthStatus
  getMetrics(): HealthMetrics
  dispose(): Promise<void>
}

export interface HealthMetrics {
  cpu: number
  memory: number
  uptime: number
  requestCount: number
  errorCount: number
  averageLatency: number
}

// ============================================================================
// Telemetry Engine
// ============================================================================

export interface Telemetry {
  timestamp: Date
  metric: string
  value: number
  tags: Record<string, string>
}

export interface ITelemetryEngine {
  record(metric: string, value: number, tags?: Record<string, string>): void
  query(metric: string, from: Date, to: Date): Telemetry[]
  getStatistics(): TelemetryStatistics
  dispose(): Promise<void>
}

export interface TelemetryStatistics {
  totalRequests: number
  totalErrors: number
  averageLatency: number
  slowQueries: number
  moduleMetrics: Record<string, any>
}

// ============================================================================
// Logging Engine
// ============================================================================

export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'fatal'

export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  context?: RuntimeContext
  metadata?: Record<string, any>
  error?: Error
}

export interface ILoggingEngine {
  log(level: LogLevel, message: string, metadata?: Record<string, any>): void
  trace(message: string, metadata?: Record<string, any>): void
  debug(message: string, metadata?: Record<string, any>): void
  info(message: string, metadata?: Record<string, any>): void
  warning(message: string, metadata?: Record<string, any>): void
  error(message: string, error?: Error, metadata?: Record<string, any>): void
  fatal(message: string, error?: Error, metadata?: Record<string, any>): void
  query(filters: LogQueryFilter): LogEntry[]
  dispose(): Promise<void>
}

export interface LogQueryFilter {
  level?: LogLevel
  from?: Date
  to?: Date
  message?: string
  limit?: number
}

// ============================================================================
// Error Engine
// ============================================================================

export type ErrorCategory =
  | 'validation'
  | 'permission'
  | 'workflow'
  | 'dependency'
  | 'runtime'
  | 'network'
  | 'module'
  | 'metadata'
  | 'transaction'
  | 'unknown'

export class PlatformError extends Error {
  category: ErrorCategory
  code: string
  statusCode: number
  context?: Record<string, any>

  constructor(
    message: string,
    category: ErrorCategory = 'unknown',
    code: string = 'PLATFORM_ERROR',
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message)
    this.category = category
    this.code = code
    this.statusCode = statusCode
    this.context = context
  }
}

export interface IErrorEngine {
  handle(error: Error): PlatformError
  register(handler: (error: PlatformError) => void): void
  dispose(): Promise<void>
}

// ============================================================================
// Event Pipeline
// ============================================================================

export interface EventMetadata {
  id: string
  timestamp: Date
  source: string
  priority: 'low' | 'normal' | 'high'
}

export interface PlatformEvent<T = any> {
  type: string
  data: T
  metadata: EventMetadata
}

export type EventMiddleware = (event: PlatformEvent) => Promise<boolean>
export type EventHandler<T = any> = (event: PlatformEvent<T>) => Promise<void>

export interface IEventPipeline {
  emit<T>(type: string, data: T, priority?: 'low' | 'normal' | 'high'): Promise<void>
  on<T>(type: string, handler: EventHandler<T>): void
  once<T>(type: string, handler: EventHandler<T>): void
  off<T>(type: string, handler: EventHandler<T>): void
  use(middleware: EventMiddleware): void
  getHistory(): PlatformEvent[]
  dispose(): Promise<void>
}

// ============================================================================
// Plugin Manager
// ============================================================================

export interface IPlugin {
  id: string
  name: string
  version: string
  install(): Promise<void>
  enable(): Promise<void>
  disable(): Promise<void>
  update(): Promise<void>
  validate(): Promise<boolean>
}

export interface IPluginManager {
  register(plugin: IPlugin): void
  install(pluginId: string): Promise<void>
  uninstall(pluginId: string): Promise<void>
  enable(pluginId: string): Promise<void>
  disable(pluginId: string): Promise<void>
  update(pluginId: string): Promise<void>
  list(): IPlugin[]
  dispose(): Promise<void>
}

// ============================================================================
// Kernel Diagnostics
// ============================================================================

export interface DependencyDiagram {
  nodes: Array<{ id: string; label: string; type: string }>
  edges: Array<{ from: string; to: string; label: string }>
}

export interface RuntimeTree {
  kernel: KernelStatus
  services: ServiceStatus[]
  modules: ModuleStatus[]
  diagnostics: DiagnosticInfo
}

export interface KernelStatus {
  state: 'booting' | 'ready' | 'degraded' | 'shutdown'
  uptime: number
  version: string
}

export interface ServiceStatus {
  id: string
  state: 'registered' | 'initialized' | 'running' | 'failed'
  dependencies: string[]
  metrics?: Record<string, any>
}

export interface ModuleStatus {
  id: string
  state: ModuleState
  dependencies: string[]
  version: string
}

export interface DiagnosticInfo {
  timestamp: Date
  environment: Record<string, any>
  performance: Record<string, any>
  errors: PlatformError[]
  warnings: string[]
}

export interface IKernelDiagnostics {
  getDependencyGraph(): DependencyDiagram
  getRuntimeTree(): RuntimeTree
  getServiceStatus(serviceId: string): ServiceStatus
  getModuleStatus(moduleId: string): ModuleStatus
  exportDiagnostics(): RuntimeTree
}

// ============================================================================
// Boot Loader
// ============================================================================

export type BootPhase =
  | 'kernel'
  | 'configuration'
  | 'container'
  | 'metadata-compiler'
  | 'module-discovery'
  | 'dependency-resolution'
  | 'registry'
  | 'runtime'
  | 'renderer'
  | 'application'

export interface BootSequence {
  phase: BootPhase
  status: 'pending' | 'running' | 'complete' | 'failed'
  duration: number
  error?: string
}

export interface IBootLoader {
  start(): Promise<void>
  getSequence(): BootSequence[]
  getCurrentPhase(): BootPhase
  dispose(): Promise<void>
}

// ============================================================================
// Kernel Interface
// ============================================================================

export interface IKernel {
  // Core services
  container: IServiceContainer
  config: IConfigurationEngine
  context: IContextService
  lifecycle: ILifecycleManager
  dependency: IDependencyResolver
  features: IFeatureFlagEngine
  cache: ICacheManager
  scheduler: ISchedulerEngine
  queue: IJobQueue
  transaction: ITransactionManager
  audit: IAuditEngine
  health: IHealthMonitor
  telemetry: ITelemetryEngine
  logging: ILoggingEngine
  error: IErrorEngine
  events: IEventPipeline
  plugins: IPluginManager
  diagnostics: IKernelDiagnostics
  boot: IBootLoader

  // Kernel operations
  start(): Promise<void>
  stop(): Promise<void>
  restart(): Promise<void>
  getStatus(): KernelStatus
  dispose(): Promise<void>
}
