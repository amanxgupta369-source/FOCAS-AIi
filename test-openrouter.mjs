import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf-8')
let apiKey = ''
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('OPENROUTER_API_KEY=')) {
    apiKey = line.trim().split('=')[1].trim()
  }
}

console.log('API Key present:', Boolean(apiKey), 'Length:', apiKey.length)

async function testOpenRouter() {
  const modelsToTest = [
    'qwen/qwen3-4b:free',
    'qwen/qwen-2.5-7b-instruct:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-3b-instruct:free',
  ]

  for (const model of modelsToTest) {
    console.log(`\nTesting model: ${model}...`)
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://focas-ai.app',
          'X-Title': 'FOCAS AI Test',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say "FOCAS AI works" in 3 words.' }],
          max_tokens: 20,
        }),
      })

      console.log(`Status: ${res.status} ${res.statusText}`)
      const text = await res.text()
      try {
        const json = JSON.parse(text)
        if (json.choices && json.choices[0]) {
          console.log('SUCCESS! Reply:', json.choices[0].message?.content)
        } else {
          console.log('Error payload:', JSON.stringify(json))
        }
      } catch {
        console.log('Raw text:', text.slice(0, 200))
      }
    } catch (err) {
      console.log('Network/Fetch error:', err.message)
    }
  }
}

testOpenRouter()
