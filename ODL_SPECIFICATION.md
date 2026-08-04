# ONE Definition Language (ODL) Specification

## Overview

ODL is the source of truth for the ONE Platform. Like HTML for browsers, YAML for Kubernetes, and XML for Excel, ODL is how developers define everything in the platform.

ODL is not JSON. ODL is a domain-specific language optimized for defining business applications.

## Philosophy

- **Single Source of Truth**: ODL files are the source of truth. Everything else is derived from them.
- **Human Readable**: Developers read and write ODL, not generated metadata.
- **Compilable**: ODL compiles to a Metadata Graph that the Runtime consumes.
- **Versionable**: ODL is text-based, so it's Git-friendly.
- **Extensible**: ODL supports custom directives and attributes.

## Language Structure

### Entity Definition

```yaml
entity Customer
  label "Customer"
  description "Customer information"

  field code
    type text
    label "Code"
    required true
    unique true

  field name
    type text
    label "Name"
    required true

  field email
    type email
    label "Email"

  field country
    type reference(Country)
    label "Country"

  relationship invoices
    type hasMany(Invoice)
    label "Invoices"

  relationship shipments
    type hasMany(Shipment)
    label "Shipments"

  workspace CustomerWorkspace
    tab Overview
    tab Contacts
    tab Documents
    tab Invoices
    tab Timeline

  permission read
    roles ["viewer", "editor", "admin"]

  permission write
    roles ["editor", "admin"]

  permission approve
    roles ["admin"]

  dashboard CustomerDashboard
    widget TotalInvoices
    widget PendingShipments
    widget RecentActivities

  automation OnCustomerCreated
    action NotifyFinance
    action CreateWelcomeEmail
```

### Field Types

```
text, email, phone, url, number, decimal, boolean,
date, datetime, time, richtext, json, reference,
hasMany, manyToMany, file, image, choice, multiChoice
```

### Workflow Definition

```yaml
workflow ShipmentApproval
  label "Shipment Approval"

  state Draft
    label "Draft"
    transitions ["Pending", "Cancelled"]

  state Pending
    label "Awaiting Approval"
    transitions ["Approved", "Rejected"]

  state Approved
    label "Approved"
    transitions ["InTransit", "Cancelled"]

  state InTransit
    label "In Transit"
    transitions ["Delivered", "Failed"]

  state Delivered
    label "Delivered"
    transitions []

  state Failed
    label "Failed"
    transitions ["Draft"]

  state Cancelled
    label "Cancelled"
    transitions []

  permission transition
    from Draft
    to Pending
    roles ["creator", "admin"]

  permission transition
    from Pending
    to Approved
    roles ["approver", "admin"]
```

### Automation/Rule Definition

```yaml
automation OnInvoiceCreated
  trigger invoice.created

  action LogEvent
    message "Invoice created"

  action NotifyFinance
    subject "New invoice: {invoice.number}"
    template "invoice_notification"

  action CreateJournalEntry
    account "1100"
    amount "{invoice.amount}"

automation OnShipmentCompleted
  trigger shipment.state_changed
    from InTransit
    to Delivered

  action UpdateInventory
    reduce quantity
    by shipment.items

  action GenerateInvoice
    from shipment
    set status = "Auto-Generated"

  action SendCustomerEmail
    template "shipment_delivered"
    to customer.email
```

### Dashboard Definition

```yaml
dashboard FinancialDashboard
  label "Financial Overview"

  widget RevenueChart
    type chart
    entity Invoice
    metric sum(amount)
    groupBy month
    chart line

  widget TopCustomers
    type table
    entity Customer
    columns [name, total_invoices, total_amount]
    sortBy total_amount desc
    limit 10

  widget PendingApprovals
    type list
    entity Shipment
    filter status == "Pending"
    columns [number, customer, amount]

  widget KPIs
    type metrics
    metric TotalRevenue = sum(invoice.amount)
    metric TotalShipments = count(shipment)
    metric AverageOrderValue = avg(invoice.amount)
    metric CustomerCount = count(customer)
```

### Report Definition

```yaml
report RevenueByCustomer
  label "Revenue by Customer"

  entity Invoice

  group customer
  sum amount
  sum quantity
  count id

  sort total_amount desc

  format
    column customer.name = "Customer"
    column sum_amount = "Revenue"
    column sum_quantity = "Items"
    column count_id = "Orders"

  export [pdf, excel, csv]
```

### Permission Definition

```yaml
permission CustomerRead
  entity Customer
  action read
  roles ["viewer", "editor", "admin"]

permission CustomerWrite
  entity Customer
  action write
  roles ["editor", "admin"]

permission CustomerApprove
  entity Customer
  action approve
  roles ["admin"]

permission FieldRestriction
  entity Customer
  field email
  action read
  roles ["admin", "customer_service"]
```

### Template Definition

```yaml
template CustomerWorkspace
  type workspace
  label "Customer Details"

  layout
    section Header
      field code
      field name
      field email

    section Contacts
      field phone
      field address
      field country

    section Financial
      field credit_limit
      field payment_terms
      relationship invoices
        display table

    section Documents
      widget attachments

    section Timeline
      widget timeline
```

