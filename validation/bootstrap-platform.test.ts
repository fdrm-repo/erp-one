import assert from 'node:assert/strict'
import { bootstrapPlatformRuntime } from '../core/bootstrap-package.ts'
import { moduleSDK } from '../core/module-sdk.ts'
import { metadataEngine } from '../core/engines/metadata-engine.ts'
import { componentRegistry } from '../core/engines/component-registry.ts'
import { templateRegistry } from '../core/engines/template-registry.ts'

async function main() {
  moduleSDK.clear()
  metadataEngine.clear()
  componentRegistry.clear()
  templateRegistry.clear()

  await bootstrapPlatformRuntime()

  const moduleIds = moduleSDK.listModules().map((module) => module.id)

  assert(moduleIds.includes('core'))
  assert(moduleIds.includes('platform'))
  assert(moduleIds.includes('identity'))
  assert(moduleIds.includes('workspace'))
  assert(moduleIds.includes('documents'))
  assert(moduleIds.includes('notifications'))
  assert(moduleIds.includes('approvals'))
  assert(moduleIds.includes('diagnostics'))

  const stats = metadataEngine.getStats()
  assert(stats.entities > 0, 'Expected bootstrap entities to be registered')
  assert(componentRegistry.getStats().totalComponents > 0, 'Expected bootstrap components to be registered')
  assert(templateRegistry.getStats().totalTemplates > 0, 'Expected bootstrap templates to be registered')

  console.log('bootstrap-platform test passed')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
