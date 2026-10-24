// DEMO ONLY: canned replies, not a real AI model. Swap for an API call later.
const REPLIES = [
  'Start with the most dangerous assumption: will the target customer change behavior to use this? What would you accept as evidence they will not?',
  'Evidence that would disprove the idea: customers describe the problem but have never spent time or money trying to fix it.',
  'Validate demand first. Interview 8–10 target customers about their last real encounter with the problem before you build anything.',
  'You may be overlooking switching costs. Ask what the customer gives up by moving away from their current workaround.',
]
export async function askDemoAssistant(_q: string, turn: number): Promise<string> {
  await new Promise(r => setTimeout(r, 800))
  return REPLIES[turn % REPLIES.length]
}
