import io from 'socket.io-client'

const API_BASE_URL = 'http://localhost:3001/api'

class GoogleAdsService {
  constructor() {
    this.userId = this.generateUserId()
    this.isConnected = false
    this.currentAccount = null
    this.socket = null
    this.mode = 'demo' // 'demo' or 'real'
  }

  generateUserId() {
    return localStorage.getItem('google_ads_user_id') || 
           (() => {
             const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
             localStorage.setItem('google_ads_user_id', id)
             return id
           })()
  }

  // Set mode (demo or real)
  setMode(mode) {
    this.mode = mode
  }

  // Initialize WebSocket connection
  initializeSocket() {
    if (!this.socket) {
      this.socket = io('http://localhost:3001')
      
      this.socket.on('connect', () => {
        console.log('Connected to real-time monitoring')
      })
      
      this.socket.on('campaign-update', (data) => {
        console.log('Campaign update received:', data)
        // Trigger custom event for components to listen to
        window.dispatchEvent(new CustomEvent('campaignUpdate', { detail: data }))
      })
      
      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time monitoring')
      })
    }
  }

  // Join account for real-time updates
  joinAccount(accountId) {
    if (this.socket) {
      this.socket.emit('join-account', accountId)
    }
  }

  // DEMO MODE METHODS

  // Demo authentication (no real OAuth)
  async authenticateDemo() {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/demo-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        this.isConnected = true
        this.initializeSocket()
        return {
          success: true,
          userInfo: data.userInfo,
          message: 'Demo-Authentifizierung erfolgreich!'
        }
      }
      
      throw new Error(data.error || 'Demo authentication failed')
    } catch (error) {
      console.error('Demo auth error:', error)
      throw error
    }
  }

  // Get demo accounts
  async getDemoAccounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/demo/accounts/${this.userId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch demo accounts')
      }
      
      return data.accounts
    } catch (error) {
      console.error('Error fetching demo accounts:', error)
      throw error
    }
  }

  // Create demo campaign
  async createDemoCampaign(accountId, campaignData) {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/demo/campaign/${this.userId}/${accountId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create demo campaign')
      }
      
      return data
    } catch (error) {
      console.error('Error creating demo campaign:', error)
      throw error
    }
  }

  // Get demo campaigns
  async getDemoCampaigns(accountId, startupIdea = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/demo/campaigns/${this.userId}/${accountId}?startupIdea=${encodeURIComponent(startupIdea)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch demo campaigns')
      }
      
      return data.campaigns
    } catch (error) {
      console.error('Error fetching demo campaigns:', error)
      throw error
    }
  }

  // Get demo campaign insights
  async getDemoCampaignInsights(accountId, campaignId) {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/demo/campaign/${this.userId}/${accountId}/${campaignId}/insights`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch demo insights')
      }
      
      return data.insights
    } catch (error) {
      console.error('Error fetching demo insights:', error)
      throw error
    }
  }

  // REAL MODE METHODS

  // Real OAuth flow - Get authorization URL
  async getAuthUrl() {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/auth-url?userId=${this.userId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get auth URL')
      }
      
      return data.authUrl
    } catch (error) {
      console.error('Error getting auth URL:', error)
      throw error
    }
  }

  // Real OAuth flow - Start authentication
  async authenticateReal() {
    try {
      const authUrl = await this.getAuthUrl()
      
      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'googleAdsAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )
      
      // Monitor popup for completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            
            // Check if authentication was successful
            this.checkAuthStatus()
              .then(result => {
                if (result.success) {
                  this.isConnected = true
                  this.initializeSocket()
                  resolve({
                    success: true,
                    userInfo: result.userInfo,
                    message: 'Google Ads Authentifizierung erfolgreich!'
                  })
                } else {
                  reject(new Error('Authentication failed'))
                }
              })
              .catch(reject)
          }
        }, 1000)
        
        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          if (!popup.closed) {
            popup.close()
          }
          reject(new Error('Authentication timeout'))
        }, 300000)
      })
    } catch (error) {
      console.error('Real auth error:', error)
      throw error
    }
  }

  // Check authentication status
  async checkAuthStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/accounts/${this.userId}`)
      
      if (response.ok) {
        return { success: true, userInfo: { email: 'user@example.com', name: 'Real User' } }
      }
      
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }

  // Get real accounts
  async getRealAccounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/accounts/${this.userId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch real accounts')
      }
      
      return data.campaigns || [] // Adjusted for current backend structure
    } catch (error) {
      console.error('Error fetching real accounts:', error)
      throw error
    }
  }

  // Create real campaign
  async createRealCampaign(accountId, campaignData) {
    try {
      const response = await fetch(`${API_BASE_URL}/google-ads/campaign/${this.userId}/${accountId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create real campaign')
      }
      
      return data
    } catch (error) {
      console.error('Error creating real campaign:', error)
      throw error
    }
  }

  // UNIFIED METHODS (work with both demo and real)

  // Authenticate based on current mode
  async authenticate() {
    if (this.mode === 'demo') {
      return await this.authenticateDemo()
    } else {
      return await this.authenticateReal()
    }
  }

  // Get accounts based on current mode
  async getAccounts() {
    if (this.mode === 'demo') {
      return await this.getDemoAccounts()
    } else {
      return await this.getRealAccounts()
    }
  }

  // Create campaign based on current mode
  async createCampaign(accountId, campaignData) {
    if (this.mode === 'demo') {
      return await this.createDemoCampaign(accountId, campaignData)
    } else {
      return await this.createRealCampaign(accountId, campaignData)
    }
  }

  // Get campaigns based on current mode
  async getCampaigns(accountId, startupIdea = '') {
    if (this.mode === 'demo') {
      return await this.getDemoCampaigns(accountId, startupIdea)
    } else {
      // Real campaigns would be fetched differently
      return []
    }
  }

  // Get campaign insights based on current mode
  async getCampaignInsights(accountId, campaignId) {
    if (this.mode === 'demo') {
      return await this.getDemoCampaignInsights(accountId, campaignId)
    } else {
      // Real insights would be fetched differently
      return {}
    }
  }

  // Disconnect
  disconnect() {
    this.isConnected = false
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      mode: this.mode,
      userId: this.userId,
      currentAccount: this.currentAccount
    }
  }
}

// Export singleton instance
export default new GoogleAdsService()