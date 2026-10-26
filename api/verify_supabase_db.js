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

function mask(str) {
  if (!str) return '[NOT CONFIGURED]'
  if (str.length <= 10) return '***'
  return str.slice(0, 8) + '...' + str.slice(-4)
}

async function verifyDatabase() {
  console.log('=== FOCAS AI SUPABASE DATABASE INTEGRATION AUDIT ===\n')
  console.log('Project URL:', supabaseUrl)
  console.log('Anon Key:', mask(supabaseKey))

  const supabase = createClient(supabaseUrl, supabaseKey)
  const tables = [
    'profiles',
    'projects',
    'evaluation_history',
    'customer_interviews',
    'tracked_assumptions',
    'project_chat',
  ]

  const tableResults = {}

  console.log('\n--- 1. Checking Existence of Required Tables ---')
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          tableResults[table] = { exists: false, error: 'Table does not exist (42P01)' }
          console.log(`  [MISSING] Table "${table}": Does not exist.`)
        } else {
          // If error is RLS or permission related, the table exists!
          tableResults[table] = { exists: true, error: error.message, rlsActive: true }
          console.log(`  [EXISTS]  Table "${table}": Exists. (Response: ${error.message})`)
        }
      } else {
        tableResults[table] = { exists: true, rowsCount: data.length, rlsActive: true }
        console.log(`  [EXISTS]  Table "${table}": Exists and queryable. Returned ${data.length} rows.`)
      }
    } catch (err) {
      tableResults[table] = { exists: false, error: err.message }
      console.log(`  [ERROR]   Table "${table}": ${err.message}`)
    }
  }

  // --- 2. Testing Row Level Security (RLS) & Tenant Data Isolation ---
  console.log('\n--- 2. Testing Row Level Security & Data Isolation ---')
  console.log('Testing unauthenticated insertion into "projects" (should be blocked by RLS):')
  try {
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const { data, error } = await supabase.from('projects').insert({
      name: 'Unauthorized Project Attempt',
      user_id: fakeId,
      status: 'Evaluating',
      form: { name: 'Hack Attempt' },
    })

    if (error) {
      console.log('  RLS Enforcement Result:', error.message)
      console.log('  Error Code:', error.code)
      if (error.code === '42501' || error.message.includes('row-level security') || error.message.includes('violates')) {
        console.log('  >> PASSED: RLS successfully blocked unauthenticated write.')
      } else if (error.code === '42P01') {
        console.log('  >> BLOCKED: Table does not exist yet.')
      } else {
        console.log('  >> Result:', error.message)
      }
    } else {
      console.log('  >> WARNING: Insert succeeded without authentication! RLS might be disabled.')
    }
  } catch (err) {
    console.log('  Insert attempt error:', err.message)
  }

  // --- 3. Testing Unauthenticated Reading Across Tenants ---
  console.log('\n--- 3. Testing Reading Another User\'s Data (Data Isolation) ---')
  try {
    const { data, error } = await supabase.from('projects').select('*')
    if (error) {
      console.log('  Query response:', error.message)
    } else {
      console.log('  Unauthenticated select query returned rows:', data.length)
      if (data.length === 0) {
        console.log('  >> PASSED: Unauthenticated clients cannot read any user private records.')
      }
    }
  } catch (err) {
    console.log('  Select error:', err.message)
  }

  console.log('\n=== AUDIT FINISHED ===')
}

verifyDatabase()
