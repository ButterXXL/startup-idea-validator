import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'

const ValidationSuite = ({ score, improvementTips, onBack }) => {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const showValidationButtons = score >= 25
  const isHighScore = score > 60
  const isVeryLowScore = score < 25

  const validationMethods = [
    {
      id: 'google-ads',
      title: 'Google Ads Validierung',
      description: 'Teste deine Idee mit echten Google-Nutzern durch gezielte Werbeanzeigen. Du schaltest eine Anzeige und misst, wie viele Interessenten auf dein Angebot klicken.',
      setupGuide: {
        title: 'Google Ads Kampagne Setup',
        steps: [
          {
            title: '1. Kampagnen-Grundlagen',
            content: 'Erstelle eine Search-Kampagne mit einem Tagesbudget von 10-20€ für den Start.'
          },
          {
            title: '2. Zielgruppe definieren',
            content: 'Wähle deine Zielregion und demografische Merkmale basierend auf deiner Startup-Analyse.'
          },
          {
            title: '3. Keywords auswählen',
            content: 'Verwende 5-10 relevante Keywords, die dein Problem oder deine Lösung beschreiben.'
          },
          {
            title: '4. Anzeigentext erstellen',
            content: 'Schreibe eine klare Headline und Beschreibung, die dein Wertversprechen kommuniziert.'
          },
          {
            title: '5. Landing Page',
            content: 'Erstelle eine einfache Landing Page, die Interesse misst (E-Mail-Anmeldung, Warteliste).'
          }
        ],
        template: {
          budget: '€15/Tag',
          duration: '7 Tage',
          targeting: 'Deutschland, 25-45 Jahre',
          adFormat: 'Text-Anzeige',
          metrics: 'Klickrate, Conversion Rate, Kosten pro Lead'
        },
        urlParams: 'https://ads.google.com/home/campaigns/new/?campaignType=search&budget=15&location=DE'
      }
    },
    {
      id: 'meta-ads',
      title: 'Meta (Facebook/Instagram) Validierung',
      description: 'Erreiche potenzielle Kunden auf Facebook und Instagram. Mit einer Werbekampagne prüfst du, wie groß das Interesse an deiner Idee ist.',
      setupGuide: {
        title: 'Meta Ads Kampagne Setup',
        steps: [
          {
            title: '1. Kampagnen-Ziel wählen',
            content: 'Wähle "Traffic" oder "Lead-Generierung" als Kampagnenziel für deine Validierung.'
          },
          {
            title: '2. Zielgruppe erstellen',
            content: 'Definiere deine Zielgruppe basierend auf Interessen, Verhalten und demografischen Daten.'
          },
          {
            title: '3. Platzierungen wählen',
            content: 'Starte mit automatischen Platzierungen (Facebook Feed, Instagram Feed, Stories).'
          },
          {
            title: '4. Kreative Inhalte',
            content: 'Erstelle ansprechende Bilder/Videos und schreibe überzeugende Anzeigentexte.'
          },
          {
            title: '5. Tracking einrichten',
            content: 'Installiere den Meta Pixel auf deiner Landing Page für besseres Tracking.'
          }
        ],
        template: {
          budget: '€20/Tag',
          duration: '7 Tage',
          targeting: 'Deutschland, 25-45 Jahre, Interessen-basiert',
          adFormat: 'Bild + Text',
          metrics: 'CTR, CPM, Conversion Rate, Kosten pro Lead'
        },
        urlParams: 'https://www.facebook.com/business/ads/create/?campaign_objective=TRAFFIC&budget=20&location=DE'
      }
    }
  ]

  const handleMethodClick = (method) => {
    setSelectedMethod(method)
  }

  const handleBackToMethods = () => {
    setSelectedMethod(null)
  }

  const handleStartCampaign = (method) => {
    // Open the ads manager with pre-filled parameters
    window.open(method.setupGuide.urlParams, '_blank')
  }

  if (selectedMethod) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-600">
            {selectedMethod.setupGuide.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campaign Template */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">📋 Kampagnen-Vorlage</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Budget:</strong> {selectedMethod.setupGuide.template.budget}</div>
              <div><strong>Laufzeit:</strong> {selectedMethod.setupGuide.template.duration}</div>
              <div><strong>Zielgruppe:</strong> {selectedMethod.setupGuide.template.targeting}</div>
              <div><strong>Format:</strong> {selectedMethod.setupGuide.template.adFormat}</div>
            </div>
            <div className="mt-2">
              <strong>Wichtige Metriken:</strong> {selectedMethod.setupGuide.template.metrics}
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div>
            <h3 className="font-semibold text-lg mb-3">🎯 Schritt-für-Schritt Anleitung</h3>
            <div className="space-y-4">
              {selectedMethod.setupGuide.steps.map((step, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-blue-700">{step.title}</h4>
                  <p className="text-gray-700 text-sm mt-1">{step.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Success Metrics */}
          <Alert>
            <AlertTitle>💡 Erfolgsmessung</AlertTitle>
            <AlertDescription>
              Eine Kampagne ist erfolgreich, wenn:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Die Klickrate (CTR) über 1% liegt</li>
                <li>Du mindestens 10-20 qualifizierte Leads generierst</li>
                <li>Die Kosten pro Lead unter 5€ bleiben</li>
                <li>Du positives Feedback zu deiner Idee erhältst</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => handleStartCampaign(selectedMethod)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              🚀 Kampagne jetzt starten
            </Button>
            <Button 
              onClick={handleBackToMethods}
              variant="outline"
              className="px-6 py-2"
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
            <h3 className="font-semibold text-lg mb-4">🎯 Wähle deine Validierungsmethode:</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {validationMethods.map((method) => (
                <Card 
                  key={method.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                  onClick={() => handleMethodClick(method)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-blue-600">
                      {method.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {method.description}
                    </p>
                    <div className="mt-3 text-blue-600 text-sm font-medium">
                      Klicken für Setup-Anleitung →
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