# Phase 2: Rendering Engines - Roadmap

Phase 2 will implement all rendering engines that transform metadata into interactive UI components.

## Overview

Rendering engines consume metadata schemas and generate fully-functional UI components. These engines are the bridge between the metadata layer and the user interface.

## Engines to Build

### 1. Form Engine ✗

**Purpose:** Generate dynamic forms from entity schemas

**Input:**
```typescript
// Entity schema
{
  name: 'customer',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'country', type: 'select', options: [...] }
  ]
}

// Layout schema
{
  name: 'form-create',
  type: 'form',
  sections: [
    {
      name: 'Basic Info',
      fields: ['name', 'email']
    }
  ]
}
```

**Output:** Fully rendered form with:
- Field validation
- Error messages
- Input types
- Required indicators
- Submit handler
- Loading states

**Example Usage:**
```typescript
<FormRenderer entity="customer" layoutName="form-create" />
```

### 2. Table Engine ✗

**Purpose:** Generate dynamic data tables from entity schemas

**Features:**
- Column auto-generation from fields
- Sorting
- Pagination
- Row selection
- Inline editing
- Actions column
- Filtering integration

**Example Usage:**
```typescript
<TableRenderer entity="customer" layoutName="list" />
```

### 3. Filter Engine ✗

**Purpose:** Dynamic filtering UI based on entity fields

**Features:**
- Field-based filters
- Multiple filter types (text, select, date range, numeric)
- Filter combinations
- Saved filter presets
- Clear filters

**Example Usage:**
```typescript
<FilterRenderer entity="customer" onFilterChange={handleFilter} />
```

### 4. Search Engine ✗

**Purpose:** Global search across all entities

**Features:**
- Full-text search
- Entity type filtering
- Search results display
- Recent searches
- Saved searches

**Example Usage:**
```typescript
<SearchRenderer />
```

### 5. Dashboard Engine ✗

**Purpose:** Render dashboards from dashboard schemas

**Input:**
```typescript
{
  name: 'sales-dashboard',
  module: 'sales',
  layout: 'grid',
  widgets: [
    {
      type: 'metric',
      title: 'Total Sales',
      size: 'small',
      config: { /* data config */ }
    },
    {
      type: 'chart',
      title: 'Sales Trend',
      size: 'large',
      config: { /* chart config */ }
    }
  ]
}
```

**Widget Types:**
- Metric - KPI display
- Chart - Line, bar, pie charts
- List - Top records
- Table - Data table
- Custom - Extensible

**Example Usage:**
```typescript
<DashboardRenderer module="sales" name="sales-dashboard" />
```

### 6. Report Engine ✗

**Purpose:** Generate reports from report schemas

**Features:**
- Parameterized reports
- Multiple export formats (PDF, Excel, CSV)
- Scheduled reports
- Email delivery
- Report templates

**Example Usage:**
```typescript
<ReportRenderer reportId="sales-summary" />
```

### 7. Workflow Engine ✗

**Purpose:** Visualize and manage workflows

**Features:**
- State machine visualization
- Transition buttons
- Conditions display
- Action tracking
- History timeline

**Example Usage:**
```typescript
<WorkflowRenderer entity="invoice" recordId="123" />
```

### 8. Timeline Engine ✗

**Purpose:** Display activity timeline

**Features:**
- Event history display
- Chronological ordering
- Event types
- User attribution
- Filters

**Example Usage:**
```typescript
<TimelineRenderer entity="customer" recordId="123" />
```

### 9. Approval Engine ✗

**Purpose:** Handle approval workflows

**Features:**
- Approval chain display
- Approval/Rejection UI
- Comments
- Delegation
- Escalation

**Example Usage:**
```typescript
<ApprovalRenderer approvalId="123" />
```

### 10. Notification Engine ✗

**Purpose:** Real-time notifications

**Features:**
- Notification display
- Mark as read
- Notification types
- Filtering
- Sound/visual alerts

**Example Usage:**
```typescript
<NotificationCenter />
```

### 11. Template Engine ✗

**Purpose:** Reusable component templates

**Features:**
- Component composition
- Template inheritance
- Template variables
- Slot system
- Partial rendering

**Example Usage:**
```typescript
<Template name="invoice-summary" data={data} />
```

### 12. Widget Engine ✗

**Purpose:** Custom widget framework

**Features:**
- Widget registration
- Props system
- Event system
- Size/layout configuration
- Extensibility

