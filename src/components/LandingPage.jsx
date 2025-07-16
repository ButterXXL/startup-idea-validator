import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { CheckCircle, Mail, Phone, User, MessageSquare } from 'lucide-react'
import landingPageGenerator from '@/services/landingPageGenerator.js'

const LandingPage = () => {
  const { slug } = useParams()
  const [landingPage, setLandingPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchLandingPage()
  }, [slug])

  const fetchLandingPage = async () => {
    try {
      const result = await landingPageGenerator.getLandingPage(slug)
      if (result.success) {
        setLandingPage(result.landingPage)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Fehler beim Laden der Landing Page')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await landingPageGenerator.storeLead(landingPage.id, formData)
      if (result.success) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Fehler beim Senden der Anfrage')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Landing Page wird geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Fehler</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Seite nicht gefunden</h2>
            <p className="text-gray-600">Die angeforderte Landing Page existiert nicht.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {landingPage.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            {landingPage.subline}
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Content Section */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-lg max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: landingPage.content.replace(/\n/g, '<br/>') 
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Startup Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Über diese Lösung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Startup-Idee:</h4>
                    <p className="text-gray-600">{landingPage.startup_idea}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Zielgruppe:</h4>
                    <p className="text-gray-600">{landingPage.target_customer}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Problem:</h4>
                    <p className="text-gray-600">{landingPage.problem_solved}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lead Capture Form */}
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    Interesse geweckt?
                  </CardTitle>
                  <p className="text-center text-gray-600">
                    Kontaktiere uns für weitere Informationen
                  </p>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-600 mb-2">
                        Vielen Dank!
                      </h3>
                      <p className="text-gray-600">
                        Wir haben deine Anfrage erhalten und melden uns bald bei dir.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Name *</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Dein vollständiger Name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>E-Mail *</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="deine@email.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>Telefon (optional)</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+49 123 456789"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>Nachricht (optional)</span>
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Erzähl uns mehr über dein Interesse..."
                          rows={4}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitting}
                      >
                        {submitting ? 'Wird gesendet...' : landingPage.cta}
                      </Button>
                    </form>
                  )}

                  {error && (
                    <Alert className="mt-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage 