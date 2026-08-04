'use client'

import React, { useState, useEffect } from 'react'
import { validationSuite, createValidationScenario } from '@/validation'
import type { ValidationReport } from '@/validation'

export default function ValidationRunner() {
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runValidation = async () => {
    setIsRunning(true)
    setError(null)
    try {
      // Register scenarios
      const { scenario1HelloWorld } = await import('@/validation/scenarios/scenario-1-hello-world')
      const { scenario2MultiModule } = await import('@/validation/scenarios/scenario-2-multi-module')

      validationSuite.registerScenario(scenario1HelloWorld)
      validationSuite.registerScenario(scenario2MultiModule)

      // Run
      const result = await validationSuite.run()
      setReport(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    // Auto-run on component mount for development
    if (!report && !isRunning) {
      runValidation()
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Platform Validation Suite</h1>
        <button
          onClick={runValidation}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Validation'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {report && (
        <div className="space-y-4">
          <div className={`p-6 rounded-lg border-2 ${
            report.architectureValid 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <h2 className="text-xl font-bold mb-2">
              {report.architectureValid ? '✓ VALIDATION PASSED' : '✗ VALIDATION FAILED'}
            </h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{report.totalScenarios}</div>
                <div className="text-sm text-gray-600">Total Scenarios</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{report.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">{report.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{report.warnings}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Duration: {(report.duration / 1000).toFixed(2)}s
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold">Scenario Results</h3>
            {report.scenarios.map((scenario) => (
              <div
                key={scenario.scenarioId}
                className={`p-4 border rounded-lg ${
                  scenario.passed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      {scenario.passed ? '✓' : '✗'} {scenario.scenarioId}
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">{scenario.message}</p>
                    {scenario.errors && scenario.errors.length > 0 && (
                      <div className="mt-2 text-sm text-red-700">
                        <p className="font-semibold">Errors:</p>
                        <ul className="list-disc list-inside">
                          {scenario.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {scenario.warnings && scenario.warnings.length > 0 && (
                      <div className="mt-2 text-sm text-yellow-700">
                        <p className="font-semibold">Warnings:</p>
                        <ul className="list-disc list-inside">
                          {scenario.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(scenario.duration / 1000).toFixed(3)}s
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!report.architectureValid && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-bold">
                ⚠️ Architecture Validation Failed
              </p>
              <p className="text-red-700 text-sm mt-2">
                Do not continue development until all scenarios pass. The foundation is broken.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
