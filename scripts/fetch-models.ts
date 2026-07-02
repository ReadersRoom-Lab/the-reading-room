async function run() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`)
  const json = await res.json()
  const models = json.models.map(m => m.name)
  console.log('Available models:', models.filter(m => m.includes('embed')))
}
run()
