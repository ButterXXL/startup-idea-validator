import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Link, CheckCircle, AlertCircle, ExternalLink, BarChart3, Play, Pause, Settings, Zap, Shield, FileText, Globe, Loader2 } from 'lucide-react'
import googleAdsService from '@/services/googleAdsService.js'
import landingPageGenerator from '@/services/landingPageGenerator.js'

const ValidationSuite = ({ score, improvementTips, onBack, startupIdea, idealCustomer, problemSolved, analysisText }) => {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [showDashboard, setShowDashboard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [mode, setMode] = useState('demo') // 'demo' or 'real'
  
  // Landing page generation states
  const [landingPageLoading, setLandingPageLoading] = useState(false)
  const [landingPageError, setLandingPageError] = useState(null)
  const [generatedLandingPage, setGeneratedLandingPage] = useState(null)
  
  const showValidationButtons = score >= 25
  const isHighScore = score > 60
  const isVeryLowScore = score < 25

  // Handle landing page generation
  const handleGenerateLandingPage = async () => {
    setLandingPageLoading(true)
    setLandingPageError(null)
    
    try {
      const result = await landingPageGenerator.createLandingPage(
        startupIdea,
        idealCustomer,
        problemSolved
      )
      
      if (result.success) {
        setGeneratedLandingPage(result)
      } else {
        setLandingPageError(result.error)
      }
    } catch (error) {
      setLandingPageError('Fehler beim Generieren der Landing Page')
    } finally {
      setLandingPageLoading(false)
    }
  }

  // Handle authentication for both demo and real modes
  const handleGoogleAdsLogin = async (selectedMode) => {
    setIsLoading(true)
    setError(null)
    setMode(selectedMode)
    
    try {
      // Set the mode in the service
      googleAdsService.setMode(selectedMode)
      
      // Authenticate based on mode
      const result = await googleAdsService.authenticate()
      
      if (result.success) {
        setIsLoggedIn(true)
        setUserInfo(result.userInfo)
        
        // Fetch accounts
        const accountsData = await googleAdsService.getAccounts()
        setAccounts(accountsData)
        
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0])
          googleAdsService.joinAccount(accountsData[0].id)
        }
        
        setShowDashboard(true)
        setSelectedMethod('google-ads')
        
        // Show success message
        alert(result.message)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError(`Authentifizierung fehlgeschlagen: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    if (!selectedAccount) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const campaignData = {
        name: `${startupIdea} - Validierung`,
        budget: { amount: 2500, currency: 'EUR' },
        targetAudience: idealCustomer,
        keywords: [
          startupIdea.toLowerCase(),
          problemSolved.toLowerCase(),
          'startup',
          'lösung',
          'innovation'
        ],
        adText: {
          headline1: `Endlich eine Lösung für ${problemSolved}`,
          headline2: `${startupIdea} - Jetzt testen`,
          description: `Revolutionäre Lösung für ${idealCustomer}. Entdecke ${startupIdea} und löse dein Problem mit ${problemSolved}.`
        }
      }
      
      const result = await googleAdsService.createCampaign(selectedAccount.id, campaignData)
      
      if (result.success) {
        // Refresh campaigns
        const updatedCampaigns = await googleAdsService.getCampaigns(selectedAccount.id, startupIdea)
        setCampaigns(updatedCampaigns)
        
        alert(result.message || 'Kampagne erfolgreich erstellt!')
        
        // If real mode, show link to Google Ads
        if (mode === 'real' && result.googleAdsUrl) {
          if (confirm('Kampagne erstellt! Möchtest du sie in Google Ads öffnen?')) {
            window.open(result.googleAdsUrl, '_blank')
          }
        }
      }
    } catch (error) {
      console.error('Campaign creation error:', error)
      setError(`Kampagne konnte nicht erstellt werden: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    googleAdsService.disconnect()
    setIsLoggedIn(false)
    setUserInfo(null)
    setShowDashboard(false)
    setCampaigns([])
    setAccounts([])
    setSelectedAccount(null)
    setSelectedMethod(null)
    setError(null)
  }

  // Listen for real-time campaign updates
  useEffect(() => {
    const handleCampaignUpdate = (event) => {
      const updateData = event.detail
      console.log('Campaign update received:', updateData)
      
      // Update campaigns with new data
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === updateData.campaignId 
          ? { ...campaign, ...updateData }
          : campaign
      ))
    }

    window.addEventListener('campaignUpdate', handleCampaignUpdate)
    return () => window.removeEventListener('campaignUpdate', handleCampaignUpdate)
  }, [])

  // Fetch campaigns when account is selected
  useEffect(() => {
    if (selectedAccount && isLoggedIn) {
      const fetchCampaigns = async () => {
        try {
          const campaignsData = await googleAdsService.getCampaigns(selectedAccount.id, startupIdea)
          setCampaigns(campaignsData)
        } catch (error) {
          console.error('Error fetching campaigns:', error)
        }
      }
      
      fetchCampaigns()
    }
  }, [selectedAccount, isLoggedIn, startupIdea])

  if (isVeryLowScore) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Dringend: Grundlegende Verbesserungen nötig</AlertTitle>
          <AlertDescription className="text-red-700">
            Deine Startup-Idee benötigt fundamentale Überarbeitungen, bevor eine Validierung sinnvoll ist.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Prioritäre Verbesserungen:</h3>
          <div className="grid gap-3">
            {improvementTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-orange-800 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onBack} variant="outline">
            ← Zurück zur Analyse
          </Button>
        </div>
      </div>
    )
  }

  if (showDashboard && isLoggedIn) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Google Ads Dashboard ({mode === 'demo' ? 'Demo' : 'Live'})
            </h2>
            <p className="text-gray-600">
              Angemeldet als: {userInfo?.name || userInfo?.email}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={mode === 'demo' ? 'secondary' : 'default'}>
              {mode === 'demo' ? '🎯 Demo Modus' : '🔐 Live Modus'}
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Abmelden
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Account Selection */}
        {accounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Account auswählen</CardTitle>
            </CardHeader>
            <CardContent>
              <select 
                value={selectedAccount?.id || ''} 
                onChange={(e) => {
                  const account = accounts.find(acc => acc.id === e.target.value)
                  setSelectedAccount(account)
                  if (account) {
                    googleAdsService.joinAccount(account.id)
                  }
                }}
                className="w-full p-2 border rounded-lg"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* Campaign Creation */}
        <Card>
          <CardHeader>
            <CardTitle>Neue Kampagne erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Kampagnen-Vorschau:</h4>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Name:</strong> {startupIdea} - Validierung
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Budget:</strong> €25/Tag (€750/Monat)
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Zielgruppe:</strong> {idealCustomer}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Hauptkeyword:</strong> {startupIdea.toLowerCase()}
                </p>
              </div>
              
              <Button 
                onClick={handleCreateCampaign} 
                disabled={isLoading || !selectedAccount}
                className="w-full"
              >
                {isLoading ? 'Erstelle Kampagne...' : 'Kampagne erstellen'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaign List */}
        {campaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aktive Kampagnen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{campaign.name}</h4>
                      <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Impressionen</p>
                        <p className="font-medium">{campaign.impressions?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Klicks</p>
                        <p className="font-medium">{campaign.clicks?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">CTR</p>
                        <p className="font-medium">{campaign.ctr || 0}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Kosten</p>
                        <p className="font-medium">€{campaign.cost?.toFixed(2) || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <Button onClick={onBack} variant="outline">
            ← Zurück zur Analyse
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isHighScore && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Ausgezeichnet! Deine Idee ist validierungsbereit</AlertTitle>
          <AlertDescription className="text-green-700">
            Dein Score von {score}/100 zeigt großes Potenzial. Zeit für die Marktvalidierung!
          </AlertDescription>
        </Alert>
      )}

      {!isHighScore && showValidationButtons && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Gut! Deine Idee kann validiert werden</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Score: {score}/100 - Bereit für erste Marktvalidierung mit Optimierungspotenzial.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Landing Page Generation */}
      {showValidationButtons && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Schritt 1: Landing Page erstellen</h3>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Landing Page Generator</h4>
                    <p className="text-sm text-gray-600">Erstelle eine professionelle Landing Page für dein Startup</p>
                  </div>
                </div>
                
                {!generatedLandingPage ? (
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• KI-generierte Inhalte (Titel, Subline, CTA)</p>
                      <p>• Integriertes Lead-Capture Formular</p>
                      <p>• Responsive Design für alle Geräte</p>
                      <p>• Optimiert für Conversions</p>
                    </div>
                    
                    <Button 
                      onClick={handleGenerateLandingPage}
                      disabled={landingPageLoading}
                      className="w-full"
                    >
                      {landingPageLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generiere Landing Page...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Landing Page erstellen
                        </>
                      )}
                    </Button>
                    
                    {landingPageError && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{landingPageError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold text-green-800">Landing Page erfolgreich erstellt!</h5>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Deine personalisierte Landing Page ist bereit und kann für die Validierung verwendet werden.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><strong>Titel:</strong> {generatedLandingPage.landingPage.title}</p>
                        <p><strong>Subline:</strong> {generatedLandingPage.landingPage.subline}</p>
                        <p><strong>CTA:</strong> {generatedLandingPage.landingPage.cta}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => window.open(generatedLandingPage.url, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Landing Page öffnen
                      </Button>
                      <Button 
                        onClick={() => setGeneratedLandingPage(null)}
                        variant="outline"
                      >
                        Neu generieren
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {generatedLandingPage ? 'Schritt 2: Validierungsmethoden' : 'Validierungsmethoden'}
            </h3>
            
            {!generatedLandingPage && (
              <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Hinweis:</strong> Erstelle zuerst eine Landing Page, um optimale Validierungsergebnisse zu erzielen.
                </p>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
            {/* Demo Google Ads */}
            <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Google Ads - Demo</h4>
                    <p className="text-sm text-gray-600">Schnell testen ohne echte Kosten</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Simulierte Kampagnen-Erstellung</p>
                  <p>• Realistische Demo-Daten</p>
                  <p>• Sofortiger Zugriff</p>
                  <p>• Keine echten Kosten</p>
                </div>
                <Button 
                  onClick={() => handleGoogleAdsLogin('demo')} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading && mode === 'demo' ? 'Verbinde...' : 'Demo starten'}
                </Button>
              </CardContent>
            </Card>

            {/* Real Google Ads */}
            <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Google Ads - Live</h4>
                    <p className="text-sm text-gray-600">Echte Kampagnen mit deinem Account</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Echte Google Ads Kampagnen</p>
                  <p>• Reale Marktdaten</p>
                  <p>• Dein Google Ads Account</p>
                  <p>• Echte Kosten & Resultate</p>
                </div>
                <Button 
                  onClick={() => handleGoogleAdsLogin('real')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && mode === 'real' ? 'Verbinde...' : 'Mit Google einloggen'}
                </Button>
              </CardContent>
            </Card>

            {/* Meta Ads - Static Option */}
            <Card className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ExternalLink className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Meta Ads</h4>
                    <p className="text-sm text-gray-600">Facebook & Instagram Werbung</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>• Personalisierte Anleitung</p>
                  <p>• Zielgruppen-Targeting</p>
                  <p>• Creative-Vorschläge</p>
                  <p>• Budget-Empfehlungen</p>
                </div>
                <Button 
                  onClick={() => setSelectedMethod('meta-ads')} 
                  className="w-full"
                  variant="outline"
                >
                  Meta Ads Guide
                </Button>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      )}

      {/* Meta Ads Guide (existing functionality) */}
      {selectedMethod === 'meta-ads' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Meta Ads Validierung für "{startupIdea}"</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Personalisierter Kampagnen-Setup:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>Zielgruppe:</strong> {idealCustomer}</p>
                <p><strong>Problem:</strong> {problemSolved}</p>
                <p><strong>Budget:</strong> €20-25/Tag für 30 Tage</p>
                <p><strong>Kampagnentyp:</strong> Traffic & Conversions</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Schritt-für-Schritt Anleitung:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Gehe zu <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Ads Manager</a></li>
                <li>Erstelle eine neue Kampagne mit dem Ziel "Traffic"</li>
                <li>Definiere deine Zielgruppe basierend auf "{idealCustomer}"</li>
                <li>Setze dein Budget auf €25/Tag</li>
                <li>Erstelle Anzeigen mit dem Fokus auf "{problemSolved}"</li>
                <li>Verwende Headlines wie: "Endlich eine Lösung für {problemSolved}"</li>
                <li>Leite Traffic zu deiner Landing Page</li>
                <li>Verfolge Conversions und Engagement</li>
              </ol>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => window.open('https://business.facebook.com/adsmanager', '_blank')}
                className="flex-1"
              >
                Zu Meta Ads Manager
              </Button>
              <Button 
                onClick={() => setSelectedMethod(null)} 
                variant="outline"
              >
                Zurück
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement tips for lower scores */}
      {!isHighScore && showValidationButtons && improvementTips.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Verbesserungsvorschläge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {improvementTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-yellow-800 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={onBack} variant="outline">
          ← Zurück zur Analyse
        </Button>
      </div>
    </div>
  )
}

export default ValidationSuite 