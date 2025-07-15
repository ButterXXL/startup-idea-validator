# Google Ads API Setup Guide

## Current Status
✅ **Backend Server**: Running successfully on port 3001  
✅ **Frontend**: Running on port 5174  
❌ **Google Ads API**: Needs configuration  

## Required Environment Variables

You need to add these variables to your `.env` file:

```bash
# Google Ads API Configuration
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_MANAGER_ACCOUNT_ID=your_manager_account_id_here
GOOGLE_ADS_REDIRECT_URI=http://localhost:3001/auth/google-ads/callback
FRONTEND_URL=http://localhost:5174
```

## Setup Steps

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Ads API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google-ads/callback`

### 2. Google Ads Developer Token
1. Go to [Google Ads](https://ads.google.com/)
2. Navigate to Tools & Settings > API Center
3. Apply for a developer token
4. Wait for approval (can take 1-2 days)

### 3. Manager Account ID
1. In Google Ads, go to Account settings
2. Copy your Customer ID (remove dashes)
3. Use this as your MANAGER_ACCOUNT_ID

### 4. Update .env File
Add the variables above to your `.env` file with your actual values.

## Testing the Setup

Once configured, the Google Ads integration will:
- ✅ Allow users to connect their Google Ads accounts
- ✅ Create personalized campaigns automatically
- ✅ Monitor campaign performance in the dashboard
- ✅ Provide real-time analytics and insights

## Current Workaround

Until the Google Ads API is configured, users can still:
- ✅ Use the manual Google Ads setup guide
- ✅ Use the Meta Ads setup guide
- ✅ Access all other app features

The campaign monitoring dashboard will be available once the API is configured.

## Troubleshooting

If you see "ERR_CONNECTION_REFUSED" errors:
1. Make sure the backend server is running (`pnpm run dev:full`)
2. Check that port 3001 is available
3. Verify all environment variables are set correctly
4. Restart the server after updating .env

For Google Ads API errors:
1. Verify your developer token is approved
2. Check that OAuth credentials are correctly configured
3. Ensure the redirect URI matches exactly
4. Confirm the manager account ID is correct (no dashes) 