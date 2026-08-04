/**
 * ONE Platform - Enterprise Kernel
 * 
 * The Kernel is the foundational layer that orchestrates all platform services.
 * It is completely independent of business logic, UI, and persistence.
 * 
 * The Kernel never knows:
 * - Business concepts (Customer, Invoice, Shipment, etc.)
 * - UI frameworks (React, Vue, Angular, etc.)
 * - Database systems (PostgreSQL, MongoDB, etc.)
 * - Infrastructure details (AWS, Azure, GCP, etc.)
 * 
 * The Kernel only orchestrates platform services and manages lifecycle.
 */

import type { IKernel, KernelStatus, BootPhase } from '@/types/kernel'
import { ServiceContainer } from './service-container'
import { ConfigurationEngine } from './configuration-engine'
import { ContextService } from './context-service'
import { LifecycleManager } from './lifecycle-manager'
import { DependencyResolver } from './dependency-resolver'
import { FeatureFlagEngine } from './feature-flag-engine'
import { CacheManager } from './cache-manager'
import { SchedulerEngine } from './scheduler-engine'
import { JobQueue } from './job-queue'
import { TransactionManager } from './transaction-manager'
import { AuditEngine } from './audit-engine'
import { HealthMonitor } from './health-monitor'
import { TelemetryEngine } from './telemetry-engine'
import { LoggingEngine } from './logging-engine'
import { ErrorEngine } from './error-engine'
import { EventPipeline } from './event-pipeline'
import { PluginManager } from './plugin-manager'
import { KernelDiagnostics } from './kernel-diagnostics'
import { BootLoader } from './boot-loader'

export class Kernel implements IKernel {
  // Core Services
  container: ServiceContainer
  config: ConfigurationEngine
  context: ContextService
  lifecycle: LifecycleManager
  dependency: DependencyResolver
  features: FeatureFlagEngine
  cache: CacheManager
  scheduler: SchedulerEngine
  queue: JobQueue
  transaction: TransactionManager
  audit: AuditEngine
  health: HealthMonitor
  telemetry: TelemetryEngine
  logging: LoggingEngine
  error: ErrorEngine
  events: EventPipeline
  plugins: PluginManager
  diagnostics: KernelDiagnostics
  boot: BootLoader

  private state: 'created' | 'booting' | 'ready' | 'degraded' | 'shutdown' = 'created'
  private startTime: Date = new Date()

  constructor() {
    console.info('[Kernel] Initializing ONE Platform Enterprise Kernel')

    // Initialize core services
    this.container = new ServiceContainer()
    this.config = new ConfigurationEngine()
    this.context = new ContextService()
    this.lifecycle = new LifecycleManager()
    this.dependency = new DependencyResolver()
    this.features = new FeatureFlagEngine()
    this.cache = new CacheManager()
    this.scheduler = new SchedulerEngine()
    this.queue = new JobQueue()
    this.transaction = new TransactionManager()
    this.audit = new AuditEngine()
    this.health = new HealthMonitor()
    this.telemetry = new TelemetryEngine()
    this.logging = new LoggingEngine()
    this.error = new ErrorEngine()
    this.events = new EventPipeline()
    this.plugins = new PluginManager()
    this.diagnostics = new KernelDiagnostics()
    this.boot = new BootLoader(this)

    this.registerKernelServices()

    console.debug('[Kernel] Kernel initialized', {
      services: this.container.getStats(),
    })
  }

  /**
   * Register all kernel services in the container
   */
  private registerKernelServices(): void {
    this.container.register('kernel', {
      id: 'kernel',
      factory: () => this,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('config', {
      id: 'config',
      factory: () => this.config,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('context', {
      id: 'context',
      factory: () => this.context,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('lifecycle', {
      id: 'lifecycle',
      factory: () => this.lifecycle,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('dependency', {
      id: 'dependency',
      factory: () => this.dependency,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('features', {
      id: 'features',
      factory: () => this.features,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('cache', {
      id: 'cache',
      factory: () => this.cache,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('scheduler', {
      id: 'scheduler',
      factory: () => this.scheduler,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('queue', {
      id: 'queue',
      factory: () => this.queue,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('transaction', {
      id: 'transaction',
      factory: () => this.transaction,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('audit', {
      id: 'audit',
      factory: () => this.audit,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('health', {
      id: 'health',
      factory: () => this.health,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('telemetry', {
      id: 'telemetry',
      factory: () => this.telemetry,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('logging', {
      id: 'logging',
      factory: () => this.logging,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('error', {
      id: 'error',
      factory: () => this.error,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('events', {
      id: 'events',
      factory: () => this.events,
      lifetime: 'singleton',
      dependencies: [],
    })

    this.container.register('plugins', {
      id: 'plugins',
      factory: () => this.plugins,
      lifetime: 'singleton',
      dependencies: [],
    })
  }

  /**
   * Start the kernel
   */
  async start(): Promise<void> {
    if (this.state !== 'created') {
      throw new Error(`[Kernel] Cannot start kernel in state: ${this.state}`)
    }

    this.state = 'booting'
    console.info('[Kernel] Starting Platform Kernel')

    try {
      await this.boot.start()
      this.state = 'ready'
      console.info('[Kernel] Kernel started successfully', {
        uptime: this.getUptime(),
      })
    } catch (error) {
      this.state = 'degraded'
      console.error('[Kernel] Kernel failed to start', error)
      throw error
    }
  }

  /**
   * Stop the kernel
   */
  async stop(): Promise<void> {
    if (this.state === 'shutdown') {
      return
    }

    console.info('[Kernel] Stopping Platform Kernel')
    this.state = 'shutdown'

    try {
      // Stop scheduler and queue
      await this.scheduler.stop()
      await this.queue.dispose()

      // Dispose all services in reverse order
      const services = [
        this.audit,
        this.telemetry,
        this.logging,
        this.error,
        this.events,
        this.plugins,
        this.transaction,
        this.health,
        this.cache,
        this.features,
        this.dependency,
        this.lifecycle,
        this.context,
        this.config,
        this.container,
      ]

      for (const service of services) {
        try {
          await service.dispose()
        } catch (error) {
          console.error('[Kernel] Error disposing service', error)
        }
      }

      console.info('[Kernel] Kernel stopped successfully')
    } catch (error) {
      console.error('[Kernel] Error stopping kernel', error)
      throw error
    }
  }

  /**
   * Restart the kernel
   */
  async restart(): Promise<void> {
    console.info('[Kernel] Restarting Platform Kernel')
    await this.stop()

    // Reset state
    this.state = 'created'
    this.startTime = new Date()

    await this.start()
  }

  /**
   * Get kernel status
   */
  getStatus(): KernelStatus {
    return {
      state: this.state,
      uptime: this.getUptime(),
      version: '1.0.0',
    }
  }

  /**
   * Get kernel uptime in milliseconds
   */
  private getUptime(): number {
    return Date.now() - this.startTime.getTime()
  }

  /**
   * Dispose the kernel
   */
  async dispose(): Promise<void> {
    await this.stop()
  }
}

/**
 * Global kernel instance
 */
let globalKernel: Kernel | null = null

/**
 * Get or create the global kernel instance
 */
export function getKernel(): Kernel {
  if (!globalKernel) {
    globalKernel = new Kernel()
  }
  return globalKernel
}

/**
 * Dispose the global kernel instance
 */
export async function disposeKernel(): Promise<void> {
  if (globalKernel) {
    await globalKernel.dispose()
    globalKernel = null
  }
}
