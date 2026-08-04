/**
 * Platform Validation Suite
 * 
 * CRITICAL: Before building Rendering Engines, Studio, or any additional features,
 * the entire architecture must be validated.
 * 
 * If these scenarios fail, the foundation is broken.
 */

export { validationSuite, createValidationScenario } from './validation-suite'
export type { ValidationScenario, ValidationResult, ValidationReport } from './validation-suite'

// Import all scenarios
export { scenario1HelloWorld } from './scenarios/scenario-1-hello-world'
export { scenario2MultiModule } from './scenarios/scenario-2-multi-module'

/**
 * Initialize all validation scenarios
 */
export function initializeValidationScenarios() {
  const { validationSuite } = require('./validation-suite')
  const { scenario1HelloWorld } = require('./scenarios/scenario-1-hello-world')
  const { scenario2MultiModule } = require('./scenarios/scenario-2-multi-module')

  validationSuite.registerScenario(scenario1HelloWorld)
  validationSuite.registerScenario(scenario2MultiModule)

  // TODO: Register remaining scenarios
  // - scenario3ModuleRemoval
  // - scenario4AddField
  // - scenario5GenerateAPI
  // - scenario6GenerateOpenAPI
  // - scenario7GenerateGraphQL
  // - scenario8GenerateRenderTree
  // - scenario9GeneratePDF
  // - scenario10SwitchAdapter
  // - scenario11ReactAdapter
  // - scenario12FlutterAdapter
  // - scenario13EmailTemplate
  // - scenario14IncrementalCompile
  // - scenario15HotReload

  return validationSuite
}

/**
 * Run all validations
 */
export async function runValidationSuite() {
  const suite = initializeValidationScenarios()
  const report = await suite.run()

  if (!report.architectureValid) {
    console.error('[CRITICAL] Platform architecture validation FAILED')
    console.error('[CRITICAL] Do not continue development until all scenarios pass')
    process.exit(1)
  }

  console.log('[SUCCESS] All validation scenarios passed')
  return report
}
