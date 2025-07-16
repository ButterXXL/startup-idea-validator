import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'
import landingPageService from './database.js'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export const landingPageGenerator = {
  // Generate landing page content using OpenAI
  async generateContent(startupIdea, targetCustomer, problemSolved) {
    const prompt = `
Du bist ein Experte für Landing Page Copywriting. Erstelle eine überzeugende Landing Page für folgende Startup-Idee:

Startup-Idee: ${startupIdea}
Zielgruppe: ${targetCustomer}
Problem das gelöst wird: ${problemSolved}

Erstelle folgende Inhalte:

1. TITEL (Headline): Ein kraftvoller, aufmerksamkeitsstarker Titel (max. 10 Wörter)
2. SUBLINE: Eine erklärende Unterzeile, die den Nutzen verdeutlicht (max. 20 Wörter)
3. CTA (Call-to-Action): Ein handlungsauffordernder Button-Text (max. 4 Wörter)
4. CONTENT: Einen ausführlichen Landing Page Text mit:
   - Hero-Sektion
   - Problem-Beschreibung
   - Lösung-Präsentation
   - Nutzen/Benefits
   - Social Proof Platzhalter
   - Finaler Call-to-Action

Antworte im JSON-Format:
{
  "title": "...",
  "subline": "...",
  "cta": "...",
  "content": "..."
}

Schreibe auf Deutsch und verwende eine überzeugende, vertrauensvolle Sprache.
`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für Landing Page Copywriting und antwortest immer im JSON-Format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const response = completion.choices[0].message.content
      
      // Parse JSON response
      const cleanedResponse = response.replace(/```json|```/g, '').trim()
      const generatedContent = JSON.parse(cleanedResponse)

      return generatedContent
    } catch (error) {
      console.error('Error generating landing page content:', error)
      throw new Error('Fehler beim Generieren der Landing Page Inhalte')
    }
  },

  // Create a complete landing page with generated content
  async createLandingPage(startupIdea, targetCustomer, problemSolved) {
    try {
      // Generate content using OpenAI
      const generatedContent = await this.generateContent(startupIdea, targetCustomer, problemSolved)
      
      // Generate unique slug
      const slug = this.generateSlug(startupIdea)
      
      // Save to database
      const landingPage = await landingPageService.createLandingPage({
        slug,
        title: generatedContent.title,
        subline: generatedContent.subline,
        cta: generatedContent.cta,
        startupIdea,
        targetCustomer,
        problemSolved,
        content: generatedContent.content
      })

      return {
        success: true,
        landingPage,
        url: `${window.location.origin}/landing/${slug}`
      }
    } catch (error) {
      console.error('Error creating landing page:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Generate URL-friendly slug
  generateSlug(startupIdea) {
    const baseSlug = startupIdea
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
    
    const uniqueId = uuidv4().substring(0, 8)
    return `${baseSlug}-${uniqueId}`
  },

  // Get landing page by slug
  async getLandingPage(slug) {
    try {
      const landingPage = await landingPageService.getLandingPageBySlug(slug)
      return {
        success: true,
        landingPage
      }
    } catch (error) {
      console.error('Error fetching landing page:', error)
      return {
        success: false,
        error: 'Landing Page nicht gefunden'
      }
    }
  },

  // Store lead via backend API
  async storeLead(landingPageId, leadData) {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landingPageId,
          ...leadData
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Speichern der Anfrage')
      }

      return result
    } catch (error) {
      console.error('Error storing lead:', error)
      return {
        success: false,
        error: error.message || 'Fehler beim Speichern der Anfrage'
      }
    }
  }
}

export default landingPageGenerator 