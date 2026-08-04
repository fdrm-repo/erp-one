/**
 * ONE Platform - Enterprise Kernel Exports
 * 
 * Central export point for all kernel services and utilities
 */

// Kernel Core
export { Kernel, getKernel, disposeKernel } from './kernel'
export type { IKernel } from '@/types/kernel'

// Service Container
export { ServiceContainer } from './service-container'
export type { IServiceContainer, ServiceDescriptor } from '@/types/kernel'

// Configuration Engine
export { ConfigurationEngine } from './configuration-engine'
export type { IConfigurationEngine, ConfigLayer, ConfigValue } from '@/types/kernel'

// Context Service
export { ContextService } from './context-service'
export type { IContextService, RuntimeContext } from '@/types/kernel'

// Lifecycle Manager
export { LifecycleManager } from './lifecycle-manager'
export type { ILifecycleManager, ModuleMetadata, ModuleState } from '@/types/kernel'

// Dependency Resolver
export { DependencyResolver } from './dependency-resolver'
export type { IDependencyResolver, DependencyGraph } from '@/types/kernel'

// Stub Services
export {
  FeatureFlagEngine,
  CacheManager,
  SchedulerEngine,
  JobQueue,
  TransactionManager,
  AuditEngine,
  HealthMonitor,
  TelemetryEngine,
  LoggingEngine,
  ErrorEngine,
  EventPipeline,
  PluginManager,
  KernelDiagnostics,
  BootLoader,
} from './stub-services'

export type {
  IFeatureFlagEngine,
  ICacheManager,
  ISchedulerEngine,
  IJobQueue,
  ITransactionManager,
  IAuditEngine,
  IHealthMonitor,
  ITelemetryEngine,
  ILoggingEngine,
  IErrorEngine,
  IEventPipeline,
  IPluginManager,
  IKernelDiagnostics,
  IBootLoader,
} from '@/types/kernel'

// All Types
export type {
  FeatureFlag,
  ScheduledTask,
  Job,
  Transaction,
  AuditRecord,
  HealthCheck,
  LogEntry,
  PlatformEvent,
  IPlugin,
  BootSequence,
  KernelStatus,
} from '@/types/kernel'
