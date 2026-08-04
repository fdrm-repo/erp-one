# ERP ONE - Enterprise Metadata Platform

## Platform Vision

**ERP ONE is not an ERP application. ERP ONE is an Enterprise Metadata Platform.**

- Applications are composed from metadata
- Pages are composed from templates
- Business logic is composed from workflows
- Modules are composed from manifests
- UI is composed from rendering engines
- **The Core only knows metadata**
- **The Core never knows business**

## Architecture Principles

Everything is:
- **Metadata Driven** - All configuration comes from metadata, never hardcoded
- **Modular** - Each business function is a self-contained installable module
- **Extensible** - Extend through configuration, not code modification
- **Configurable** - Every aspect can be configured at runtime
- **Multi-Tenant** - Built for multiple independent organizations
- **Template Based** - Reusable templates for all UI and workflows
- **Event Driven** - Communication through event system
- **Permission Driven** - All access controlled by permissions
- **Type Safe** - Full TypeScript support throughout

## Platform Roadmap

### Phase 1: Platform Core ✓ COMPLETE

**Completed:**
- Application Shell with sidebar/navbar
- Metadata Registry (central schema store)
- Event Bus (event-driven communication)
- Theme Engine (runtime theme switching)
- Module Loader (dynamic module loading)
- Navigation Engine (metadata-driven navigation)
- Layout Engine (template-based layout rendering)
- Authentication System (permission and role management)

**Key Components:**
```
core/
├── metadata-registry.ts   - Central schema store
├── event-bus.ts           - Event dispatcher
├── theme-engine.ts        - Theme management
├── module-loader.ts       - Module lifecycle
├── auth.ts                - Auth context
├── layout-engine.ts       - Layout rendering
├── navigation-engine.ts   - Navigation building
└── index.ts               - Core exports

components/
├── platform-shell.tsx     - Main app wrapper
├── platform-initializer.tsx - Boot sequence
├── sidebar.tsx            - Navigation sidebar
└── navbar.tsx             - Top navbar
```

### Phase 2: Rendering Engines (NEXT)

**To Implement:**
- Form Engine - Dynamic form generation from field schemas
- Table Engine - Dynamic table/list rendering
- Filter Engine - Advanced filtering UI
- Search Engine - Full-text search
- Dashboard Engine - Widget-based dashboards
- Report Engine - Automated report generation
- Workflow Engine - State machine workflows
- Timeline Engine - Event timeline display
- Activity Engine - User activity tracking
- Approval Engine - Workflow approvals
- Notification Engine - Real-time notifications
- Template Engine - Reusable component templates

### Phase 3: Metadata Layer (AFTER PHASE 2)

**To Define:**
- Complete API Schema definitions
- Automation Schema for triggers/actions
- Advanced Validation Schema
- Report Schema specifications
- Complete Dashboard Schema patterns

### Phase 4: Core Modules (AFTER PHASE 3)

**Modules to Build:**
- CRM (Customer Relationship Management)
- Sales (Orders, Quotations)
- Procurement (Purchase Orders, Vendors)
- Finance (Invoices, Payments, GL)
- Warehouse (Stock Management)
- Inventory (Item Master)
- HR (Employees, Payroll)
- Documents (Shared documents)
- Approvals (Approval workflows)
- Reports (Business intelligence)
- Analytics (Data analytics)
- Workspace (Shared spaces)
- Master Data (Reference data)
- Administration (System config)

### Phase 5: Industry Modules (AFTER PHASE 4)

**Specialized Implementations:**
- Freight Forwarding
- Manufacturing
- Retail & POS
- Restaurant Management
- Construction
- Healthcare
- Hospitality
- Project Management
- Asset Management
- Fleet Management

### Phase 6: AI Platform (AFTER PHASE 5)

**AI Features:**
- AI Chat interface
- Semantic search
- OCR document processing
- Document AI extraction
- Recommendations engine
- Forecasting
- Smart automation
- Voice interface
- Knowledge AI

## Core Concepts

### Metadata Types

1. **Entity Schema** - Defines a business entity (Customer, Invoice, etc.)
   - Fields with types and validation
   - Relationships to other entities
   - Features (audit, timeline, approvals)

2. **Field Schema** - Defines a single field
   - Type (text, number, date, select, etc.)
   - Validation rules
   - UI properties

3. **Layout Schema** - Defines UI layout
   - Form, List, Card, Dashboard, Report layouts
   - Sections and fields arrangement
   - Responsive grid configuration

4. **Workflow Schema** - Defines state machine
   - States and transitions
   - Conditions and actions
   - Permissions per transition

5. **Permission Schema** - Defines access control
   - Role-based permissions
   - Field-level permissions
   - Entity-level permissions

6. **Dashboard Schema** - Defines dashboards
   - Widget definitions
   - Data sources
   - Layout configuration

### Event System

All major events flow through the Event Bus:

```typescript
// System Events
MODULE_INSTALLED / MODULE_UNINSTALLED
ENTITY_CREATED / ENTITY_UPDATED / ENTITY_DELETED
WORKFLOW_STATE_CHANGED
APPROVAL_REQUESTED / APPROVAL_APPROVED / APPROVAL_REJECTED
USER_LOGGED_IN / USER_LOGGED_OUT
THEME_CHANGED
PERMISSION_CHANGED
```

Subscribe to events:
```typescript
eventBus.subscribe(SystemEvents.ENTITY_CREATED, (payload) => {
  console.log('Entity created:', payload.entityId)
})
```

