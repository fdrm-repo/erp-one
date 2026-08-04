/**
 * ONE Platform Validation Suite
 * 
 * Purpose: Prove that the entire architecture works without manual coding.
 * 
 * If any scenario requires manually editing React pages, routes, forms, tables,
 * permissions, APIs, or navigation, the architecture has FAILED.
 * 
 * Success = Everything generated from metadata alone.
 */

import { eventBus } from '@/core'

export interface ValidationScenario {
  id: string
  name: string
  description: string
  execute: () => Promise<ValidationResult>
}

export interface ValidationResult {
  scenarioId: string
  passed: boolean
  message: string
  errors?: string[]
  warnings?: string[]
  duration: number
  timestamp: Date
}

export interface ValidationReport {
  totalScenarios: number
  passed: number
  failed: number
  warnings: number
  scenarios: ValidationResult[]
  duration: number
  timestamp: Date
  architectureValid: boolean
}

/**
 * Validation Suite Manager
 * Orchestrates all validation scenarios
 */
export class ValidationSuite {
  private scenarios: Map<string, ValidationScenario> = new Map()
  private results: ValidationResult[] = []

  registerScenario(scenario: ValidationScenario): void {
    this.scenarios.set(scenario.id, scenario)
  }

  async run(): Promise<ValidationReport> {
    const startTime = Date.now()
    const results: ValidationResult[] = []

    console.log('[Validation] Starting Platform Validation Suite...')
    console.log(`[Validation] ${this.scenarios.size} scenarios to validate`)

    for (const [id, scenario] of this.scenarios) {
      console.log(`[Validation] Running: ${scenario.name}`)
      const result = await scenario.execute()
      results.push(result)

      if (!result.passed) {
        console.error(`[Validation] FAILED: ${scenario.name}`)
        console.error(`[Validation] ${result.message}`)
      } else {
        console.log(`[Validation] PASSED: ${scenario.name}`)
      }
    }

    const duration = Date.now() - startTime
    const passed = results.filter((r) => r.passed).length
    const failed = results.filter((r) => !r.passed).length
    const warnings = results.reduce((sum, r) => sum + (r.warnings?.length || 0), 0)

    const report: ValidationReport = {
      totalScenarios: results.length,
      passed,
      failed,
      warnings,
      scenarios: results,
      duration,
      timestamp: new Date(),
      architectureValid: failed === 0,
    }

    console.log('[Validation] Suite completed')
    console.log(`[Validation] Results: ${passed} passed, ${failed} failed, ${warnings} warnings`)
    console.log(`[Validation] Architecture Valid: ${report.architectureValid}`)

    this.results = results
    eventBus.emit('validation:complete', { report })

    return report
  }

  getResults(): ValidationResult[] {
    return this.results
  }

  hasFailures(): boolean {
    return this.results.some((r) => !r.passed)
  }
}

/**
 * Helper to create validation scenarios
 */
export function createValidationScenario(
  id: string,
  name: string,
  description: string,
  executor: () => Promise<{ passed: boolean; message: string; errors?: string[]; warnings?: string[] }>
): ValidationScenario {
  return {
    id,
    name,
    description,
    execute: async () => {
      const startTime = Date.now()
      try {
        const result = await executor()
        return {
          scenarioId: id,
          passed: result.passed,
          message: result.message,
          errors: result.errors,
          warnings: result.warnings,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      } catch (error) {
        return {
          scenarioId: id,
          passed: false,
          message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
          errors: [String(error)],
          duration: Date.now() - startTime,
          timestamp: new Date(),
        }
      }
    },
  }
}

export const validationSuite = new ValidationSuite()
