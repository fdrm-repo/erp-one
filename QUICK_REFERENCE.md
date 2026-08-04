# ERP ONE - Quick Reference Guide

## Platform Overview

| Concept | Purpose | Status |
|---------|---------|--------|
| Metadata Registry | Store all schemas | ✓ Ready |
| Event Bus | Communicate events | ✓ Ready |
| Module Loader | Load/unload modules | ✓ Ready |
| Theme Engine | Manage themes | ✓ Ready |
| Auth Service | Manage permissions | ✓ Ready |
| Navigation Engine | Build navigation | ✓ Ready |
| Layout Engine | Render layouts | ✓ Ready |

## Import Paths

```typescript
// Core systems
import { metadataRegistry } from '@/core'
import { eventBus, SystemEvents } from '@/core'
import { themeEngine } from '@/core'
import { moduleLoader, type IModule } from '@/core'
import { authService } from '@/core'
import { navigationEngine } from '@/core'
import { layoutEngine } from '@/core'

// Types
import type {
  EntitySchema,
  FieldSchema,
  LayoutSchema,
  WorkflowSchema,
  PermissionSchema,
  ModuleManifest,
  NavigationSchema,
  ThemeConfig,
  PlatformContext
} from '@/types'

// Components
import PlatformShell from '@/components/platform-shell'
import PlatformInitializer from '@/components/platform-initializer'
```

## Quick Recipes

### 1. Register an Entity

```typescript
import { metadataRegistry } from '@/core'
import type { EntitySchema } from '@/types'

const customerEntity: EntitySchema = {
  id: 'schema-customer',
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  
  name: 'customer',
  label: 'Customer',
  module: 'crm',
  plural: 'customers',
  
  fields: [
    {
      id: 'field-name',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      name: 'name',
      label: 'Customer Name',
      type: 'text',
      required: true,
      readOnly: false,
      placeholder: 'Enter customer name'
    },
    {
      id: 'field-email',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      readOnly: false,
      validation: [
        { type: 'email', message: 'Must be a valid email' }
      ]
    }
  ],
  
  features: {
    audit: true,
    timeline: true,
    attachments: true,
    comments: true,
    approvals: false
  }
}

metadataRegistry.registerEntity(customerEntity)
```

### 2. Create a Form Layout

```typescript
import { metadataRegistry } from '@/core'
import type { LayoutSchema } from '@/types'

const customerFormLayout: LayoutSchema = {
  id: 'layout-customer-form',
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  
  name: 'form-create',
  entity: 'customer',
  type: 'form',
  
  sections: [
    {
      id: 'section-info',
      name: 'Customer Information',
      type: 'section',
      layout: 'single',
      fields: ['name', 'email']
    }
  ]
}

metadataRegistry.registerLayout(customerFormLayout)
```

### 3. Create a Module

```typescript
import type { IModule, EntitySchema, LayoutSchema } from '@/core'

const crmModule: IModule = {
  manifest: {
    id: 'manifest-crm',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    name: 'CRM',
    code: 'crm',
    description: 'Customer Relationship Management',
    author: 'Your Company',
    
    dependencies: [],
    entities: ['customer', 'opportunity', 'activity'],
    dashboards: ['crm-dashboard'],
    routes: ['/crm'],
    permissions: ['customer.read', 'customer.create'],
    workflows: [],
    
    features: {
      'multi-tenant': true,
      'approvals': false,
      'workflows': true
    }
  },
  
  initialize: async () => {
    console.log('[CRM] Initializing module')
    // Setup code here
  },
  
  destroy: async () => {
    console.log('[CRM] Destroying module')
    // Cleanup code here
  },
  
  getEntities: () => [
    // Return entity schemas
  ],
  
  getLayouts: () => [
    // Return layout schemas
  ],
  
  getNavigation: () => ({
    id: 'nav-crm',
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    
    module: 'crm',
    items: [
      {
        id: 'nav-crm-customers',
        label: 'Customers',
        path: '/crm/customers',
        icon: 'users'
      }
    ]
  })
}

// Load the module
import { moduleLoader } from '@/core'
await moduleLoader.loadModule('crm', crmModule)
```

### 4. Subscribe to Events

