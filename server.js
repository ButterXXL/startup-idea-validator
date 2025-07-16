import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Google OAuth2 Client for authentication
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  process.env.GOOGLE_ADS_REDIRECT_URI || 'http://localhost:3001/api/google-ads/auth-callback'
)

// Supabase client for database operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
)

// Store user sessions and tokens
const userSessions = new Map()

// Store socket connections
const activeConnections = new Map()

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('join-account', (accountId) => {
    socket.join(`account-${accountId}`)
    activeConnections.set(socket.id, accountId)
    console.log(`Socket ${socket.id} joined account ${accountId}`)
  })
  
  socket.on('disconnect', () => {
    activeConnections.delete(socket.id)
    console.log('Client disconnected:', socket.id)
  })
})

// Helper function to generate demo data
const generateDemoData = (type, userInput = {}) => {
  const baseResponse = {
    success: true,
    timestamp: new Date().toISOString(),
    demo: true
  }

  switch (type) {
    case 'accounts':
      return {
        ...baseResponse,
        accounts: [
          {
            id: '1234567890',
            name: 'Demo Account',
            currency: 'EUR',
            timezone: 'Europe/Berlin',
            status: 'ENABLED'
          }
        ]
      }
    
    case 'campaigns':
      return {
        ...baseResponse,
        campaigns: [
          {
            id: `demo-${Date.now()}`,
            name: `${userInput.startupIdea || 'Startup'} - Validierung`,
            status: 'ACTIVE',
            budget: { amount: 2500, currency: 'EUR' },
            impressions: Math.floor(Math.random() * 10000) + 5000,
            clicks: Math.floor(Math.random() * 500) + 200,
            cost: Math.floor(Math.random() * 200) + 100,
            ctr: ((Math.random() * 2) + 1).toFixed(2),
            created: new Date().toISOString()
          }
        ]
      }
    
    case 'campaign-insights':
      return {
        ...baseResponse,
        insights: {
          impressions: Math.floor(Math.random() * 10000) + 5000,
          clicks: Math.floor(Math.random() * 500) + 200,
          cost: Math.floor(Math.random() * 200) + 100,
          ctr: ((Math.random() * 2) + 1).toFixed(2),
          conversions: Math.floor(Math.random() * 20) + 5,
          costPerConversion: ((Math.random() * 50) + 10).toFixed(2),
          conversionRate: ((Math.random() * 5) + 1).toFixed(2)
        }
      }
    
    default:
      return baseResponse
  }
}

// Real Google Ads API functions (placeholders for actual implementation)
const createRealCampaign = async (accountId, campaignData, accessToken) => {
  // This would use the actual Google Ads API
  // For now, return a realistic response structure
  return {
    success: true,
    campaignId: `real-${Date.now()}`,
    name: campaignData.name,
    status: 'PAUSED', // New campaigns start paused
    budget: campaignData.budget,
    message: 'Campaign created successfully. Please review and activate in Google Ads.',
    googleAdsUrl: `https://ads.google.com/aw/campaigns?campaignId=real-${Date.now()}`
  }
}