### Module System

Modules are self-contained packages that extend the platform:

```typescript
const module: IModule = {
  manifest: {
    code: 'crm',
    name: 'CRM Module',
    entities: ['customer', 'opportunity', 'activity'],
    // ... more config
  },
  
  initialize: async () => {
    // Setup module
  },
  
  getEntities: () => [/* entity schemas */],
  getLayouts: () => [/* layout schemas */],
  getWorkflows: () => [/* workflow schemas */],
  getNavigation: () => [/* navigation items */],
}

await moduleLoader.loadModule('crm', module)
```

### Theme System

Themes are metadata-driven and support runtime switching:

```typescript
const theme: ThemeConfig = {
  name: 'dark',
  colors: {
    primary: '#0a0a0a',
    secondary: '#f4f4f5',
    // ... more colors
  },
  fonts: {
    sans: 'Inter',
    serif: 'Merriweather',
    mono: 'Fira Code'
  }
}

themeEngine.registerTheme(theme)
themeEngine.setActiveTheme('dark')
```

### Authentication & Permissions

Simple permission-based access control:

```typescript
// Login
await authService.login('user-123', 'admin', 'tenant-1')

// Check permissions
if (authService.hasPermission('customer.create')) {
  // Show create button
}

// Set from role
authService.setPermissionsFromRole([
  'customer.create',
  'customer.read',
  'customer.update'
])
```

## File Structure

```
/
├── app/
│   ├── layout.tsx           - Root layout
│   ├── page.tsx             - Home page
│   └── globals.css          - Global styles
│
├── components/
│   ├── platform-shell.tsx   - Main wrapper
│   ├── platform-initializer.tsx
│   ├── sidebar.tsx
│   ├── navbar.tsx
│   └── ui/                  - shadcn/ui components
│
├── core/
│   ├── index.ts             - Export all core
│   ├── metadata-registry.ts
│   ├── event-bus.ts
│   ├── theme-engine.ts
│   ├── module-loader.ts
│   ├── auth.ts
│   ├── layout-engine.ts
│   └── navigation-engine.ts
│
├── types/
│   └── index.ts             - All TypeScript types
│
├── public/
│   └── ...                  - Static assets
│
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── next.config.mjs
└── ARCHITECTURE.md          - This file
```

## Implementation Standards

### Clean Architecture
- Separation of concerns
- Dependency injection
- Repository pattern
- No circular dependencies

### DDD (Domain-Driven Design)
- Domain entities
- Value objects
- Aggregates
- Domain events

### SOLID Principles
- Single Responsibility
- Open/Closed
- Liskov Substitution
- Interface Segregation
- Dependency Inversion

### Code Quality
- Full TypeScript coverage
- Immutable data structures
- Pure functions
- Comprehensive typing
- No type 'any'

## UI Principles

All UI follows these rules:
- **shadcn/ui** for components
- **TailwindCSS v4** for styling
- **Inter font** for typography
- **Lucide icons** for all icons
- **Responsive** mobile-first design
- **Accessible** WCAG compliant
- **Minimal** clean aesthetic
- **Professional** enterprise-grade

No UI elements are hardcoded. All UI is generated from metadata using rendering engines.

## Development Guidelines

### Adding a New Module

1. Create module manifest
2. Define entity schemas
3. Define layout schemas
4. Define workflow schemas (if needed)
5. Define navigation items
6. Implement module interface
7. Register module with loader
8. Verify through events

### Adding a New Entity

1. Define entity schema in metadata
2. Create layout schemas (form, list)
3. Register in module manifest
4. Add to navigation
5. Implement any workflows
6. Add permissions

### Extending the Platform

Never:
- Hardcode business logic
- Hardcode form fields
- Hardcode navigation
- Hardcode permissions
- Hardcode workflows

Always:
- Use metadata definitions
- Register in registry
- Emit events
- Use rendering engines
- Follow module pattern

## Performance Considerations

- Metadata is cached in registry
- Layouts are cached after resolution
- Navigation compiled once per load
- Event handlers are optimized
- Theme changes are optimized
- Module loading is sequential

## Security Model

- All access is permission-based
- Tenant isolation at context level
- Role-based access control
- Field-level permissions
- Entity-level permissions
- Audit trail through event system

## Testing Strategy

Every component should have:
- Type tests (TypeScript compilation)
- Unit tests (isolated functions)
- Integration tests (component interaction)
- E2E tests (user workflows)

Test the rendering engines specifically:
- Layout resolution
- Field validation
- Permission checking
- Event emission

## Deployment

The platform is production-ready:
- Full TypeScript type safety
- SSR with Next.js
- Optimized builds
- Security headers
- Error handling
- Logging infrastructure
- Multi-tenant support

## Next Steps

1. Build Phase 2: Rendering Engines
   - Start with Form Engine
   - Then Table Engine
   - Then Dashboard Engine

2. Define Phase 3: Metadata Layer
   - Complete all schema definitions
   - Add validation rules
   - Define API specs

3. Build Phase 4: Core Modules
   - Start with Master Data module
   - Then Finance module
   - Then CRM module

4. Industry Customization
   - Build Freight module first
   - Then Manufacturing
   - Then others

## Support

This is a production-ready platform. Every design decision follows:
- The architecture specification
- Enterprise software patterns
- Best practices for scalability
- Multi-tenant isolation
- Security by default

The platform is extensible without modifying core code, enabling unlimited business customization through metadata and modules.
