// API utility for communicating with backend
export const analyzeStartupIdea = async (formData) => {
  const prompt = `Bitte analysiere die folgende Startup-Idee basierend auf den Angaben:

Name: ${formData.firstName || 'Nicht angegeben'}
Idee: ${formData.startupIdea}
Zielgruppe: ${formData.idealCustomer}
Problem: ${formData.problemSolved}

Gib bitte eine strukturierte Bewertung mit einem Startup Score von 0–100, Feedback zu Zielgruppe, Marktpotenzial, USP, Monetarisierung und Empfehlungen.`

  try {
    // Try to use backend API first
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })

    if (response.ok) {
      const data = await response.json()
      return data.analysis
    }
  } catch (error) {
    console.log('Backend API not available, using direct OpenAI API')
  }

  // Fallback to direct OpenAI API call (for development)
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
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
    throw new Error(`API Error: ${openaiResponse.status}`)
  }

  const data = await openaiResponse.json()
  return data.choices[0].message.content
}

