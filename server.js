const express = require('express');
const cors = require('cors');
const { GoogleAdsApi } = require('google-ads-api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Ads API configuration
const googleAdsClient = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

// Store for user sessions (in production, use Redis or database)
const userSessions = new Map();

// OAuth endpoints
app.get('/api/google-ads/auth-url', (req, res) => {
  try {
    const authUrl = googleAdsClient.getOAuthUrl({
      scope: 'https://www.googleapis.com/auth/adwords',
      redirect_uri: process.env.GOOGLE_ADS_REDIRECT_URI,
    });
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

app.post('/api/google-ads/auth-callback', async (req, res) => {
  try {
    const { code, userId } = req.body;
    
    const tokens = await googleAdsClient.getAccessToken(code, {
      redirect_uri: process.env.GOOGLE_ADS_REDIRECT_URI,
    });
    
    // Store tokens for user session
    userSessions.set(userId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google Ads' });
  }
});

// Get user's Google Ads accounts
app.get('/api/google-ads/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userSession = userSessions.get(userId);
    
    if (!userSession) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const customer = googleAdsClient.Customer({
      customer_id: process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID,
      refresh_token: userSession.refreshToken,
    });
    
    const accounts = await customer.customerClients.list();
    
    res.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch Google Ads accounts' });
  }
});

// Create personalized campaign
app.post('/api/google-ads/create-campaign', async (req, res) => {
  try {
    const { 
      userId, 
      accountId, 
      startupIdea, 
      idealCustomer, 
      problemSolved,
      validationType 
    } = req.body;
    
    const userSession = userSessions.get(userId);
    
    if (!userSession) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const customer = googleAdsClient.Customer({
      customer_id: accountId,
      refresh_token: userSession.refreshToken,
    });
    
    // Generate personalized campaign data
    const campaignData = generateCampaignData({
      startupIdea,
      idealCustomer,
      problemSolved,
      validationType
    });
    
    // Create campaign
    const campaign = await createGoogleAdsCampaign(customer, campaignData);
    
    res.json({ 
      success: true, 
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        budget: campaign.budget,
      }
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get campaign performance
app.get('/api/google-ads/campaign/:userId/:accountId/:campaignId', async (req, res) => {
  try {
    const { userId, accountId, campaignId } = req.params;
    const userSession = userSessions.get(userId);
    
    if (!userSession) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const customer = googleAdsClient.Customer({
      customer_id: accountId,
      refresh_token: userSession.refreshToken,
    });
    
    const performance = await getCampaignPerformance(customer, campaignId);
    
    res.json({ performance });
  } catch (error) {
    console.error('Error fetching campaign performance:', error);
    res.status(500).json({ error: 'Failed to fetch campaign performance' });
  }
});

// Helper functions
function generateCampaignData({ startupIdea, idealCustomer, problemSolved, validationType }) {
  const keywords = generateKeywords(startupIdea, problemSolved);
  const adCopy = generateAdCopy(startupIdea, idealCustomer, problemSolved);
  
  return {
    name: `${startupIdea} - Validierung ${validationType}`,
    budget: 2500, // 25€ daily budget in cents
    keywords,
    adGroups: [{
      name: `${startupIdea} - Hauptgruppe`,
      ads: adCopy,
      keywords: keywords.slice(0, 10), // Limit keywords per ad group
    }],
    targeting: generateTargeting(idealCustomer),
  };
}

function generateKeywords(startupIdea, problemSolved) {
  const baseKeywords = [
    startupIdea.toLowerCase(),
    problemSolved.toLowerCase(),
    `${problemSolved} lösung`,
    `${startupIdea} app`,
    `${startupIdea} service`,
    `${problemSolved} hilfe`,
    `${startupIdea} online`,
    `${problemSolved} software`,
    `${startupIdea} tool`,
    `${problemSolved} automatisierung`,
  ];
  
  return baseKeywords.map(keyword => ({
    text: keyword,
    match_type: 'BROAD',
  }));
}

function generateAdCopy(startupIdea, idealCustomer, problemSolved) {
  return [{
    headlines: [
      `${startupIdea} - Endlich verfügbar!`,
      `Lösung für ${problemSolved}`,
      `Perfekt für ${idealCustomer}`,
    ],
    descriptions: [
      `Endlich eine Lösung für ${problemSolved}. Speziell entwickelt für ${idealCustomer}. Jetzt kostenlos testen!`,
      `${startupIdea} macht ${problemSolved} zum Kinderspiel. Starten Sie noch heute!`,
    ],
  }];
}

function generateTargeting(idealCustomer) {
  // Basic demographic targeting based on ideal customer description
  return {
    demographics: {
      age_ranges: ['25-34', '35-44'], // Default professional age ranges
    },
    interests: [
      'Business',
      'Technology',
      'Productivity',
    ],
  };
}

async function createGoogleAdsCampaign(customer, campaignData) {
  // Create campaign
  const campaignOperation = {
    create: {
      name: campaignData.name,
      advertising_channel_type: 'SEARCH',
      status: 'PAUSED', // Start paused for review
      campaign_budget: {
        amount_micros: campaignData.budget * 10000, // Convert to micros
        delivery_method: 'STANDARD',
      },
      network_settings: {
        target_google_search: true,
        target_search_network: true,
      },
    },
  };
  
  const campaignResult = await customer.campaigns.mutate([campaignOperation]);
  const campaignId = campaignResult.results[0].resource_name.split('/')[3];
  
  // Create ad group
  const adGroupOperation = {
    create: {
      name: campaignData.adGroups[0].name,
      campaign: campaignResult.results[0].resource_name,
      status: 'ENABLED',
      cpc_bid_micros: 100000, // 0.10€ default bid
    },
  };
  
  const adGroupResult = await customer.adGroups.mutate([adGroupOperation]);
  const adGroupId = adGroupResult.results[0].resource_name.split('/')[5];
  
  // Create keywords
  const keywordOperations = campaignData.adGroups[0].keywords.map(keyword => ({
    create: {
      ad_group: adGroupResult.results[0].resource_name,
      keyword: {
        text: keyword.text,
        match_type: keyword.match_type,
      },
      status: 'ENABLED',
    },
  }));
  
  await customer.adGroupCriteria.mutate(keywordOperations);
  
  // Create ads
  const adOperations = campaignData.adGroups[0].ads.map(ad => ({
    create: {
      ad_group: adGroupResult.results[0].resource_name,
      status: 'ENABLED',
      ad: {
        type: 'RESPONSIVE_SEARCH_AD',
        responsive_search_ad: {
          headlines: ad.headlines.map(headline => ({
            text: headline,
          })),
          descriptions: ad.descriptions.map(description => ({
            text: description,
          })),
        },
        final_urls: [`${process.env.FRONTEND_URL}/landing`], // Default landing page
      },
    },
  }));
  
  await customer.ads.mutate(adOperations);
  
  return {
    id: campaignId,
    name: campaignData.name,
    status: 'PAUSED',
    budget: campaignData.budget,
  };
}

async function getCampaignPerformance(customer, campaignId) {
  const query = `
    SELECT 
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign 
    WHERE campaign.id = ${campaignId}
    AND segments.date DURING LAST_7_DAYS
  `;
  
  const results = await customer.query(query);
  
  return results.map(row => ({
    impressions: row.metrics.impressions,
    clicks: row.metrics.clicks,
    ctr: row.metrics.ctr,
    cost: row.metrics.cost_micros / 1000000, // Convert from micros to euros
    conversions: row.metrics.conversions,
  }));
}

app.listen(PORT, () => {
  console.log(`Google Ads API server running on port ${PORT}`);
}); 