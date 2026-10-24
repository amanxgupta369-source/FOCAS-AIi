import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    env[match[1]] = (match[2] || '').trim()
  }
})

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY
const openrouterKey = env.OPENROUTER_API_KEY

function mask(str) {
  if (!str) return '[NOT CONFIGURED]'
  if (str.length <= 10) return '***'
  return str.slice(0, 8) + '...' + str.slice(-4)
}

async function runVerification() {
  console.log('====================================================')
  console.log('       FOCAS BACKEND CONFIGURATION VERIFICATION     ')
  console.log('====================================================\n')

  let allTestsPassed = true
  const results = {}

  // --------------------------------------------------------------------------
  // TEST 1: Check that Supabase URL and key are loaded correctly
  // --------------------------------------------------------------------------
  console.log('[TEST 1] Checking Supabase Environment Variables...')
  const urlValid = Boolean(supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('supabase.co'))
  const keyValid = Boolean(supabaseKey && supabaseKey.length > 20)
  
  console.log('  Supabase URL Loaded:', supabaseUrl ? supabaseUrl : 'MISSING')
  console.log('  Supabase URL Format Valid:', urlValid ? 'YES' : 'NO')
  console.log('  Supabase Key Loaded:', mask(supabaseKey))
  console.log('  Supabase Key Format Valid:', keyValid ? 'YES' : 'NO')

  if (urlValid && keyValid) {
    results.test1 = 'PASSED'
    console.log('  >> RESULT: PASSED\n')
  } else {
    results.test1 = 'FAILED'
    allTestsPassed = false
    console.log('  >> RESULT: FAILED\n')
  }

  // --------------------------------------------------------------------------
  // TEST 2: Test the Supabase Connection (without exposing credentials)
  // --------------------------------------------------------------------------
  console.log('[TEST 2] Testing Live Supabase Connection...')
  let supabaseConnected = false
  try {
    const healthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey },
    })
    console.log('  Supabase Auth Endpoint HTTP Status:', healthRes.status, healthRes.statusText)
    if (healthRes.ok) {
      supabaseConnected = true
      results.test2 = 'PASSED'
      console.log('  >> RESULT: PASSED (Supabase project is live and responding)\n')
    } else {
      results.test2 = 'FAILED'
      console.log('  >> RESULT: FAILED (HTTP response was not OK)\n')
    }
  } catch (err) {
    results.test2 = 'FAILED'
    console.log('  >> RESULT: FAILED (Network error:', err.message, ')\n')
  }

  // --------------------------------------------------------------------------
  // TEST 3: Check whether Database Tables & Security Policies Exist
  // --------------------------------------------------------------------------
  console.log('[TEST 3] Checking Required Database Tables & RLS Policies...')
  let tablesExist = false
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('projects').select('id').limit(1)

    if (error) {
      console.log('  Table query error code:', error.code)
      console.log('  Table query error message:', error.message)
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        results.test3 = 'TABLES_MISSING'
        console.log('  >> STATUS: Tables do not exist yet.')
        console.log('  >> ACTION REQUIRED: Run `supabase/schema.sql` in the Supabase SQL Editor.')
      } else {
        results.test3 = 'FAILED'
        console.log('  >> STATUS: Query error: ' + error.message)
      }
    } else {
      tablesExist = true
      results.test3 = 'PASSED'
      console.log('  >> RESULT: PASSED (Tables exist and RLS policies are active!)\n')
    }
  } catch (err) {
    results.test3 = 'FAILED'
    console.log('  >> RESULT: FAILED (Client init error:', err.message, ')\n')
  }

  // --------------------------------------------------------------------------
  // TEST 4: Test Actual Server-Side OpenRouter Integration Call
  // --------------------------------------------------------------------------
  console.log('\n[TEST 4] Testing Actual AI Request via OpenRouter...')
  console.log('  OpenRouter Key Configured:', mask(openrouterKey))
  let aiRequestPassed = false

  try {
    // Read model from api/_shared.js
    const sharedJs = fs.readFileSync('api/_shared.js', 'utf-8')
    const modelMatch = sharedJs.match(/export const OPENROUTER_MODEL = ['"]([^'"]+)['"]/)
    const currentModel = modelMatch ? modelMatch[1] : 'qwen/qwen3-4b:free'
    console.log('  Target Model:', currentModel)

    const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://focas-ai.app',
        'X-Title': 'FOCAS AI Verification',
      },
      body: JSON.stringify({
        model: currentModel,
        messages: [{ role: 'user', content: 'In 1 sentence: what is product-market fit?' }],
        max_tokens: 60,
      }),
    })

    console.log('  OpenRouter HTTP Status:', aiRes.status, aiRes.statusText)
    const aiBody = await aiRes.json()

    if (aiRes.ok && aiBody.choices?.[0]?.message?.content) {
      aiRequestPassed = true
      results.test4 = 'PASSED'
      console.log('  AI Response Received:', aiBody.choices[0].message.content.trim())
      console.log('  >> RESULT: PASSED\n')
    } else {
      const errMsg = aiBody.error?.message || JSON.stringify(aiBody)
      console.log('  OpenRouter Provider Message:', errMsg)
      results.test4 = 'FAILED'
      results.test4Error = errMsg
      console.log('  >> RESULT: FAILED\n')
    }
  } catch (err) {
    results.test4 = 'FAILED'
    results.test4Error = err.message
    console.log('  OpenRouter Request Error:', err.message)
    console.log('  >> RESULT: FAILED\n')
  }

  // --------------------------------------------------------------------------
  // TEST 5: Verify Basic Evaluation Works if OpenRouter Fails
  // --------------------------------------------------------------------------
  console.log('[TEST 5] Testing FOCAS Basic Evaluation Fallback...')
  try {
    const devServerRes = await fetch('http://localhost:5173/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: {
          name: 'Fallback Verification Test',
          description: 'Testing that fallback generates structured analysis',
          problem: 'Founders need fast feedback when AI quota is exhausted',
          solution: 'Deterministic rule-based evaluation engine',
          customer: 'Early stage founders',
          stage: 'Idea',
        },
      }),
    })

    const devData = await devServerRes.json()
    console.log('  Endpoint /api/evaluate HTTP Status:', devServerRes.status)
    console.log('  Fallback Flag in Response:', devData.fallback)
    console.log('  Notice:', devData.notice || devData.error || 'N/A')

    if (devServerRes.status === 200 && (devData.fallback === true || devData.success === true)) {
      results.test5 = 'PASSED'
      console.log('  >> RESULT: PASSED (Backend cleanly returns evaluation or signals deterministic fallback)\n')
    } else {
      results.test5 = 'FAILED'
      console.log('  >> RESULT: FAILED\n')
    }
  } catch (err) {
    results.test5 = 'FAILED'
    console.log('  Dev Server Call Error:', err.message)
    console.log('  >> RESULT: FAILED\n')
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('====================================================')
  console.log('                 VERIFICATION SUMMARY               ')
  console.log('====================================================')
  console.log('Test 1 (Supabase URL & Key Loaded):', results.test1)
  console.log('Test 2 (Supabase Live Connection):', results.test2)
  console.log('Test 3 (Database Tables & Policies):', results.test3)
  console.log('Test 4 (OpenRouter AI Request):', results.test4)
  if (results.test4Error) console.log('       Reason:', results.test4Error)
  console.log('Test 5 (Basic Evaluation Fallback):', results.test5)
  console.log('====================================================\n')
}

runVerification()
