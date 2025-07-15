import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Link, CheckCircle, AlertCircle, ExternalLink, BarChart3, Play, Pause, Settings } from 'lucide-react'

const ValidationSuite = ({ score, improvementTips, onBack, startupIdea, idealCustomer, problemSolved, analysisText }) => {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [showDashboard, setShowDashboard] = useState(false)
  
  const showValidationButtons = score >= 25
  const isHighScore = score > 60
  const isVeryLowScore = score < 25

  // Check for OAuth callback in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    
    if (code && state === 'google_oauth') {
      // Simulate successful login
      setIsLoggedIn(true)
      setUserInfo({
        name: 'Max Mustermann',
        email: 'max@example.com',
        avatar: 'https://via.placeholder.com/40'
      })
      setShowDashboard(true)
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Simple Google OAuth login with better handling
  const handleGoogleLogin = () => {
    // For demo purposes, we'll simulate login after a short delay
    // In production, you would redirect to Google OAuth
    
    const confirmLogin = window.confirm(
      'Demo: Möchtest du dich mit Google einloggen?\n\n' +
      'In der echten App würdest du zu Google weitergeleitet werden.'
    )
    
    if (confirmLogin) {
      // Simulate login delay
      setTimeout(() => {
        setIsLoggedIn(true)
        setUserInfo({
          name: 'Max Mustermann',
          email: 'max@example.com',
          avatar: 'https://via.placeholder.com/40'
        })
        setShowDashboard(true)
      }, 1000)
    }
  }

  // Alternative: Direct redirect approach (uncomment for production)
  /*
  const handleGoogleLogin = () => {
    const clientId = 'YOUR_GOOGLE_CLIENT_ID'
    const redirectUri = encodeURIComponent(window.location.origin)
    const scope = encodeURIComponent('email profile')
    const state = 'google_oauth'
    
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}`
    
    // Direct redirect instead of popup
    window.location.href = authUrl
  }
  */

  const handleCreateCampaign = () => {
    const newCampaign = {
      id: Date.now(),
      name: `${startupIdea || 'Startup'} - Validierung`,
      status: 'Aktiv',
      budget: 25,
      spent: Math.floor(Math.random() * 50), // Simulate some spending
      impressions: Math.floor(Math.random() * 10000) + 1000, // Simulate impressions
      clicks: Math.floor(Math.random() * 100) + 10, // Simulate clicks
      conversions: Math.floor(Math.random() * 10) + 1, // Simulate conversions
      created: new Date().toLocaleDateString('de-DE')
    }
    setCampaigns([...campaigns, newCampaign])
  }

  const toggleCampaignStatus = (campaignId) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'Aktiv' ? 'Pausiert' : 'Aktiv' }
        : campaign
    ))
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserInfo(null)
    setShowDashboard(false)
    setCampaigns([])
  }

  // Dashboard Component
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* User Info Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={userInfo.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
            <div>
              <h3 className="font-semibold text-gray-800">{userInfo.name}</h3>
              <p className="text-sm text-gray-600">{userInfo.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Abmelden
            </Button>
            <Button variant="outline" onClick={() => setShowDashboard(false)}>
              ← Zurück zur Validierung
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreateCampaign}>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Neue Kampagne</h3>
            <p className="text-sm text-gray-600">Erstelle eine neue Validierungs-Kampagne</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Gesamt-Performance</h3>
            <div className="text-2xl font-bold text-green-600">
              {campaigns.reduce((sum, c) => sum + c.clicks, 0)} Klicks
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Aktive Kampagnen</h3>
            <div className="text-2xl font-bold text-purple-600">
              {campaigns.filter(c => c.status === 'Aktiv').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Meine Kampagnen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Noch keine Kampagnen erstellt.</p>
              <Button onClick={handleCreateCampaign} className="mt-4">
                Erste Kampagne erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">Erstellt: {campaign.created}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={campaign.status === 'Aktiv' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {campaign.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleCampaignStatus(campaign.id)}
                      >
                        {campaign.status === 'Aktiv' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Budget</p>
                      <p className="font-semibold">€{campaign.budget}/Tag</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ausgegeben</p>
                      <p className="font-semibold">€{campaign.spent}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Impressionen</p>
                      <p className="font-semibold">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Klicks</p>
                      <p className="font-semibold">{campaign.clicks}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        CTR: {campaign.clicks > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : 0}%
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open('https://ads.google.com/aw/campaigns', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        In Google Ads öffnen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 Performance-Tipps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-700">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Optimiere deine Keywords</p>
                <p className="text-sm text-blue-600">Verwende spezifische Long-Tail Keywords für bessere Conversion-Raten</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">A/B-Teste deine Anzeigentexte</p>
                <p className="text-sm text-blue-600">Erstelle mehrere Varianten und teste, welche am besten funktioniert</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Überwache deine Ausgaben</p>
                <p className="text-sm text-blue-600">Pausiere Kampagnen mit hohen Kosten und niedrigen Conversions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Show dashboard if logged in and requested
  if (showDashboard && isLoggedIn) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Kampagnen Dashboard</h2>
        {renderDashboard()}
      </div>
    )
  }

  // Main validation suite
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="mb-4"
        >
          ← Zurück zur Analyse
        </Button>
        
        <h2 className="text-3xl font-bold mb-4 text-center">Validierungsoptionen</h2>
        <p className="text-center text-gray-600 mb-6">
          Wähle eine Methode, um deine Startup-Idee zu validieren
        </p>
      </div>

      {/* Score-based alerts */}
      {isVeryLowScore && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Dringende Verbesserung erforderlich!</AlertTitle>
          <AlertDescription className="text-red-700">
            Deine Idee hat einen sehr niedrigen Score. Arbeite zuerst an den Verbesserungsvorschlägen, 
            bevor du mit der Validierung beginnst.
          </AlertDescription>
        </Alert>
      )}

      {isHighScore && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Exzellente Ausgangslage!</AlertTitle>
          <AlertDescription className="text-green-700">
            Deine Idee hat großes Potenzial. Starte jetzt mit der Validierung, um Marktfeedback zu sammeln.
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Methods */}
      {showValidationButtons && (
        <div className="grid gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-400"
            onClick={handleGoogleLogin}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Google Ads Validierung</h3>
                    <p className="text-gray-600">
                      Logge dich mit deinem Google Account ein und verwalte deine Kampagnen hier
                    </p>
                    {isLoggedIn && (
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Eingeloggt als {userInfo.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-blue-600 font-medium">
                  {isLoggedIn ? 'Dashboard öffnen →' : 'Mit Google einloggen →'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-400"
            onClick={() => window.open('https://www.facebook.com/adsmanager', '_blank')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Meta Ads Validierung</h3>
                    <p className="text-gray-600">
                      Teste deine Idee auf Facebook und Instagram
                    </p>
                  </div>
                </div>
                <div className="text-purple-600 font-medium">
                  Zu Meta Ads →
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dashboard Access for logged in users */}
      {isLoggedIn && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">📊 Dein Kampagnen-Dashboard</h3>
              <p className="text-blue-700">
                Verwalte deine Kampagnen, überwache Performance und optimiere deine Validierung
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Eingeloggt als: {userInfo.name}
              </p>
            </div>
            <Button 
              onClick={() => setShowDashboard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard öffnen
            </Button>
          </div>
        </div>
      )}

      {/* Improvement Tips */}
      {improvementTips && improvementTips.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">💡 Verbesserungsvorschläge</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {improvementTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-yellow-700">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ValidationSuite 