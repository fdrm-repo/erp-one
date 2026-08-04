# Platform Runtime Validation

## Success Criteria

The Platform is considered complete only when:

```
✅ A new module can be installed by dropping it into the modules directory
✅ The sidebar updates automatically
✅ Routes are generated automatically
✅ Workspaces are generated automatically
✅ Forms are generated automatically
✅ Tables are generated automatically
✅ Permissions are generated automatically
✅ Reports are generated automatically
✅ Dashboards are generated automatically
✅ APIs are generated automatically
✅ Search indexes update automatically
✅ No Core code should require modification after a new module is installed
```

---

## Runtime Validation Test

### Test 1: Module Installation Without Core Changes

**Objective**: Prove that a complete CRM module can be installed without modifying any Core files.

**Prerequisites**:
- Platform Runtime is running
- Module SDK is functional
- All engines are initialized

**Test Steps**:

1. **Create Module Manifest**
   ```
   File: modules/crm/manifest.ts
   ```
   - Define module metadata
   - Declare entities, dashboards, workflows
   - Specify dependencies

2. **Create CRM Entities**
   ```
   Files:
   - modules/crm/entities/customer.ts
   - modules/crm/entities/contact.ts
   - modules/crm/entities/opportunity.ts
   ```
   - Define fields, relationships, features
   - Use EntityMetadata interface
   - Declare automatic features

3. **Create CRM Layouts**
   ```
   Files:
   - modules/crm/layouts/customer-form.ts
   - modules/crm/layouts/contact-form.ts
   ```
   - Define form layouts
   - Reference fields from entities
   - Organize into sections

4. **Create CRM Workflows**
   ```
   File: modules/crm/workflows/opportunity-workflow.ts
   ```
   - Define opportunity states (Lead → Qualified → Proposal → Won/Lost)
   - Define transitions
   - Map actions to transitions

5. **Create CRM Dashboards**
   ```
   File: modules/crm/dashboards/sales-dashboard.ts
   ```
   - Define dashboard widgets
   - Reference entities for data
   - Specify widget sizes and configs

6. **Create CRM Navigation**
   ```
   File: modules/crm/navigation/menu.ts
   ```
   - Define sidebar items
   - Reference entities
   - Organize into categories

7. **Create CRM Permissions**
   ```
   File: modules/crm/permissions/roles.ts
   ```
   - Define permission roles (Admin, Sales Manager, Sales Rep)
   - Entity-level permissions
   - Field-level permissions

8. **Install Module**
   ```typescript
   import { moduleSDK } from '@/core';
   import { manifest } from '@/modules/crm/manifest';
   import * as entities from '@/modules/crm/entities';
   import * as dashboards from '@/modules/crm/dashboards';
   
   await moduleSDK.createModule({
     manifest,
     entities: Object.values(entities),
     dashboards: Object.values(dashboards),
     // ... other metadata
   });
   ```

9. **Verify Automatic Updates**
   - [ ] Platform Studio shows CRM entities
   - [ ] Sidebar updated with CRM menu items
   - [ ] Entity routes generated (`/entities/crm.customer`, etc.)
   - [ ] Workspaces render with customer data
   - [ ] List views show customers
   - [ ] Search indexes include customer fields
   - [ ] API endpoints available (`/api/crm/customer`, etc.)
   - [ ] Dashboards render with sales data
   - [ ] Workflows execute opportunity transitions
   - [ ] Permissions enforced by role

10. **Core Validation**
    - [ ] No `core/` files were modified
    - [ ] No `types/` files were modified (except adding runtime types)
    - [ ] No `components/` files were modified (except Platform Studio)
    - [ ] Installation done entirely through Module SDK

**Expected Result**: ✅ Module fully functional without Core modifications

---

### Test 2: Module Removal and Cleanup

**Objective**: Prove that modules can be uninstalled cleanly without orphaned metadata.

**Test Steps**:

1. Install CRM module (Test 1)
2. Verify CRM is functional
3. Call `moduleSDK.uninstallModule('crm')`
4. Verify cleanup:
   - [ ] CRM entities removed from Metadata Engine
   - [ ] CRM sidebar items removed
   - [ ] CRM routes unavailable
   - [ ] CRM search indexes cleared
   - [ ] No orphaned metadata
   - [ ] Platform Studio reflects removal

**Expected Result**: ✅ Clean removal without artifacts

---

### Test 3: Multiple Module Installation

**Objective**: Prove that multiple modules can coexist.

**Modules to Install**:
1. CRM (from Test 1)
2. Finance Module
3. Freight Module

**Test Steps**:

1. Install CRM module
2. Install Finance module
   - Define accounting entities (Invoice, Account, Journal Entry)
   - Create dashboards
3. Install Freight module
   - Define shipment entities (Shipment, Port, Container)
   - Create dashboards
