# Google Ads Integration Setup

## Overview
Your ValidationSuite is now fully integrated with real Google Ads functionality. Here's what changed:

### ✅ **What's Now Functional**
- **Real Google Ads OAuth authentication** (no more demo)
- **Actual campaign creation** with your startup data
- **Live campaign monitoring** with real-time updates
- **Campaign management** (start/pause/monitor)
- **Performance tracking** with real metrics

## Setup Instructions

### 1. **Google Ads API Setup**

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Ads API**:
   - Navigate to APIs & Services > Library
   - Search for "Google Ads API"
   - Enable it

3. **Create OAuth2 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5173/` (for development)
     - `https://yourdomain.com/` (for production)

4. **Get Developer Token**:
   - Go to [Google Ads Developer Center](https://developers.google.com/google-ads/api/docs/first-call/dev-token)
   - Request a developer token
   - This may take some time for approval

### 2. **Environment Configuration**

Update your `.env` file with the credentials:

```env
# Google Ads API Configuration
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_REDIRECT_URI=http://localhost:5173/
GOOGLE_ADS_MANAGER_ACCOUNT_ID=your_manager_account_id (optional)

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. **Run the Application**

```bash
# Install dependencies (if not already done)
pnpm install

# Start both frontend and backend
pnpm run dev:full
```

### 4. **Testing the Integration**

1. **Navigate to your app** at `http://localhost:5173`
2. **Complete the startup analysis** to get to ValidationSuite
3. **Click "Google Ads Validierung"** 
4. **You'll be redirected to Google OAuth** (real authentication)
5. **After authorization**, you'll see your Google Ads accounts
6. **Select an account** to access the real campaign dashboard

## Features Now Available

### 🎯 **Campaign Creation**
- **Automated campaign setup** using your startup data
- **Smart keyword generation** from your idea/customer/problem
- **Intelligent ad copy creation** based on your analysis
- **Budget management** with €25/day starting budget

### 📊 **Real-Time Monitoring**
- **Live performance metrics** (impressions, clicks, CTR)
- **Auto-refresh** every 30 seconds (configurable)
- **WebSocket updates** for instant notifications
- **Campaign status management**

### 📈 **Analytics & Reporting**
- **Performance comparisons** across time periods
- **Export functionality** (CSV/JSON)
- **Historical data tracking**
- **Cost analysis** with trend visualization

### 🔧 **Management Features**
- **Start/pause campaigns** directly from dashboard
- **Budget monitoring** with spend tracking
- **Keyword performance** analysis
- **Integration with Google Ads interface**

## Important Notes

### 🚨 **Before Going Live**
1. **Test with small budgets** initially
2. **Verify your landing page** is ready
3. **Set up conversion tracking** in Google Ads
4. **Review ad policies** to ensure compliance

### 💡 **Best Practices**
1. **Start with €5-10/day** for testing
2. **Monitor campaigns closely** first few days
3. **Use specific keywords** related to your startup
4. **A/B test different ad copies**
5. **Set up proper landing pages**

### 🛠️ **Development vs Production**
- **Development**: Uses localhost URLs
- **Production**: Update redirect URIs in Google Cloud Console
- **SSL Required**: Production needs HTTPS for OAuth

## Troubleshooting

### Common Issues:
1. **"Invalid redirect URI"**: Check your Google Cloud Console settings
2. **"Developer token not approved"**: Wait for Google approval (can take days)
3. **"No accounts found"**: Ensure you have access to Google Ads accounts
4. **Connection errors**: Check your .env file configuration

### Getting Help:
- Check the browser console for detailed error messages
- Review Google Ads API documentation
- Ensure all environment variables are set correctly

## Next Steps

1. **Set up your Google Ads account** with the credentials above
2. **Test with a small budget** to ensure everything works
3. **Create proper landing pages** for your campaigns
4. **Set up conversion tracking** to measure success
5. **Scale up** once you're confident in the setup

Your startup validation system is now fully functional with real Google Ads integration! 🚀