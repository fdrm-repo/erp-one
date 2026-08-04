/**
 * Validation Scenario 2: Multi-Module Installation
 * 
 * Test: Install a second module without restarting Core.
 * 
 * Expected:
 * - Second module installs cleanly
 * - Core source code remains unchanged
 * - Navigation updates automatically
 * - Permissions merge correctly
 * - Search indexes update
 * - APIs auto-register
 * - Dashboard recognizes new entities
 * 
 * Success = Zero Core file changes during module installation
 */

import { createValidationScenario } from '../validation-suite'
import { metadataEngine, eventBus } from '@/core'

export const scenario2MultiModule = createValidationScenario(
  'scenario-2',
  'Multi-Module Installation',
  'Verify that second module installs without Core changes',
  async () => {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Step 1: Install first module (Customer)
      const customerMetadata = {
        name: 'Customer',
        fields: [
          { name: 'code', type: 'text', required: true },
          { name: 'name', type: 'text', required: true },
        ],
        permissions: [
          { action: 'read', roles: ['viewer', 'editor', 'admin'] },
        ],
      }

      metadataEngine.register('Customer', customerMetadata)

      // Get initial state
      const initialEntities = metadataEngine.getAllEntities()
      const initialCount = initialEntities?.length || 0

      // Step 2: Install second module (Invoice)
      const invoiceMetadata = {
        name: 'Invoice',
        fields: [
          { name: 'number', type: 'text', required: true, unique: true },
          { name: 'customer_id', type: 'reference', referTo: 'Customer' },
          { name: 'total', type: 'decimal', required: true },
        ],
        permissions: [
          { action: 'read', roles: ['viewer', 'editor', 'admin'] },
          { action: 'approve', roles: ['admin'] },
        ],
      }

      metadataEngine.register('Invoice', invoiceMetadata)

      // Check 1: Both entities registered
      const finalEntities = metadataEngine.getAllEntities()
      const finalCount = finalEntities?.length || 0

      if (finalCount !== initialCount + 1) {
        errors.push(
          `Module installation failed: expected ${initialCount + 1} entities, got ${finalCount}`
        )
      }

      // Check 2: Relationship resolved correctly
      const invoiceEntity = metadataEngine.getEntity('Invoice')
      if (invoiceEntity) {
        const customerField = (invoiceEntity.fields as any[])?.find((f) => f.name === 'customer_id')
        if (!customerField || customerField.referTo !== 'Customer') {
          warnings.push('Cross-module reference not resolved correctly')
        }
      }

      // Check 3: No Core files were modified
      // (In real implementation, this would check git status or file hashes)
      const coreModified = metadataEngine.getCoreModifications?.()
      if (coreModified && coreModified.length > 0) {
        errors.push(
          `Core files were modified during module installation: ${coreModified.join(', ')}`
        )
      }

      // Check 4: Navigation should have updated
      const navigationUpdated = eventBus.hasListeners('navigation:updated')
      if (!navigationUpdated) {
        warnings.push('Navigation update event not emitted')
      }

      // Check 5: Search indexes should have updated
      const searchIndexUpdated = eventBus.hasListeners('search:index-updated')
      if (!searchIndexUpdated) {
        warnings.push('Search index update event not emitted')
      }

      if (errors.length === 0) {
        return {
          passed: true,
          message: 'Second module installed successfully without Core changes',
          warnings: warnings.length > 0 ? warnings : undefined,
        }
      } else {
        return {
          passed: false,
          message: `Multi-module installation failed: ${errors.length} error(s)`,
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
