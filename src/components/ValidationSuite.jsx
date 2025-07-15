import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, Link, CheckCircle, AlertCircle } from 'lucide-react'
import googleAdsService from '../services/googleAdsService'

const ValidationSuite = ({ score, improvementTips, onBack, startupIdea, idealCustomer, problemSolved, analysisText }) => {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isGoogleAdsConnected, setIsGoogleAdsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [campaigns, setCampaigns] = useState([])
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const showValidationButtons = score >= 25
  const isHighScore = score > 60
  const isVeryLowScore = score < 25

  // Check Google Ads connection status on component mount
  useEffect(() => {
    setIsGoogleAdsConnected(googleAdsService.isConnected())
    if (googleAdsService.isConnected()) {
      loadAccounts()
    }
  }, [])

  const loadAccounts = async () => {
    try {
      const accountsList = await googleAdsService.getAccounts()
      setAccounts(accountsList)
      if (accountsList.length > 0) {
        setSelectedAccount(accountsList[0])
      }
    } catch (error) {
      console.error('Error loading accounts:', error)
    }
  }

  const handleGoogleAdsConnect = async () => {
    setIsConnecting(true)
    try {
      await googleAdsService.authenticateUser()
      setIsGoogleAdsConnected(true)
      await loadAccounts()
    } catch (error) {
      console.error('Error connecting to Google Ads:', error)
      alert('Fehler beim Verbinden mit Google Ads: ' + error.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCreateGoogleAdsCampaign = async () => {
    if (!selectedAccount) {
      alert('Bitte wählen Sie zuerst ein Google Ads-Konto aus.')
      return
    }

    setIsCreatingCampaign(true)
    try {
      const campaign = await googleAdsService.createCampaign({
        accountId: selectedAccount.id,
        startupIdea,
        idealCustomer,
        problemSolved,
        validationType: 'Google Ads'
      })
      
      setCampaigns(prev => [...prev, campaign])
      alert(`Kampagne "${campaign.name}" wurde erfolgreich erstellt!`)
      
      // Switch to campaign view
      setSelectedMethod('google-ads-live')
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Fehler beim Erstellen der Kampagne: ' + error.message)
    } finally {
      setIsCreatingCampaign(false)
    }
  }

  // Funktion zur Erstellung personalisierter Anleitungen
  const createPersonalizedGuide = (methodId) => {
    const baseKeywords = startupIdea ? startupIdea.toLowerCase().split(' ').slice(0, 3).join(', ') : 'dein Produkt'
    const targetGroup = idealCustomer || 'deine Zielgruppe'
    const problem = problemSolved || 'das Problem'
    
    if (methodId === 'google-ads') {
      return {
        title: `Google Ads Setup für "${startupIdea || 'deine Idee'}"`,
        steps: [
          {
            title: '1. Kampagnen-Grundlagen',
            content: `Erstelle eine Search-Kampagne mit einem Tagesbudget von 15-25€. Kampagnenname: "${startupIdea || 'Startup'} - Test Kampagne". Wähle "Website-Traffic" als Ziel.`
          },
          {
            title: '2. Zielgruppe definieren',
            content: `Zielgruppe: ${targetGroup}. Standort: Deutschland, Österreich, Schweiz. Sprache: Deutsch. Demografische Merkmale basierend auf deiner Analyse: Personen, die nach Lösungen für "${problem}" suchen.`
          },
          {
            title: '3. Keywords auswählen',
            content: `Hauptkeywords: "${baseKeywords}", "${problem}", "Lösung für ${problem}", "${startupIdea || 'dein Produkt'} Alternative". Verwende Keyword-Match-Typ "Phrase Match" für bessere Kontrolle.`
          },
          {
            title: '4. Anzeigentext erstellen',
            content: `Headline 1: "Endlich eine Lösung für ${problem}"\nHeadline 2: "${startupIdea || 'Unser Produkt'} - Jetzt testen"\nBeschreibung: "Speziell für ${targetGroup} entwickelt. Löse ${problem} effektiv. Jetzt kostenlos testen!"`
          },
          {
            title: '5. Landing Page',
            content: `Erstelle eine Landing Page mit: Headline über ${problem}, Beschreibung deiner Lösung für ${targetGroup}, E-Mail-Anmeldung für Early Access, und ein kurzes Video/Bild das deine Lösung zeigt.`
          }
        ],
        template: {
          budget: '€20/Tag',
          duration: '10 Tage',
          targeting: `${targetGroup} in DACH-Region`,
          adFormat: 'Responsive Search Ad',
          metrics: 'CTR > 2%, CPC < €2, Conversion Rate > 5%'
        },
        urlParams: `https://ads.google.com/home/campaigns/new/?campaignType=search&budget=20&location=DE&keywords=${encodeURIComponent(baseKeywords)}`
      }
    } else {
      return {
        title: `Meta Ads Setup für "${startupIdea || 'deine Idee'}"`,
        steps: [
          {
            title: '1. Kampagnen-Ziel wählen',
            content: `Wähle "Lead-Generierung" als Hauptziel. Kampagnenname: "${startupIdea || 'Startup'} - Meta Test". Budget: €25/Tag für 10 Tage.`
          },
          {
            title: '2. Zielgruppe erstellen',
            content: `Zielgruppe: ${targetGroup}. Alter: 25-55 Jahre. Standort: Deutschland, Österreich, Schweiz. Interessen: Füge Interessen hinzu, die zu "${problem}" und "${startupIdea || 'deiner Lösung'}" passen.`
          },
          {
            title: '3. Platzierungen wählen',
            content: `Starte mit: Facebook Feed, Instagram Feed, Instagram Stories. Vermeide Audience Network am Anfang. Fokussiere dich auf mobile Nutzer (80% deiner Zielgruppe).`
          },
          {
            title: '4. Kreative Inhalte',
            content: `Erstelle 3 Bild-Varianten die ${problem} visualisieren. Text: "Kennst du das Problem: ${problem}? Wir haben die Lösung für ${targetGroup}!" Call-to-Action: "Mehr erfahren" oder "Jetzt testen".`
          },
          {
            title: '5. Tracking einrichten',
            content: `Installiere Meta Pixel. Erstelle Custom Conversions für: Landing Page Besuche, E-Mail Anmeldungen, Demo-Anfragen. Verwende UTM-Parameter: utm_source=facebook&utm_campaign=${encodeURIComponent(startupIdea || 'test')}`
          }
        ],
        template: {
          budget: '€25/Tag',
          duration: '10 Tage',
          targeting: `${targetGroup} in DACH, Interessen-basiert`,
          adFormat: 'Einzelbild + Karussell',
          metrics: 'CTR > 1.5%, CPM < €8, Cost per Lead < €3'
        },
        urlParams: `https://www.facebook.com/business/ads/create/?campaign_objective=LEAD_GENERATION&budget=25&location=DE&interests=${encodeURIComponent(problem)}`
      }
    }
  }

  const validationMethods = [
    {
      id: 'google-ads-api',
      title: '🚀 Google Ads - Automatische Kampagne',
      description: 'Erstelle automatisch eine personalisierte Google Ads-Kampagne direkt aus der App. Keine manuelle Einrichtung nötig - wir übernehmen alles!',
      isApiIntegration: true,
      requiresConnection: true
    },
    {
      id: 'google-ads',
      title: 'Google Ads - Manuelle Einrichtung',
      description: 'Erhalte eine detaillierte Anleitung zur manuellen Einrichtung deiner Google Ads-Kampagne mit personalisierten Vorlagen.',
      setupGuide: createPersonalizedGuide('google-ads')
    },
    {
      id: 'meta-ads',
      title: 'Meta (Facebook/Instagram) Validierung',
      description: 'Erreiche potenzielle Kunden auf Facebook und Instagram. Mit einer Werbekampagne prüfst du, wie groß das Interesse an deiner Idee ist.',
      setupGuide: createPersonalizedGuide('meta-ads')
    }
  ]

  const handleMethodClick = (method) => {
    if (method.id === 'google-ads-api') {
      // Handle Google Ads API integration
      if (!isGoogleAdsConnected) {
        handleGoogleAdsConnect()
      } else {
        setSelectedMethod(method)
      }
    } else {
      setSelectedMethod(method)
    }
  }

  const handleBackToMethods = () => {
    setSelectedMethod(null)
  }

  const handleStartCampaign = (method) => {
    window.open(method.setupGuide.urlParams, '_blank')
  }

  if (selectedMethod) {
    // Handle Google Ads API integration view
    if (selectedMethod.id === 'google-ads-api') {
      return (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-600">
              🚀 Google Ads - Automatische Kampagne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Status */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">📡 Verbindungsstatus</h3>
              <div className="flex items-center gap-3">
                {isGoogleAdsConnected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">Mit Google Ads verbunden</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-700">Nicht verbunden</span>
                  </>
                )}
              </div>
            </div>

            {/* Account Selection */}
            {isGoogleAdsConnected && accounts.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">🏢 Google Ads Konto</h3>
                <select 
                  value={selectedAccount?.id || ''}
                  onChange={(e) => setSelectedAccount(accounts.find(acc => acc.id === e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Campaign Creation */}
            {isGoogleAdsConnected && selectedAccount && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">📋 Kampagnen-Vorschau</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Kampagnenname:</strong> {startupIdea || 'Deine Idee'} - Validierung</div>
                  <div><strong>Budget:</strong> €25/Tag</div>
                  <div><strong>Zielgruppe:</strong> {idealCustomer || 'Deine Zielgruppe'}</div>
                  <div><strong>Keywords:</strong> {startupIdea ? startupIdea.toLowerCase().split(' ').slice(0, 3).join(', ') : 'Automatisch generiert'}</div>
                </div>
                <div className="mt-4">
                  <strong>Anzeigentext:</strong><br />
                  <div className="bg-white p-3 rounded border text-sm mt-2">
                    <div className="text-blue-600 font-medium">Endlich eine Lösung für {problemSolved || 'dein Problem'}</div>
                    <div className="text-gray-600">{startupIdea || 'Dein Produkt'} - Jetzt testen</div>
                    <div className="text-gray-700 text-xs mt-1">
                      Speziell für {idealCustomer || 'deine Zielgruppe'} entwickelt. Löse {problemSolved || 'das Problem'} effektiv. Jetzt kostenlos testen!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Campaigns */}
            {campaigns.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-3">📊 Deine Kampagnen</h3>
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-gray-600">Status: {campaign.status}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          €{campaign.budget/100}/Tag
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {!isGoogleAdsConnected ? (
                <Button 
                  onClick={handleGoogleAdsConnect}
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verbinde...
                    </>
                  ) : (
                    '🔗 Mit Google Ads verbinden'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateGoogleAdsCampaign}
                  disabled={isCreatingCampaign || !selectedAccount}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
                >
                  {isCreatingCampaign ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Erstelle Kampagne...
                    </>
                  ) : (
                    '🚀 Kampagne erstellen'
                  )}
                </Button>
              )}
              <Button 
                onClick={handleBackToMethods}
                variant="outline"
                className="px-6 py-3"
              >
                ← Zurück zur Auswahl
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // Handle manual setup methods
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-600">
            {selectedMethod.setupGuide.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Andere Methode auch anzeigen */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">🔄 Alternative Validierungsmethode</h3>
            <div className="grid gap-3">
              {validationMethods
                .filter(method => method.id !== selectedMethod.id)
                .map((method) => (
                  <Card 
                    key={method.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-400 bg-white"
                    onClick={() => handleMethodClick(method)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-blue-700">{method.title}</h4>
                          <p className="text-sm text-gray-600">{method.description.substring(0, 80)}...</p>
                        </div>
                        <div className="text-blue-600 text-sm font-medium">
                          Wechseln →
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Campaign Template */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">📋 Personalisierte Kampagnen-Vorlage</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Budget:</strong> {selectedMethod.setupGuide.template.budget}</div>
              <div><strong>Laufzeit:</strong> {selectedMethod.setupGuide.template.duration}</div>
              <div><strong>Zielgruppe:</strong> {selectedMethod.setupGuide.template.targeting}</div>
              <div><strong>Format:</strong> {selectedMethod.setupGuide.template.adFormat}</div>
            </div>
            <div className="mt-2">
              <strong>Erfolgs-Metriken:</strong> {selectedMethod.setupGuide.template.metrics}
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div>
            <h3 className="font-semibold text-lg mb-3">🎯 Personalisierte Schritt-für-Schritt Anleitung</h3>
            <div className="space-y-4">
              {selectedMethod.setupGuide.steps.map((step, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">{step.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{step.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics */}
          <Alert>
            <AlertTitle>💡 Erfolgsmessung für deine Idee</AlertTitle>
            <AlertDescription>
              Deine Kampagne ist erfolgreich, wenn:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Die Klickrate (CTR) über 1.5% liegt</li>
                <li>Du mindestens 15-25 qualifizierte Leads generierst</li>
                <li>Die Kosten pro Lead unter 4€ bleiben</li>
                <li>Du positives Feedback zu "{startupIdea || 'deiner Idee'}" erhältst</li>
                <li>Mindestens 20% der Leads zeigen echtes Kaufinteresse</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => handleStartCampaign(selectedMethod)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
            >
              🚀 Kampagne mit vorgefüllten Daten starten
            </Button>
            <Button 
              onClick={handleBackToMethods}
              variant="outline"
              className="px-6 py-3"
            >
              ← Zurück zur Auswahl
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isHighScore ? '🎉 Bereit für die Validierung!' : '⚠️ Verbesserung empfohlen'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score-based messaging */}
        {isVeryLowScore ? (
          <Alert className="border-red-200 bg-red-50">
            <AlertTitle className="text-red-800">🚨 Idee noch nicht bereit für Werbung</AlertTitle>
            <AlertDescription className="text-red-700">
              Mit einem Score unter 25 ist deine Idee noch nicht bereit für kostenpflichtige Werbung. 
              Arbeite erst an den Verbesserungen, bevor du Geld investierst.
            </AlertDescription>
          </Alert>
        ) : !isHighScore ? (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTitle className="text-orange-800">⚠️ Dringliche Verbesserung empfohlen</AlertTitle>
            <AlertDescription className="text-orange-700">
              Deine Idee hat Potenzial, aber es gibt wichtige Bereiche, die verbessert werden sollten, 
              bevor du Geld für Werbung ausgibst. Dennoch kannst du mit kleinem Budget testen.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <AlertTitle className="text-green-800">✅ Perfekt für die Validierung</AlertTitle>
            <AlertDescription className="text-green-700">
              Deine Idee ist gut durchdacht und bereit für die Marktvalidierung. 
              Starte mit einer der folgenden Methoden!
            </AlertDescription>
          </Alert>
        )}

        {/* Improvement Tips */}
        {improvementTips && !isHighScore && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Verbesserungsvorschläge:</h3>
            <div className="text-blue-700 text-sm whitespace-pre-wrap">
              {improvementTips}
            </div>
          </div>
        )}

        {/* Validation Methods */}
        {showValidationButtons && (
          <div>
            <h3 className="font-semibold text-lg mb-4">🎯 Wähle deine personalisierte Validierungsmethode:</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {validationMethods.map((method) => (
                <Card 
                  key={method.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300 ${
                    method.isApiIntegration ? 'bg-gradient-to-r from-blue-50 to-green-50' : ''
                  }`}
                  onClick={() => handleMethodClick(method)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-blue-600 flex items-center justify-between">
                      {method.title}
                      {method.isApiIntegration && (
                        <div className="flex items-center gap-2">
                          {isGoogleAdsConnected ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verbunden
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Link className="w-3 h-3 mr-1" />
                              Verbindung erforderlich
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {method.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-blue-600 text-sm font-medium">
                        {method.isApiIntegration ? (
                          isGoogleAdsConnected ? 'Kampagne erstellen →' : 'Mit Google Ads verbinden →'
                        ) : (
                          'Klicken für personalisierte Anleitung →'
                        )}
                      </div>
                      {method.isApiIntegration && isConnecting && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        {onBack && (
          <div className="pt-4 border-t">
            <Button onClick={onBack} variant="outline" className="w-full">
              ← Zurück zur Bearbeitung
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ValidationSuite 