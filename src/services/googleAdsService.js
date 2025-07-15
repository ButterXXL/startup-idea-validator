// Google Ads API Service
const API_BASE_URL = 'http://localhost:3001/api/google-ads';

class GoogleAdsService {
  constructor() {
    this.userId = this.generateUserId();
  }

  generateUserId() {
    // Generate a unique user ID for session management
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  async getAuthUrl() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth-url`);
      const data = await response.json();
      return data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw new Error('Failed to get Google Ads auth URL');
    }
  }

  async handleAuthCallback(code) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          userId: this.userId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('googleAdsConnected', 'true');
        localStorage.setItem('googleAdsUserId', this.userId);
        return true;
      }
      
      throw new Error(data.error || 'Authentication failed');
    } catch (error) {
      console.error('Error handling auth callback:', error);
      throw error;
    }
  }

  async getAccounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${this.userId}`);
      const data = await response.json();
      
      if (response.ok) {
        return data.accounts;
      }
      
      throw new Error(data.error || 'Failed to fetch accounts');
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async createCampaign(campaignData) {
    try {
      const response = await fetch(`${API_BASE_URL}/create-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          ...campaignData,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data.campaign;
      }
      
      throw new Error(data.error || 'Failed to create campaign');
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  async getCampaignPerformance(accountId, campaignId) {
    try {
      const response = await fetch(`${API_BASE_URL}/campaign/${this.userId}/${accountId}/${campaignId}`);
      const data = await response.json();
      
      if (response.ok) {
        return data.performance;
      }
      
      throw new Error(data.error || 'Failed to fetch campaign performance');
    } catch (error) {
      console.error('Error fetching campaign performance:', error);
      throw error;
    }
  }

  isConnected() {
    return localStorage.getItem('googleAdsConnected') === 'true';
  }

  disconnect() {
    localStorage.removeItem('googleAdsConnected');
    localStorage.removeItem('googleAdsUserId');
  }

  async authenticateUser() {
    return new Promise((resolve, reject) => {
      // Get auth URL
      this.getAuthUrl()
        .then(authUrl => {
          // Open popup window for OAuth
          const popup = window.open(
            authUrl,
            'google-ads-auth',
            'width=500,height=600,scrollbars=yes,resizable=yes'
          );

          // Listen for auth completion
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              
              // Check if authentication was successful
              if (this.isConnected()) {
                resolve(true);
              } else {
                reject(new Error('Authentication was cancelled or failed'));
              }
            }
          }, 1000);

          // Handle popup messages
          window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'GOOGLE_ADS_AUTH_SUCCESS') {
              popup.close();
              clearInterval(checkClosed);
              resolve(true);
            } else if (event.data.type === 'GOOGLE_ADS_AUTH_ERROR') {
              popup.close();
              clearInterval(checkClosed);
              reject(new Error(event.data.error));
            }
          });
        })
        .catch(reject);
    });
  }
}

export default new GoogleAdsService(); 