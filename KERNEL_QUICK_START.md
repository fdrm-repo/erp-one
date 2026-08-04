# Enterprise Kernel - Quick Start Guide

## Initialize the Kernel

```typescript
import { getKernel } from '@/kernel';

const kernel = getKernel();
await kernel.start();
```

## Use Core Services

### Configuration Engine
```typescript
// Get configuration
const enabled = kernel.config.get('features.newUI', false);

// Set configuration
kernel.config.set('features.newUI', true, 'tenant');

// Listen for changes
kernel.config.listen('features.*', (key, value) => {
  console.log(`${key} changed to ${value}`);
});
```

### Runtime Context
```typescript
// Create context
const context = kernel.context.create({
  tenantId: 'tenant-123',
  userId: 'user-456',
  roles: ['admin'],
});

// Use context
if (kernel.context.has('delete')) {
  // User can delete
}

// Check feature
if (kernel.context.isFeatureEnabled('newUI')) {
  // Use new UI
}
```

### Service Container
```typescript
// Resolve service from container
const myService = kernel.container.resolve<MyService>('myService');

// Register service
kernel.container.register('myService', {
  id: 'myService',
  factory: (container) => new MyService(container),
  lifetime: 'singleton',
  dependencies: [],
});
```

### Lifecycle Manager
```typescript
// Register module
kernel.lifecycle.register({
  id: 'crm',
  name: 'CRM Module',
  version: '1.0.0',
  dependencies: [],
  lifecycle: {
    install: async () => { /* setup */ },
    start: async () => { /* initialize */ },
    stop: async () => { /* cleanup */ },
  },
});

// Control module
await kernel.lifecycle.install('crm');
await kernel.lifecycle.start('crm');
```

### Dependency Resolver
```typescript
// Resolve dependencies
const order = await kernel.dependency.resolve('freight');
// Returns: ['crm', 'finance', 'freight']

// Check for circular dependencies
const cycles = kernel.dependency.detectCycles();
```

### Feature Flags
```typescript
// Check if feature enabled
if (kernel.features.isEnabled('newDashboard')) {
  // Use new dashboard
}

// Enable feature for tenant
kernel.features.enable('newDashboard', 'tenant', 'tenant-123');
```

### Cache Manager
```typescript
// Set cache
kernel.cache.set('user:123', userData, 3600, ['users']);

// Get from cache
const data = kernel.cache.get('user:123');

// Invalidate by tag
kernel.cache.deleteByTag('users');
```

### Job Queue
```typescript
// Enqueue job
const jobId = await kernel.queue.enqueue('send-email', {
  to: 'user@example.com',
  subject: 'Welcome',
}, 'normal');

// Mark completed
await kernel.queue.markCompleted(jobId);
```

### Event Pipeline
```typescript
// Listen to events
kernel.events.on('module:installed', async (event) => {
  console.log(`Module installed: ${event.data.moduleId}`);
});

// Emit event
await kernel.events.emit('module:installed', {
  moduleId: 'crm',
  version: '1.0.0',
});
```

### Audit Engine
```typescript
// Log audit record
await kernel.audit.log({
  userId: 'user-123',
  action: 'update',
  entity: 'entity',
  entityId: 'customer-456',
  changes: {
    email: { old: 'old@example.com', new: 'new@example.com' },
  },
  context: kernel.context.current(),
});

// Query audit trail
const records = await kernel.audit.query({
  entity: 'entity',
  entityId: 'customer-456',
});
```

### Logging Engine
```typescript
// Log messages
kernel.logging.info('User logged in', { userId: 'user-123' });
kernel.logging.error('Database error', new Error('Connection failed'));

// Query logs
const logs = kernel.logging.query({
  level: 'error',
  from: new Date('2024-01-01'),
});
```

## Shutdown

```typescript
await kernel.stop();
```

## Best Practices

1. **Always resolve services through container**
   ```typescript
   // ✓ Correct
   const service = kernel.container.resolve('myService');

   // ✗ Wrong
   const service = new MyService();
   ```

2. **Declare dependencies in module metadata**
   ```typescript
   {
     id: 'freight',
     dependencies: ['crm', 'finance'],
   }
   ```

3. **Use runtime context for user information**
   ```typescript
   // ✓ Correct
   const userId = kernel.context.current().userId;

   // ✗ Wrong
   const userId = getUserFromRequest();
   ```

4. **Always use Kernel services for operations**
   ```typescript
   // ✓ Correct - Audited
   await kernel.audit.log({ action: 'delete', ... });

   // ✗ Wrong - Not audited
   console.log('User deleted');
   ```

5. **Respect module lifecycle states**
   ```typescript
   // States: installing → installed → starting → running → stopping → stopped

   // Always start after installing
   await kernel.lifecycle.install('module');
   await kernel.lifecycle.start('module');
   ```

## Common Patterns

### Creating Scoped Container
```typescript
const scope = kernel.container.createScope('request-123');
const service = scope.resolve('myService');
await scope.dispose();
```

### Executing Within Context
```typescript
await kernel.context.withContext(customContext, async () => {
  // Operations here use customContext
  const userId = kernel.context.current().userId;
});
```

### Handling Errors
```typescript
try {
  // Some operation
} catch (error) {
  const platformError = kernel.error.handle(error);
  console.error(`[${platformError.code}] ${platformError.message}`);
}
```

### Scheduling Tasks
```typescript
kernel.scheduler.register({
  id: 'sync-crm',
  name: 'Sync CRM Data',
  schedule: '0 */6 * * *', // Every 6 hours
  handler: async () => {
    // Sync logic
  },
});

await kernel.scheduler.start();
```

## Diagnostics

```typescript
// Get kernel status
const status = kernel.getStatus();

// Export diagnostics
const diagnostics = kernel.diagnostics.exportDiagnostics();

// Get dependency graph
const graph = kernel.diagnostics.getDependencyGraph();

// Get service status
const serviceStatus = kernel.diagnostics.getServiceStatus('cache');
```

## Configuration Layers

```typescript
// Environment variables (highest priority)
process.env.FEATURE_NEW_UI = 'true';

// Tenant configuration
kernel.config.set('features.newUI', true, 'tenant');

// Company configuration
kernel.config.set('features.newUI', true, 'company');

// Module defaults
kernel.config.set('features.newUI', false, 'module');

// Runtime settings
kernel.config.set('features.newUI', false, 'runtime');

// Query merged configuration (uses highest priority)
const enabled = kernel.config.get('features.newUI');
// Returns: true (from tenant or environment)
```

## Module Lifecycle

States and transitions:

```
installing → installed → starting → running
                                      ↓
                                  (error)
                                      ↓
                                    failed
                                      ↓
                                   (retry)
                                      ↓
                                   running

running → stopping → stopped

running/installed/stopped → updating → installed

any state → uninstalling → (removed)

any state → disabled
```

## Feature Flags

```typescript
// Register flag
kernel.features.register({
  id: 'newDashboard',
  enabled: false,
  scope: 'tenant',
  rolloutPercentage: 50,
});

// Enable for specific scope
kernel.features.enable('newDashboard', 'tenant', 'tenant-123');
kernel.features.enable('newDashboard', 'user', 'user-456');

// Disable feature
kernel.features.disable('newDashboard', 'tenant', 'tenant-123');

// Check if enabled
if (kernel.features.isEnabled('newDashboard')) {
  // Use new dashboard
}
```

## Next Steps

- Read `KERNEL_ARCHITECTURE.md` for detailed service documentation
- Review `PHASE_2_KERNEL_COMPLETE.md` for implementation details
- Start building Rendering Engines for Phase 3
- Install modules through the kernel