4. Verify:
   - [ ] Sidebar shows all three modules organized
   - [ ] All entities registered
   - [ ] All workspaces render
   - [ ] All dashboards functional
   - [ ] Cross-module relationships work (Customer → Order → Shipment)
   - [ ] No conflicts between modules

**Expected Result**: ✅ All modules coexist and function correctly

---

### Test 4: Automatic Feature Generation

**Objective**: Prove that automatic features are generated without additional code.

**Features to Verify**:

For each entity installed:
- [ ] **List View**: Automatic table of entities
- [ ] **Workspace**: Automatic detail view
- [ ] **History**: Automatic change tracking
- [ ] **Audit**: Automatic audit log
- [ ] **Search**: Automatic full-text search
- [ ] **Permissions**: Automatic permission schema
- [ ] **API**: Automatic RESTful API
- [ ] **Timeline**: Automatic change timeline
- [ ] **Attachments**: Automatic file attachment support
- [ ] **Activities**: Automatic activity feed
- [ ] **Approvals**: Automatic workflow approvals (if enabled)

**Test Implementation**:
```typescript
import { entityEngine, metadataEngine } from '@/core';

const customer = entityEngine.getEntity('crm.customer');

// Verify automatic features
assert.isTrue(customer.features.listView);
assert.isTrue(customer.features.workspace);
assert.isTrue(customer.features.history);
assert.isTrue(customer.features.audit);
assert.isTrue(customer.features.search);
assert.isTrue(customer.features.api);
assert.isTrue(customer.features.timeline);
assert.isTrue(customer.features.attachments);
assert.isTrue(customer.features.activities);

// Verify automatic API configuration
const apiConfig = entityEngine.getApiConfiguration('crm.customer');
assert.exists(apiConfig);
assert.lengthOf(apiConfig.endpoints, 5); // GET list, GET one, POST, PUT, DELETE

// Verify automatic search configuration
const searchConfig = entityEngine.getSearchConfiguration('crm.customer');
assert.exists(searchConfig);
assert.isNotEmpty(searchConfig.searchableFields);
```

**Expected Result**: ✅ All features automatically generated

---

### Test 5: Convention Over Configuration

**Objective**: Prove that module discovery and registration is automatic.

**Test Implementation**:

1. Create module with standard folder structure (no manual registration):
   ```
   modules/helpdesk/
   ├── manifest.ts
   ├── entities/
   │   ├── ticket.ts
   │   ├── knowledgebase.ts
   │   └── sla.ts
   ├── layouts/
   │   ├── ticket-form.ts
   │   └── ticket-list.ts
   ├── workflows/
   │   └── ticket-workflow.ts
   ├── dashboards/
   │   └── support-dashboard.ts
   ├── navigation/
   │   └── menu.ts
   ├── permissions/
   │   └── roles.ts
   ├── reports/
   │   └── sla-report.ts
   └── automation/
       └── sla-automation.ts
   ```

2. Call module installation:
   ```typescript
   const helpdesk = await moduleSDK.createModule({
     manifest: require('./modules/helpdesk/manifest').manifest,
     // Automatically loads all from standard directories
   });
   ```

3. Verify:
   - [ ] All entities loaded
   - [ ] All layouts available
   - [ ] All workflows configured
   - [ ] All dashboards created
   - [ ] Navigation items added
   - [ ] Permissions enforced
   - [ ] No manual registration needed

**Expected Result**: ✅ Convention over Configuration works end-to-end

---

### Test 6: Permission Enforcement

**Objective**: Prove that permissions declared in modules are enforced by the Runtime.

**Test Steps**:

1. Install CRM module with role-based permissions:
   - Role: 'sales-rep' - read/write own customers
   - Role: 'sales-manager' - read/write all customers
   - Role: 'admin' - full access

2. Create test users with different roles
3. For each user role:
   - [ ] Cannot create entity without create permission
   - [ ] Cannot read field without read permission
   - [ ] Cannot write field without write permission
   - [ ] Cannot delete entity without delete permission
   - [ ] Can perform allowed actions

**Expected Result**: ✅ Permission enforcement works correctly

---

### Test 7: Metadata Versioning and History

**Objective**: Prove that metadata changes are tracked.

**Test Steps**:

1. Register initial CRM entities
2. Get metadata version (v1)
3. Add new field to Customer entity
4. Get metadata version (v2)
5. Verify:
   - [ ] Version incremented
   - [ ] History entry created
   - [ ] Old metadata still accessible
   - [ ] Timestamp recorded

**Expected Result**: ✅ Versioning and history work correctly

---

### Test 8: Cross-Module Relationships

**Objective**: Prove that entities from different modules can relate.

**Example**:
- CRM module has `crm.customer`
- Finance module has `finance.invoice`
- Relationship: Invoice → Customer

**Test Steps**:

