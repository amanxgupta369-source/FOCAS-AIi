/**
 * Comprehensive Backend Audit Test Script for FOCAS AI
 */
import fs from 'fs'

const BASE_URL = 'http://localhost:5173'

async function runAudit() {
  console.log('=== FOCAS AI BACKEND AUDIT SUITE ===\n')

  // 1. Test /api/status
  try {
    const res = await fetch(`${BASE_URL}/api/status`)
    const data = await res.json()
    console.log('[TEST 1] /api/status:')
    console.log('  Status code:', res.status)
    console.log('  Online:', data.online)
    console.log('  Provider:', data.provider)
    console.log('  Model:', data.model)
    console.log('  hasOpenRouterKey:', data.hasOpenRouterKey)
    console.log('  Key Exposed in response:', JSON.stringify(data).includes('sk-or-v1'))
    console.log('  Telemetry:', JSON.stringify(data.telemetry))
  } catch (err) {
    console.error('[TEST 1 FAILED]:', err.message)
  }

  // 2. Test /api/health
  try {
    const res = await fetch(`${BASE_URL}/api/health`)
    const data = await res.json()
    console.log('\n[TEST 2] /api/health:')
    console.log('  Status code:', res.status)
    console.log('  Response:', JSON.stringify(data))
  } catch (err) {
    console.error('[TEST 2 FAILED]:', err.message)
  }

  // 3. Test Payload > 64KB (Request Size Enforcement)
  try {
    const largeStr = 'A'.repeat(70000)
    const res = await fetch(`${BASE_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: { name: largeStr } }),
    })
    console.log('\n[TEST 3] Payload > 64KB (Expect 413):')
    console.log('  Status code:', res.status)
    const data = await res.json()
    console.log('  Response:', JSON.stringify(data))
  } catch (err) {
    console.error('[TEST 3 FAILED]:', err.message)
  }

  // 4. Test Missing Form Object (Input Validation)
  try {
    const res = await fetch(`${BASE_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 123 }),
    })
    console.log('\n[TEST 4] Missing "form" (Expect 400):')
    console.log('  Status code:', res.status)
    const data = await res.json()
    console.log('  Response:', JSON.stringify(data))
  } catch (err) {
    console.error('[TEST 4 FAILED]:', err.message)
  }

  // 5. Test Actual /api/evaluate Call (Live OpenRouter Call with Qwen3 4B)
  try {
    console.log('\n[TEST 5] Live Evaluation Call via OpenRouter:')
    const res = await fetch(`${BASE_URL}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: {
          name: 'Audit Roast Test Coffee',
          description: 'A tool for artisan coffee roasters to track green bean inventory freshness',
          problem: 'Small roasters lose money when green coffee beans go stale in storage',
          solution: 'Automated sensor-based alert system for humidity and storage time',
          customer: 'Independent specialty coffee roasters',
          demand: 'Talked to 5 local roasters who complained about warehouse humidity spoilage',
          stage: 'Idea',
        },
      }),
    })
    const data = await res.json()
    console.log('  Status code:', res.status)
    console.log('  Success:', data.success)
    console.log('  Provider:', data.provider)
    console.log('  Model:', data.model)
    console.log('  Fallback active:', data.fallback || false)
    console.log('  Is Quota Exceeded:', data.isQuotaExceeded || false)
    if (data.data) {
      console.log('  Executive Summary Idea:', data.data.executiveSummary?.ideaSimple)
      console.log('  Biggest Concern:', data.data.executiveSummary?.biggestConcern)
      console.log('  Score:', data.data.score)
    } else {
      console.log('  Notice/Error:', data.notice || data.error)
    }
  } catch (err) {
    console.error('[TEST 5 FAILED]:', err.message)
  }

  // 6. Test Live /api/chat Call
  try {
    console.log('\n[TEST 6] Live Chat Call:')
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: { name: 'Audit Test' },
        messages: [{ role: 'user', content: 'What is the fastest way to test customer demand?' }],
      }),
    })
    const data = await res.json()
    console.log('  Status code:', res.status)
    console.log('  Success:', data.success)
    console.log('  Provider:', data.provider)
    console.log('  Reply preview:', (data.message || '').slice(0, 150) + '...')
  } catch (err) {
    console.error('[TEST 6 FAILED]:', err.message)
  }

  console.log('\n=== AUDIT SUITE COMPLETE ===')
}

runAudit()
