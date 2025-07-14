import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Loader2, Lightbulb, Users, Target } from 'lucide-react'
import { analyzeStartupIdea } from './api.js'
import './App.css'
import ScoreReflection from './components/ScoreReflection'
import ValidationSuite from './components/ValidationSuite'

function App() {
  const [formData, setFormData] = useState({
    firstName: '',
    startupIdea: '',
    idealCustomer: '',
    problemSolved: ''
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')
  const [showScoreReflection, setShowScoreReflection] = useState(false)
  const [showValidationSuite, setShowValidationSuite] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const isFormValid = () => {
    return formData.startupIdea.trim() && 
           formData.idealCustomer.trim() && 
           formData.problemSolved.trim()
  }

  const analyzeIdea = async () => {
    if (!isFormValid()) return

    setIsAnalyzing(true)
    setError('')
    setAnalysis('')
    setShowScoreReflection(false)
    setShowValidationSuite(false)

    try {
      const result = await analyzeStartupIdea(formData)
      setAnalysis(result)
      setShowScoreReflection(true)
    } catch (err) {
      console.error('Error analyzing idea:', err)
      setError('Fehler bei der Analyse. Bitte versuchen Sie es erneut.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleProceedToValidation = () => {
    setShowValidationSuite(true)
    setShowScoreReflection(false)
  }

  const handleEditIdea = () => {
    setShowScoreReflection(false)
    setShowValidationSuite(false)
    // Optional: Scroll zum Formular
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Startup Idea Validator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Lassen Sie Ihre Startup-Idee von KI analysieren und erhalten Sie wertvolles Feedback zu Marktpotenzial, Zielgruppe und Monetarisierung.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Ihre Startup-Idee</CardTitle>
            <CardDescription>
              Füllen Sie die folgenden Felder aus, um eine detaillierte Analyse zu erhalten.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* First Name Field */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                Vorname (optional)
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Lisa"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Startup Idea Field */}
            <div className="space-y-2">
              <Label htmlFor="startupIdea" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Startup-Idee *
              </Label>
              <Textarea
                id="startupIdea"
                rows={5}
                placeholder="Beschreibe deine Idee in 2–5 Sätzen"
                value={formData.startupIdea}
                onChange={(e) => handleInputChange('startupIdea', e.target.value)}
                className="w-full resize-none"
                required
              />
            </div>

            {/* Ideal Customer Field */}
            <div className="space-y-2">
              <Label htmlFor="idealCustomer" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Idealer Kunde *
              </Label>
              <Textarea
                id="idealCustomer"
                rows={4}
                placeholder="Beschreibe deine Zielgruppe"
                value={formData.idealCustomer}
                onChange={(e) => handleInputChange('idealCustomer', e.target.value)}
                className="w-full resize-none"
                required
              />
            </div>

            {/* Problem Solved Field */}
            <div className="space-y-2">
              <Label htmlFor="problemSolved" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Gelöstes Problem *
              </Label>
              <Textarea
                id="problemSolved"
                rows={4}
                placeholder="Beschreibe das Hauptproblem"
                value={formData.problemSolved}
                onChange={(e) => handleInputChange('problemSolved', e.target.value)}
                className="w-full resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={analyzeIdea}
              disabled={!isFormValid() || isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analysiere Idee...
                </>
              ) : (
                'Idee analysieren'
              )}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-green-700">
                Analyse-Ergebnis
              </CardTitle>
              <CardDescription>
                Hier ist die detaillierte Bewertung Ihrer Startup-Idee:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                  {analysis}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Reflection & Validation Suite */}
        {showScoreReflection && analysis && !showValidationSuite && (
          <ScoreReflection
            analysisText={analysis}
            onProceed={handleProceedToValidation}
            onEdit={handleEditIdea}
          />
        )}
        {showValidationSuite && (
          <ValidationSuite />
        )}
        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by AI • Für Bildungszwecke entwickelt</p>
        </div>
      </div>
    </div>
  )
}

export default App