const getRealCampaigns = async (accountId, accessToken) => {
  // This would fetch real campaigns from Google Ads API
  return {
    success: true,
    campaigns: [
      {
        id: `real-${Date.now()}`,
        name: 'Real Campaign Example',
        status: 'ACTIVE',
        budget: { amount: 2500, currency: 'EUR' },
        impressions: 8432,
        clicks: 245,
        cost: 156.78,
        ctr: '2.91',
        created: new Date().toISOString()
      }
    ]
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// 1. OAuth URL Generation (for REAL Google Ads)
app.get('/api/google-ads/auth-url', (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/adwords',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state: req.query.userId || 'google_ads_oauth',
      prompt: 'consent'
    })
    
    res.json({ authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    res.status(500).json({ error: 'Failed to generate auth URL' })
  }
})

// 2. OAuth Callback (for REAL Google Ads)
app.get('/api/google-ads/auth-callback', async (req, res) => {
  try {
    const { code, state } = req.query
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' })
    }

    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    // Store user session
    const userId = state || 'default_user'
    userSessions.set(userId, {
      tokens,
      authenticated: true,
      timestamp: new Date().toISOString()
    })
    
    // Redirect to success page
    res.redirect(`/google-ads-callback.html?success=true&userId=${userId}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.redirect(`/google-ads-callback.html?error=${encodeURIComponent(error.message)}`)
  }
})

// 3. Get User Accounts (REAL)
app.get('/api/google-ads/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const session = userSessions.get(userId)
    
    if (!session || !session.authenticated) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    // For real implementation, you would fetch actual accounts here
    // For now, return a realistic demo account
    const accounts = await getRealCampaigns(null, session.tokens.access_token)
    res.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
})

// 4. Create Campaign (REAL)
app.post('/api/google-ads/campaign/:userId/:accountId', async (req, res) => {
  try {
    const { userId, accountId } = req.params
    const campaignData = req.body
    
    const session = userSessions.get(userId)
    if (!session || !session.authenticated) {
      return res.status(401).json({ error: 'User not authenticated' })
    }
    
    const result = await createRealCampaign(accountId, campaignData, session.tokens.access_token)
    res.json(result)
  } catch (error) {
    console.error('Error creating campaign:', error)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})

// DEMO ENDPOINTS (no authentication required)

// Demo OAuth simulation
app.post('/api/google-ads/demo-auth', (req, res) => {
  const { userId } = req.body
  
  // Simulate authentication
  userSessions.set(userId, {
    demo: true,
    authenticated: true,
    timestamp: new Date().toISOString()
  })
  
  res.json({ 
    success: true, 
    message: 'Demo authentication successful',
    userInfo: {
      email: 'demo@example.com',
      name: 'Demo User'
    }
  })
})

// Demo accounts
app.get('/api/google-ads/demo/accounts/:userId', (req, res) => {
  const accounts = generateDemoData('accounts')
  res.json(accounts)
})

// Demo campaigns
app.get('/api/google-ads/demo/campaigns/:userId/:accountId', (req, res) => {
  const campaigns = generateDemoData('campaigns', req.query)
  res.json(campaigns)
})

// Demo campaign creation
app.post('/api/google-ads/demo/campaign/:userId/:accountId', (req, res) => {
  const campaignData = req.body
  const result = {
    success: true,
    demo: true,
    campaignId: `demo-${Date.now()}`,
    name: campaignData.name,
    status: 'ACTIVE',
    budget: campaignData.budget,
    message: 'Demo campaign created successfully!',
    timestamp: new Date().toISOString()
  }
  
  // Simulate real-time updates via WebSocket
  setTimeout(() => {
    io.emit('campaign-update', {
      campaignId: result.campaignId,
      impressions: Math.floor(Math.random() * 1000) + 5000,
      clicks: Math.floor(Math.random() * 100) + 200,
      cost: Math.floor(Math.random() * 100) + 100,
      timestamp: new Date().toISOString()
    })
  }, 3000)
  
  res.json(result)
})

// Demo campaign insights
app.get('/api/google-ads/demo/campaign/:userId/:accountId/:campaignId/insights', (req, res) => {
  const insights = generateDemoData('campaign-insights')
  res.json(insights)
})

// Start monitoring for demo campaigns (simulates real-time updates)
const startDemoMonitoring = () => {
  setInterval(() => {
    // Simulate campaign updates for connected clients
    activeConnections.forEach((accountId, socketId) => {
      const socket = io.sockets.sockets.get(socketId)
      if (socket) {
        socket.emit('campaign-update', {
          accountId,
          campaignId: `demo-${accountId}`,
          impressions: Math.floor(Math.random() * 1000) + 5000,
          clicks: Math.floor(Math.random() * 100) + 200,
          cost: Math.floor(Math.random() * 100) + 100,
          timestamp: new Date().toISOString()
        })
      }
    })
  }, 30000) // Update every 30 seconds
}

// Lead capture endpoint
app.post('/api/leads', async (req, res) => {
  try {
    const { landingPageId, email, name, phone, message } = req.body

    if (!landingPageId || !email || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Landing Page ID, Email und Name sind erforderlich' 
      })
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        landing_page_id: landingPageId,
        email,
        name,
        phone: phone || null,
        message: message || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error storing lead:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Fehler beim Speichern der Anfrage' 
      })
    }

    res.json({ 
      success: true, 
      lead: data 
    })
  } catch (error) {
    console.error('Error in lead capture:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Interner Serverfehler' 
    })
  }
})

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Google Ads API server running on port ${PORT}`)
  console.log(`📊 Ready to monitor campaigns in real-time`)
  console.log(`🔌 WebSocket server initialized`)
  console.log(`🎯 Demo mode available at /api/google-ads/demo/*`)
  console.log(`🔐 Real mode available at /api/google-ads/* (requires OAuth)`)
  console.log(`📝 Lead capture available at /api/leads`)
  
  // Start demo monitoring
  startDemoMonitoring()
})