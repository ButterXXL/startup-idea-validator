import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx'

const validationMethods = [
  {
    title: 'Google Ads Validierung',
    description: 'Teste deine Idee mit echten Google-Nutzern durch gezielte Werbeanzeigen. Du schaltest eine Anzeige und misst, wie viele Interessenten auf dein Angebot klicken.',
    url: 'https://ads.google.com/'
  },
  {
    title: 'Meta (Facebook/Instagram) Validierung',
    description: 'Erreiche potenzielle Kunden auf Facebook und Instagram. Mit einer Werbekampagne prüfst du, wie groß das Interesse an deiner Idee wirklich ist.',
    url: 'https://adsmanager.facebook.com/'
  }
]

const ValidationBox = ({ title, description, url, disabled }) => (
  <a
    href={disabled ? undefined : url}
    target="_blank"
    rel="noopener noreferrer"
    className={`block rounded-xl border-2 p-6 shadow-md transition-all duration-200 mb-4 cursor-pointer hover:shadow-lg hover:border-blue-500 bg-white ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-blue-50'}`}
    tabIndex={disabled ? -1 : 0}
    aria-disabled={disabled}
  >
    <div className="font-bold text-lg mb-2">{title}</div>
    <div className="text-gray-700 text-base">{description}</div>
  </a>
)

const ValidationSuite = ({ score, improvementTips, onBack }) => {
  const showValidationBoxes = score >= 25
  const isHighScore = score > 60

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">
          Validierung deiner Idee
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Feedback */}
        {isHighScore ? (
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle>Glückwunsch!</AlertTitle>
            <AlertDescription>
              Deine Idee hat einen hohen Score ({score}). Du kannst sie jetzt direkt mit echten Nutzern validieren.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-red-50 border-red-200">
            <AlertTitle>Verbesserung empfohlen!</AlertTitle>
            <AlertDescription>
              Dein Score liegt bei {score}. <b>Bitte arbeite dringend an den Verbesserungsvorschlägen, bevor du Geld für Werbung ausgibst.</b>
            </AlertDescription>
          </Alert>
        )}

        {/* Verbesserungstipps anzeigen, wenn Score <= 60 */}
        {!isHighScore && improvementTips && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="font-semibold mb-1">Verbesserungstipps aus der Analyse:</div>
            <div className="text-sm whitespace-pre-line">{improvementTips}</div>
          </div>
        )}

        {/* Validierungs-Boxen oder Hinweis */}
        {showValidationBoxes ? (
          <div className="flex flex-col md:flex-row gap-6">
            {validationMethods.map((method) => (
              <ValidationBox key={method.title} {...method} />
            ))}
          </div>
        ) : (
          <div className="bg-red-100 border border-red-300 text-red-700 rounded p-4 text-center">
            Dein Score ist zu niedrig für eine Werbevalidierung. Bitte verbessere deine Idee, bevor du Geld investierst.
          </div>
        )}

        {/* Optional: Zurück-Button */}
        {onBack && (
          <div className="mt-6 text-center">
            <button className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100 transition" onClick={onBack}>Zurück zur Bearbeitung</button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ValidationSuite 