## Compilation Pipeline

```
ODL File
  ↓
Lexer (Tokenization)
  ↓
Parser (AST)
  ↓
Semantic Validator
  ↓
Metadata Graph Builder
  ↓
Dependency Resolver
  ↓
Type Generator
  ↓
Runtime Metadata JSON
```

## Metadata Graph

After compilation, ODL becomes a Metadata Graph:

```
Customer
├── Fields
│   ├── code (text)
│   ├── name (text)
│   ├── email (email)
│   └── country (reference → Country)
├── Relationships
│   ├── invoices (hasMany → Invoice)
│   └── shipments (hasMany → Shipment)
├── Layout (CustomerWorkspace)
├── Workflow (ShipmentApproval)
├── Permissions
├── Automations
└── Dashboard
```

## Runtime Consumption

The Runtime **never** reads ODL directly.

The Runtime only reads compiled Metadata Graph (JSON):

```json
{
  "entity": {
    "name": "Customer",
    "fields": [...],
    "relationships": [...],
    "permissions": [...]
  }
}
```

This is like:
- Browsers read JavaScript, not TypeScript
- JVM reads bytecode, not Java
- Kubernetes reads YAML converted to objects, not source definitions

## Usage in Modules

Every module in ONE Platform is composed of ODL files:

```
modules/
  crm/
    entities/
      customer.odl
      contact.odl
      opportunity.odl
    workflows/
      sales_cycle.odl
    automations/
      lead_assignment.odl
    dashboards/
      pipeline.odl
    reports/
      forecast.odl
    permissions/
      roles.odl
```

## Studio Integration

Platform Studio will have a visual editor that:
1. Reads existing .odl files
2. Provides visual UI to modify them
3. Outputs updated .odl files
4. Triggers recompilation

Studio output is **always** ODL, not JSON.

## Extension Mechanism

ODL supports custom directives:

```yaml
entity Customer
  field code
    type text
    @custom(validator="isValidCustomerCode")
    @audit(track=true)
    @cache(ttl=3600)
```

Custom directives are processed by plugin handlers during compilation.

## Versioning

ODL files support versioning:

```yaml
entity Customer
  version 1.2.0
  deprecated false

  field code
    version 1.0.0
    deprecated false

  field legacy_field
    version 0.9.0
    deprecated true
    reason "Use new_field instead"
```

## Validation Rules

ODL compiler validates:
1. Syntax correctness
2. Type consistency
3. Reference validity (no dangling references)
4. Permission coherence
5. Circular dependency detection
6. Field name uniqueness
7. Entity name uniqueness
8. Workflow state reachability

## Example Complete Module

```yaml
# entities/invoice.odl
entity Invoice
  label "Invoice"

  field number
    type text
    required true
    unique true

  field date
    type date
    required true

  field amount
    type decimal
    required true

  field status
    type choice(Draft, Sent, Paid, Cancelled)
    default Draft

  field customer
    type reference(Customer)
    required true

  field items
    type json
    label "Line Items"

  relationship payments
    type hasMany(Payment)

  permission read
    roles ["viewer", "editor", "admin"]

  permission write
    roles ["editor", "admin"]

  permission approve
    roles ["finance_manager", "admin"]

  workflow InvoiceLifecycle
    state Draft
      transitions ["Sent", "Cancelled"]

    state Sent
      transitions ["Paid", "Cancelled"]

    state Paid
      transitions ["Cancelled"]

    state Cancelled
      transitions []

  automation OnInvoiceCreated
    trigger invoice.created
    action NotifyCustomer
    action CreateJournalEntry

  dashboard InvoiceOverview
    widget TotalAmount = sum(amount)
    widget TotalCount = count(id)
    widget AverageAmount = avg(amount)

# workflows/invoice_approval.odl
workflow InvoiceApproval
  state Draft → Review → Approved → Paid

# automations/invoice_rules.odl
automation SendInvoiceReminder
  trigger invoice.status == "Sent"
    AND days_since_sent > 7

  action SendEmail
    to customer.email
    template "invoice_reminder"

  action LogActivity
    message "Reminder sent"
```

## Benefits

1. **Single Source of Truth** - ODL is authoritative
2. **Version Control Friendly** - Text-based, Git-compatible
3. **Developer Experience** - Read/write by humans
4. **Type Safety** - Type generator creates TypeScript interfaces
5. **Compilation Errors** - Caught at build time, not runtime
6. **IDE Support** - Can implement syntax highlighting and LSP
7. **Documentation** - ODL is self-documenting
8. **Auditability** - Every change is tracked
9. **Portability** - ODL can compile to multiple targets
10. **Identity** - ONE Platform has a language, like Terraform has HCL

## Next Steps

Phase 3 implementation will include:
1. ODL Parser (YAML-based)
2. AST Generator
3. Semantic Validator
4. Metadata Graph Builder
5. Dependency Resolver
6. Type Generator
7. Runtime Metadata Compiler
8. Watch Mode for development
9. Incremental compilation
10. Error reporting with line numbers

---

**ODL is not just metadata format. ODL is the identity of ONE Platform.**