```typescript
import { eventBus, SystemEvents } from '@/core'

// Subscribe to entity creation
const unsubscribe = eventBus.subscribe(
  SystemEvents.ENTITY_CREATED,
  (payload) => {
    console.log('Entity created:', payload.entityId)
    // Handle event
  }
)

// Unsubscribe when done
unsubscribe()

// Subscribe once
eventBus.once(SystemEvents.MODULE_INSTALLED, (payload) => {
  console.log('Module installed:', payload.module)
})

// Emit event
await eventBus.emit(SystemEvents.ENTITY_CREATED, {
  entityId: 'customer-123',
  entity: 'customer'
})
```

### 5. Check Permissions

```typescript
import { authService } from '@/core'

// Login
await authService.login('user-123', 'admin', 'tenant-1')

// Check single permission
if (authService.hasPermission('customer.create')) {
  console.log('Can create customers')
}

// Check any permission
if (authService.hasAnyPermission('customer.create', 'customer.edit')) {
  console.log('Can modify customers')
}

// Check all permissions
if (authService.hasAllPermissions('customer.create', 'customer.edit')) {
  console.log('Can do all customer operations')
}

// Get context
const context = authService.getContext()
console.log('User:', context?.userId)
console.log('Role:', context?.userRole)
console.log('Tenant:', context?.tenantId)
```

### 6. Switch Themes

```typescript
import { themeEngine } from '@/core'

// Get current theme
const currentTheme = themeEngine.getCurrentTheme()
console.log('Current theme:', currentTheme?.name)

// List available themes
const themes = themeEngine.listThemes()
console.log('Available themes:', themes.map(t => t.name))

// Set active theme
themeEngine.setActiveTheme('dark')

// Get specific color
const primaryColor = themeEngine.getColor('primary')
console.log('Primary color:', primaryColor)

// Update color at runtime
themeEngine.updateThemeColor('primary', '#3b82f6')
```

### 7. Build Navigation

```typescript
import { navigationEngine } from '@/core'

// Get full navigation
const navigation = navigationEngine.getNavigation()
console.log('Navigation items:', navigation)

// Search in navigation
const results = navigationEngine.search('customer')
console.log('Search results:', results)

// Get breadcrumb
const breadcrumb = navigationEngine.getBreadcrumb('/crm/customers')
console.log('Breadcrumb:', breadcrumb)
```

### 8. Resolve Layouts

```typescript
import { layoutEngine } from '@/core'

// Resolve layout with fields
const layout = layoutEngine.resolveLayout('customer', 'form-create')
if (layout) {
  console.log('Layout:', layout.name)
  console.log('Sections:', layout.sections)
  console.log('Fields:', layout.fields)
}

// Get default layout
const defaultLayout = layoutEngine.getDefaultLayout('customer', 'form')
console.log('Default form layout:', defaultLayout?.name)

// Generate layout from entity
const autoLayout = layoutEngine.generateLayoutFromEntity('customer', 'list')
console.log('Auto-generated layout:', autoLayout?.name)
```

### 9. Metadata Registry Stats

```typescript
import { metadataRegistry } from '@/core'

// Get statistics
const stats = metadataRegistry.getStats()
console.log('Registered entities:', stats.entities)
console.log('Registered layouts:', stats.layouts)
console.log('Registered workflows:', stats.workflows)
console.log('Registered modules:', stats.modules)

// List all entities
const entities = metadataRegistry.listEntities()
entities.forEach(entity => {
  console.log(`Entity: ${entity.name} (${entity.label})`)
})

// List all modules
const modules = metadataRegistry.listModules()
modules.forEach(module => {
  console.log(`Module: ${module.code} - ${module.name}`)
})
```

### 10. Module Loader Status

```typescript
import { moduleLoader } from '@/core'

// Check if module is loaded
if (moduleLoader.isModuleLoaded('crm')) {
  console.log('CRM module is loaded')
}

// Get module
const crmModule = moduleLoader.getModule('crm')
console.log('Module:', crmModule?.manifest.name)

// Get all loaded modules
const allModules = moduleLoader.getLoadedModules()
console.log('Loaded modules:', allModules.length)

// Get status
const status = moduleLoader.getStatus()
console.log('Loaded:', status.loaded)
console.log('Loading:', status.loading)
console.log('Module list:', status.modules)

// Unload module
await moduleLoader.unloadModule('crm')

// Clear all
await moduleLoader.clearAll()
```