**Example Usage:**
```typescript
<Widget type="custom-metric" config={config} />
```

## Implementation Order

1. **Form Engine** - Foundation for data entry
2. **Table Engine** - Foundation for data display
3. **Filter Engine** - Enable data filtering
4. **Dashboard Engine** - Combine widgets
5. **Report Engine** - Generate reports
6. **Workflow Engine** - Visual workflows
7. **Approval Engine** - Business workflows
8. **Timeline Engine** - Activity tracking
9. **Search Engine** - Global search
10. **Notification Engine** - Real-time updates
11. **Template Engine** - Code reuse
12. **Widget Engine** - Extensibility

## Design Principles for Engines

### 1. Metadata-First
- Everything comes from metadata
- No hardcoding
- Schemas drive rendering

### 2. Type-Safe
- Full TypeScript support
- No 'any' types
- Compile-time safety

### 3. Performant
- Caching where applicable
- Memoization for components
- Lazy loading of data

### 4. Accessible
- WCAG compliant
- Keyboard navigation
- Screen reader support
- ARIA attributes

### 5. Responsive
- Mobile-first design
- Responsive tables
- Responsive forms
- Touch-friendly

### 6. Extensible
- Plugin architecture
- Custom components
- Custom validators
- Custom renderers

## Engine Architecture Pattern

Each engine should follow this pattern:

```typescript
/**
 * [Engine Name] Engine
 * Renders [Component Type] from metadata
 */

import type { [SchemaType], [ConfigType] } from '@/types'
import { metadataRegistry } from '@/core'

interface [EngineProps] {
  entity?: string
  schema?: [SchemaType]
  layout?: string
  config?: [ConfigType]
  onData?: (data: any) => void
  onEvent?: (event: string, payload: any) => void
}

export function [EngineComponent]({
  entity,
  schema,
  layout,
  config,
  onData,
  onEvent,
}: [EngineProps]) {
  // 1. Resolve metadata
  const resolvedSchema = schema || metadataRegistry.get[Schema](entity, layout)
  
  // 2. Validate
  if (!resolvedSchema) {
    throw new Error(`Schema not found: ${entity}:${layout}`)
  }

  // 3. Render
  return (
    <div className="[engine-class]">
      {/* Render based on metadata */}
    </div>
  )
}
```

## Testing Engines

Each engine must have:

1. **Unit Tests**
   - Schema validation
   - Metadata resolution
   - Data transformation

2. **Component Tests**
   - Rendering
   - User interaction
   - Event emission

3. **Integration Tests**
   - With metadata registry
   - With event bus
   - With auth service

4. **E2E Tests**
   - Full user workflows
   - Data entry and submission
   - Approval workflows

## Example: Form Engine Implementation

```typescript
// Form Schema Definition
const customerFormSchema: EntitySchema = {
  id: 'form-customer-create',
  name: 'customer',
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  fields: [
    {
      id: 'field-name',
      name: 'name',
      label: 'Customer Name',
      type: 'text',
      required: true,
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'field-email',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      validation: [
        { type: 'email', message: 'Invalid email' }
      ],
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
}

// Form Component
export function FormEngine({ entity, layout }: FormEngineProps) {
  const schema = metadataRegistry.getEntity(entity)
  const layoutSchema = metadataRegistry.getLayout(entity, layout)
  
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})

  const handleChange = (fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const validationErrors = validateForm(values, schema.fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Emit event
    await eventBus.emit(SystemEvents.ENTITY_CREATED, {
      entity,
      data: values
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form-engine">
      {layoutSchema.sections.map(section => (
        <FormSection key={section.id} section={section} fields={schema.fields} />
      ))}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Performance Targets

- **Form Render:** < 100ms
- **Table with 100 rows:** < 200ms
- **Dashboard with 10 widgets:** < 500ms
- **Search Results:** < 300ms
- **Filter Application:** < 150ms

## Accessibility Targets

- WCAG 2.1 AA compliance
- 100% keyboard navigable
- Full screen reader support
- Color contrast 7:1 for text
- Focus indicators on all interactive elements

## Next Steps

1. Start with Form Engine implementation
2. Implement validation system
3. Build Table Engine
4. Add Filter Engine integration
5. Continue with remaining engines

All engines will build on the solid foundation of Phase 1 core systems.

---

**Phase 2 will transform ERP ONE from a platform foundation into a fully-featured application framework.**
