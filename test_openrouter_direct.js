import fs from 'fs'

// Read key from .env.local
const envContent = fs.readFileSync('.env.local', 'utf-8')
const keyMatch = envContent.match(/OPENROUTER_API_KEY=(.*)/)
const key = keyMatch ? keyMatch[1].trim() : ''

console.log('Testing direct OpenRouter API call...')
console.log('Key length:', key.length, 'Key prefix:', key.slice(0, 10))

async function testDirect() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://focas-ai.app',
        'X-Title': 'FOCAS AI Startup Advisor',
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-4b:free',
        messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
        max_tokens: 30,
      }),
    })

    console.log('Response Status:', res.status, res.statusText)
    const body = await res.text()
    console.log('Response Body:', body)
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

testDirect()
