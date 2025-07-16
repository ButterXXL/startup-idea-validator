import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Landing page operations
export const landingPageService = {
  // Create a new landing page
  async createLandingPage(data) {
    const { data: result, error } = await supabase
      .from('landing_pages')
      .insert({
        slug: data.slug,
        title: data.title,
        subline: data.subline,
        cta: data.cta,
        startup_idea: data.startupIdea,
        target_customer: data.targetCustomer,
        problem_solved: data.problemSolved,
        content: data.content,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating landing page:', error)
      throw error
    }

    return result
  },

  // Get landing page by slug
  async getLandingPageBySlug(slug) {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching landing page:', error)
      throw error
    }

    return data
  },

  // Store a lead
  async storeLead(landingPageId, leadData) {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        landing_page_id: landingPageId,
        email: leadData.email,
        name: leadData.name,
        phone: leadData.phone,
        message: leadData.message,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing lead:', error)
      throw error
    }

    return data
  },

  // Get leads for a landing page
  async getLeadsForLandingPage(landingPageId) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('landing_page_id', landingPageId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      throw error
    }

    return data
  }
}

export default landingPageService 