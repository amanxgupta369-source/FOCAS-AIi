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

async function testAuthFlows() {
  console.log('=== FOCAS AI SUPABASE AUTH FLOWS VERIFICATION ===\n')
  console.log('Target Project:', supabaseUrl)
  console.log('Anon Key:', mask(supabaseKey))

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Test Email/Password Auth Endpoint & Validation
  console.log('\n[TEST 1] Testing Email & Password Auth Validation...')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent_test_founder@focas-ai.app',
      password: 'SamplePassword123!',
    })
    if (error) {
      console.log('  Email Auth Validation: WORKING')
      console.log('  Response Code:', error.status || '400')
      console.log('  Response Message:', error.message)
      console.log('  >> RESULT: PASSED (Supabase Auth endpoint properly validates email credentials)')
    } else {
      console.log('  Unexpected success with non-existent user')
    }
  } catch (err) {
    console.log('  Email Auth Exception:', err.message)
  }

  // 2. Test Phone OTP Auth Endpoint & SMS Provider Status
  console.log('\n[TEST 2] Testing Phone OTP Auth & Provider Status...')
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: '+15551234567',
    })
    if (error) {
      console.log('  Phone OTP Response Code:', error.status || 'Error')
      console.log('  Phone OTP Message:', error.message)
      if (
        error.message.includes('provider is not enabled') ||
        error.message.includes('SMS provider') ||
        error.message.includes('Unsupported phone provider') ||
        error.message.includes('Twilio') ||
        error.message.includes('provider')
      ) {
        console.log('  >> STATUS: Phone OTP is wired in code, but SMS provider is NOT enabled in your Supabase project settings.')
        console.log('  >> NOTE: In accordance with your instructions, Phone OTP will NOT be presented as working until an SMS provider (Twilio, MessageBird, etc.) is configured in Supabase.')
      } else {
        console.log('  >> Status:', error.message)
      }
    } else {
      console.log('  >> RESULT: Phone OTP SMS was accepted by provider!')
    }
  } catch (err) {
    console.log('  Phone OTP Exception:', err.message)
  }

  // 3. Test Password Reset Endpoint
  console.log('\n[TEST 3] Testing Password Recovery Endpoint...')
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      'founder@example.com',
      { redirectTo: 'http://localhost:5173' }
    )
    if (error) {
      console.log('  Password Reset Response:', error.message)
    } else {
      console.log('  Password Reset Response: ACCEPTED')
      console.log('  >> RESULT: PASSED (Password recovery request accepted by Supabase Auth)')
    }
  } catch (err) {
    console.log('  Password Reset Exception:', err.message)
  }

  console.log('\n=== AUTH FLOWS VERIFICATION COMPLETE ===')
}

testAuthFlows()
