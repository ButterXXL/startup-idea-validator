// API utility for communicating with backend
export const analyzeStartupIdea = async (formData) => {
  const prompt = `Bitte analysiere die folgende Startup-Idee basierend auf den Angaben:

Name: ${formData.firstName || 'Nicht angegeben'}
Idee: ${formData.startupIdea}
Zielgruppe: ${formData.idealCustomer}
Problem: ${formData.problemSolved}

Gib bitte eine strukturierte Bewertung mit einem Startup Score von 0–100, Feedback zu Zielgruppe, Marktpotenzial, USP, Monetarisierung und Empfehlungen.`

  // Debug: Check if API key is loaded
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND')
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Make sure VITE_OPENAI_API_KEY is set in your .env file.')
  }

  // Direct OpenAI API call
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein erfahrener Startup-Berater und Investor. Analysiere Startup-Ideen strukturiert und gib konstruktives Feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text()
    console.log('OpenAI Error Response:', errorText)
    throw new Error(`API Error: ${openaiResponse.status} - ${errorText}`)
  }

  const data = await openaiResponse.json()
  return data.choices[0].message.content
}