## Event Types

```typescript
// Module Events
SystemEvents.MODULE_INSTALLED
SystemEvents.MODULE_UNINSTALLED
SystemEvents.MODULE_ENABLED
SystemEvents.MODULE_DISABLED

// Entity Events
SystemEvents.ENTITY_CREATED
SystemEvents.ENTITY_UPDATED
SystemEvents.ENTITY_DELETED
SystemEvents.ENTITY_VALIDATED

// Workflow Events
SystemEvents.WORKFLOW_STATE_CHANGED
SystemEvents.WORKFLOW_TRANSITION
SystemEvents.APPROVAL_REQUESTED
SystemEvents.APPROVAL_APPROVED
SystemEvents.APPROVAL_REJECTED

// Notification Events
SystemEvents.NOTIFICATION_CREATED
SystemEvents.NOTIFICATION_READ

// Permission Events
SystemEvents.PERMISSION_CHANGED
SystemEvents.ROLE_ASSIGNED

// Theme Events
SystemEvents.THEME_CHANGED

// Workspace Events
SystemEvents.WORKSPACE_CREATED
SystemEvents.WORKSPACE_UPDATED
SystemEvents.WORKSPACE_DELETED

// Auth Events
SystemEvents.USER_LOGGED_IN
SystemEvents.USER_LOGGED_OUT
```

## Field Types

```typescript
// Supported field types
'text'          // Text input
'number'        // Number input
'date'          // Date picker
'select'        // Dropdown
'multiselect'   // Multiple selection
'textarea'      // Multi-line text
'email'         // Email input
'phone'         // Phone input
'currency'      // Currency amount
'checkbox'      // Boolean checkbox
'relation'      // Related entity
'link'          // External link
```

## Layout Types

```typescript
'form'          // Data entry form
'list'          // Data list/table
'card'          // Card view
'dashboard'     // Dashboard widgets
'report'        // Report view
```

## Common Patterns

### Pattern 1: Create and Register Module

```typescript
const module: IModule = {
  manifest: { /* ... */ },
  getEntities: () => [/* schemas */],
  initialize: async () => { /* ... */ }
}

await moduleLoader.loadModule('module-code', module)
```

### Pattern 2: React to Events

```typescript
eventBus.subscribe(SystemEvents.MODULE_INSTALLED, (payload) => {
  console.log(`Module ${payload.module} installed`)
  navigationEngine.invalidate()
})
```

### Pattern 3: Check and Apply Permissions

```typescript
const context = authService.getContext()
if (!context?.permissions.has('entity.create')) {
  return <p>Access Denied</p>
}
```

### Pattern 4: Conditional Rendering

```typescript
const layout = layoutEngine.resolveLayout('customer', 'form')
if (!layout) {
  return <p>Layout not found</p>
}

return <FormRenderer layout={layout} />
```

## Debugging

```typescript
// Enable debug logging
console.log('[Platform]', 'Debug info')

// Check registry
console.log('Entities:', metadataRegistry.listEntities())

// Check event history
console.log('Recent events:', eventBus.getHistory().slice(-10))

// Check auth context
console.log('Current user:', authService.getContext())

// Check loaded modules
console.log('Modules:', moduleLoader.getStatus())
```

## Performance Tips

1. **Cache layouts** - Use layoutEngine caching
2. **Limit event history** - Monitor eventBus history size
3. **Register once** - Register modules/entities once on boot
4. **Use memoization** - Memoize component renders
5. **Lazy load** - Lazy load modules when needed

## File Locations

- **Core systems:** `/core/*.ts`
- **Components:** `/components/*.tsx`
- **Types:** `/types/index.ts`
- **App:** `/app/`
- **Styles:** `/app/globals.css`

## Common Issues

| Issue | Solution |
|-------|----------|
| Layout not found | Check entity name and layout name match |
| Module not loading | Check dependencies are loaded first |
| Permission denied | Check authService.setPermissionsFromRole() |
| Event not firing | Check event name in SystemEvents |
| Theme not changing | Check themeEngine.setActiveTheme() |

---

**For more detailed information, see:**
- ARCHITECTURE.md - Complete architecture
- PHASE_1_COMPLETE.md - Phase 1 details
- README.md - Getting started