1. Install CRM and Finance modules
2. In Finance, create relationship: `invoice.customer → crm.customer`
3. Verify:
   - [ ] Relationship registered
   - [ ] Workspace shows relationship
   - [ ] Can navigate Customer → Invoices
   - [ ] Can navigate Invoice → Customer

**Expected Result**: ✅ Cross-module relationships work

---

## Automated Test Suite

Create `tests/runtime-validation.test.ts`:

```typescript
import { describe, it, beforeEach, afterEach, expect } from '@jest/globals';
import { moduleSDK, metadataEngine, entityEngine } from '@/core';
import { crmManifest, crmEntities, crmDashboards } from '@/modules/crm';

describe('Platform Runtime Validation', () => {
  beforeEach(async () => {
    metadataEngine.clear();
    moduleSDK.clear();
  });

  afterEach(() => {
    metadataEngine.clear();
    moduleSDK.clear();
  });

  describe('Module Installation', () => {
    it('should install CRM module without Core changes', async () => {
      const result = await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
        dashboards: crmDashboards,
      });

      expect(result.manifest.id).toBe('crm');
      expect(result.entities.size).toBe(3); // Customer, Contact, Opportunity
      expect(result.dashboards.size).toBeGreaterThan(0);
    });

    it('should generate automatic features for entities', async () => {
      await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
      });

      const customer = entityEngine.getEntity('crm.customer');
      expect(customer.features.listView).toBe(true);
      expect(customer.features.workspace).toBe(true);
      expect(customer.features.audit).toBe(true);
      expect(customer.features.search).toBe(true);
    });

    it('should update metadata version', async () => {
      const v1 = metadataEngine.getVersion();
      
      await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
      });
      
      const v2 = metadataEngine.getVersion();
      expect(v2).toBeGreaterThan(v1);
    });
  });

  describe('Module Removal', () => {
    it('should uninstall module cleanly', async () => {
      await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
      });

      expect(metadataEngine.getAllEntities().length).toBeGreaterThan(0);

      await moduleSDK.uninstallModule('crm');

      expect(metadataEngine.getAllEntities().length).toBe(0);
    });
  });

  describe('Multi-Module Installation', () => {
    it('should support multiple modules coexisting', async () => {
      await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
      });

      // Install Finance module
      const financeResult = await moduleSDK.createModule({
        manifest: financeManifest,
        entities: financeEntities,
      });

      expect(moduleSDK.listModules().length).toBe(2);
      expect(metadataEngine.getAllEntities().length).toBeGreaterThan(3);
    });
  });

  describe('Workspace Generation', () => {
    it('should generate workspace for any entity', async () => {
      await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
      });

      const customer = entityEngine.getEntity('crm.customer');
      const workspace = entityEngine.getWorkspace('crm.customer');

      expect(workspace).not.toBeNull();
      expect(workspace.sections.length).toBeGreaterThan(0);
    });
  });

  describe('Permission Schema', () => {
    it('should generate permission schema for entities', async () => {
      await moduleSDK.createModule({
        manifest: crmManifest,
        entities: crmEntities,
      });

      const permSchema = entityEngine.getPermissionSchema('crm.customer');

      expect(permSchema).not.toBeNull();
      expect(permSchema.permissions).toContain('create');
      expect(permSchema.permissions).toContain('read');
      expect(permSchema.permissions).toContain('update');
      expect(permSchema.permissions).toContain('delete');
    });
  });
});
```

---

## Validation Checklist

Before declaring Platform Runtime complete:

### Core Systems
- [ ] Metadata Engine registers and caches all metadata
- [ ] Entity Engine generates automatic features
- [ ] Component Registry resolves components by type
- [ ] Template Registry renders templates
- [ ] Workspace Engine generates generic workspaces
- [ ] Module SDK installs modules without Core changes

### Module System
- [ ] Modules follow Convention over Configuration
- [ ] Modules auto-discover metadata
- [ ] Modules register dependencies
- [ ] Modules can be uninstalled cleanly

### Automatic Features
- [ ] List View generates automatically
- [ ] Workspace generates automatically
- [ ] Search configuration generates automatically
- [ ] API configuration generates automatically
- [ ] Audit configuration generates automatically
- [ ] Permission schema generates automatically

### Validation Tests
- [ ] CRM module installs without Core changes
- [ ] Multiple modules coexist
- [ ] Module removal is clean
- [ ] Cross-module relationships work
- [ ] Permission enforcement works
- [ ] Metadata versioning works
- [ ] All automated tests pass

### Production Readiness
- [ ] No `any` types in core code
- [ ] All errors are typed
- [ ] Metadata validation working
- [ ] Performance metrics acceptable
- [ ] Error handling comprehensive
- [ ] Logging sufficient for debugging

**Status**: Ready for Phase 2 (Rendering Engines) when all checks pass.
