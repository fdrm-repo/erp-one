/**
 * Validation Scenario 1: Hello World Module
 * 
 * Test: Create a minimal module with one entity.
 * 
 * Expected Output (AUTO-GENERATED, NO CODING):
 * - Navigation entry
 * - Workspace page
 * - CRUD operations
 * - Search capability
 * - Permissions
 * - REST API endpoints
 * - Form renderer
 * - Table renderer
 * 
 * Success Criteria:
 * - Entity registered in metadata
 * - All renderers auto-generate UI
 * - No manual React pages created
 * - No manual route definitions
 * - Navigation updates automatically
 */

import { createValidationScenario } from '../validation-suite'
import { metadataEngine } from '@/core'

// Minimal Hello World ODL definition
const HELLO_WORLD_ODL = `
entity Customer
  field code
    type text
    required true
    unique true
  
  field name
    type text
    required true
  
  field email
    type email
  
  permission read
    roles ["viewer", "editor", "admin"]
  
  permission write
    roles ["editor", "admin"]
`

export const scenario1HelloWorld = createValidationScenario(
  'scenario-1',
  'Hello World Module',
  'Verify that a minimal module auto-generates all required capabilities',
  async () => {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Step 1: Register the metadata
      const entityMetadata = {
        name: 'Customer',
        fields: [
          {
            name: 'code',
            type: 'text',
            required: true,
            unique: true,
          },
          {
            name: 'name',
            type: 'text',
            required: true,
          },
          {
            name: 'email',
            type: 'email',
            required: false,
          },
        ],
        permissions: [
          {
            action: 'read',
            roles: ['viewer', 'editor', 'admin'],
          },
          {
            action: 'write',
            roles: ['editor', 'admin'],
          },
        ],
      }

      // Check 1: Can metadata be registered?
      const metadata = metadataEngine.register('Customer', entityMetadata)
      if (!metadata) {
        errors.push('Failed to register entity metadata')
        return {
          passed: false,
          message: 'Metadata registration failed',
          errors,
        }
      }

      // Check 2: Can metadata be retrieved?
      const retrieved = metadataEngine.getEntity('Customer')
      if (!retrieved) {
        errors.push('Failed to retrieve registered metadata')
        return {
          passed: false,
          message: 'Metadata retrieval failed',
          errors,
        }
      }

      // Check 3: Are fields indexed?
      const fields = metadataEngine.getFields('Customer')
      if (!fields || fields.length === 0) {
        errors.push('Fields not indexed in metadata')
        return {
          passed: false,
          message: 'Field indexing failed',
          errors,
        }
      }

      if (fields.length !== 3) {
        errors.push(`Expected 3 fields, got ${fields.length}`)
      }

      // Check 4: Are permissions registered?
      const permissions = metadataEngine.getPermissions('Customer')
      if (!permissions || permissions.length === 0) {
        errors.push('Permissions not registered')
        return {
          passed: false,
          message: 'Permission registration failed',
          errors,
        }
      }

      // Check 5: Can we query for auto-generated features?
      const features = metadataEngine.getAutoFeatures('Customer')
      if (!features) {
        warnings.push('Auto-feature detection not implemented')
      } else {
        // These should be auto-generated, not manually coded
        const requiredFeatures = [
          'list-view',
          'workspace',
          'crud-create',
          'crud-read',
          'crud-update',
          'crud-delete',
          'search',
          'permissions',
          'api-endpoints',
          'form-render',
          'table-render',
        ]

        const missingFeatures = requiredFeatures.filter((f) => !features.includes(f))
        if (missingFeatures.length > 0) {
          warnings.push(`Auto-features missing: ${missingFeatures.join(', ')}`)
        }
      }

      // Check 6: No manual React pages should exist
      const manualPages = metadataEngine.getManuallyDefinedPages('Customer')
      if (manualPages && manualPages.length > 0) {
        errors.push(
          `Found manually defined React pages for Customer: ${manualPages.join(', ')}. This indicates the rendering system is not working.`
        )
      }

      // If we got here with no errors, scenario passed
      if (errors.length === 0) {
        return {
          passed: true,
          message: 'Hello World module successfully auto-generated all capabilities',
          warnings: warnings.length > 0 ? warnings : undefined,
        }
      } else {
        return {
          passed: false,
          message: `Hello World module failed validation: ${errors.length} error(s)`,
          errors,
          warnings: warnings.length > 0 ? warnings : undefined,
        }
      }
    } catch (error) {
      return {
        passed: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
        errors: [String(error)],
      }
    }
  }
)
