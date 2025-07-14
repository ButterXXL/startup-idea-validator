import React from 'react'
import useExtractScore from '../hooks/useExtractScore'
import { Button } from './ui/button'
import { Card } from './ui/card'

export default function ScoreReflection({ analysisText, onProceed, onEdit }) {
  const score = useExtractScore(analysisText)
  if (score == null) return null

  const isReady = score >= 60
  const color = isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  const border = isReady ? 'border-green-400' : 'border-yellow-400'

  return (
    <div className={`w-full max-w-xl mx-auto my-8 p-6 rounded-xl border-2 ${color} ${border} shadow-lg flex flex-col items-center`}>
      <div className="text-4xl font-bold mb-2">Startup Score: <span className="text-5xl">{score}</span>/100</div>
      <div className="mb-6 text-lg font-medium">
        {isReady ? 'Bereit für Validation!' : 'Empfehlung: Idee weiter verbessern, aber du kannst trotzdem testen.'}
      </div>
      <div className="flex gap-4">
        {isReady ? (
          <Button onClick={onProceed} className="bg-green-600 hover:bg-green-700 text-white">Zur Kampagnen-Erstellung</Button>
        ) : (
          <>
            <Button onClick={onEdit} className="bg-yellow-500 hover:bg-yellow-600 text-white">Idee überarbeiten</Button>
            <Button onClick={onProceed} className="bg-yellow-600 hover:bg-yellow-700 text-white">Trotzdem testen</Button>
          </>
        )}
      </div>
    </div>
  )
} 