import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts'
import { 
  Play, 
  Pause, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Target,
  Euro,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  Clock,
  BarChart3,
  Wifi,
  WifiOff
} from 'lucide-react'
import googleAdsService from '../services/googleAdsService'
import { io } from 'socket.io-client'

const CampaignDashboard = ({ accountId, onBack }) => {
  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignInsights, setCampaignInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState('LAST_7_DAYS')
  const [error, setError] = useState(null)
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [historicalData, setHistoricalData] = useState([])
  const [comparisonDateRange, setComparisonDateRange] = useState('LAST_14_DAYS')
  const socketRef = useRef(null)
  const refreshIntervalRef = useRef(null)

  useEffect(() => {
    loadCampaigns()
    initializeWebSocket()
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [accountId])

  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignInsights(selectedCampaign.id)
      loadHistoricalData(selectedCampaign.id)
    }
  }, [selectedCampaign, dateRange])

  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    if (isAutoRefreshEnabled && selectedCampaign) {
      refreshIntervalRef.current = setInterval(() => {
        loadCampaignInsights(selectedCampaign.id)
        loadCampaigns()
      }, refreshInterval)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [isAutoRefreshEnabled, selectedCampaign, refreshInterval])

  const initializeWebSocket = () => {
    try {
      socketRef.current = io('http://localhost:3001')
      
      socketRef.current.on('connect', () => {
        setIsConnected(true)
        console.log('WebSocket connected')
        // Join the account room for updates
        socketRef.current.emit('join-account', accountId)
      })
      
      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
      })
      
      socketRef.current.on('campaign-update', (data) => {
        if (data.accountId === accountId) {
          setCampaigns(prev => 
            prev.map(campaign => 
              campaign.id === data.campaignData.id 
                ? { ...campaign, ...data.campaignData }
                : campaign
            )
          )
          
          if (selectedCampaign && selectedCampaign.id === data.campaignData.id) {
            setSelectedCampaign(prev => ({ ...prev, ...data.campaignData }))
          }
        }
      })
      
      socketRef.current.on('account-update', (data) => {
        if (data.accountId === accountId) {
          setCampaigns(data.data.campaigns)
          setLastRefresh(new Date(data.timestamp))
        }
      })
    } catch (error) {
      console.error('WebSocket initialization error:', error)
    }
  }

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      const campaignsList = await googleAdsService.getCampaigns(accountId)
      setCampaigns(campaignsList)
      setLastRefresh(new Date())
      
      if (campaignsList.length > 0 && !selectedCampaign) {
        setSelectedCampaign(campaignsList[0])
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setError('Fehler beim Laden der Kampagnen: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignInsights = async (campaignId) => {
    try {
      setRefreshing(true)
      const insights = await googleAdsService.getCampaignInsights(accountId, campaignId, dateRange)
      setCampaignInsights(insights)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error loading campaign insights:', error)
      setError('Fehler beim Laden der Kampagnen-Insights: ' + error.message)
    } finally {
      setRefreshing(false)
    }
  }

  const loadHistoricalData = async (campaignId) => {
    try {
      const historical = await googleAdsService.getCampaignInsights(accountId, campaignId, comparisonDateRange)
      setHistoricalData(historical.dailyData || [])
    } catch (error) {
      console.error('Error loading historical data:', error)
    }
  }

  const handleCampaignStatusChange = async (campaignId, newStatus) => {
    try {
      await googleAdsService.updateCampaignStatus(accountId, campaignId, newStatus)
      
      // Update local state
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: newStatus.toUpperCase() }
          : campaign
      ))
      
      if (selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign({ ...selectedCampaign, status: newStatus.toUpperCase() })
      }
    } catch (error) {
      console.error('Error updating campaign status:', error)
      setError('Fehler beim Aktualisieren des Kampagnen-Status: ' + error.message)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ENABLED': return 'bg-green-500'
      case 'PAUSED': return 'bg-yellow-500'
      case 'REMOVED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ENABLED': return 'Aktiv'
      case 'PAUSED': return 'Pausiert'
      case 'REMOVED': return 'Entfernt'
      default: return status
    }
  }

  const getPerformanceIndicator = (metric, threshold) => {
    if (metric >= threshold) {
      return <TrendingUp className="w-4 h-4 text-green-500" />
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />
    }
  }

  const handleExport = (format) => {
    try {
      const exportData = selectedCampaign ? [selectedCampaign] : campaigns
      const content = googleAdsService.exportCampaignData(exportData, format)
      const filename = `campaign-data-${new Date().toISOString().split('T')[0]}.${format}`
      const contentType = format === 'csv' ? 'text/csv' : 'application/json'
      
      googleAdsService.downloadFile(content, filename, contentType)
    } catch (error) {
      console.error('Export error:', error)
      setError('Fehler beim Exportieren: ' + error.message)
    }
  }

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Nie'
    return lastRefresh.toLocaleTimeString('de-DE')
  }

  const getComparisonData = () => {
    if (!campaignInsights?.dailyData || !historicalData.length) return null
    
    const currentPeriod = campaignInsights.dailyData
    const previousPeriod = historicalData.slice(-currentPeriod.length)
    
    return currentPeriod.map((current, index) => {
      const previous = previousPeriod[index] || { impressions: 0, clicks: 0, cost: 0 }
      return {
        date: current.date,
        currentImpressions: current.impressions,
        previousImpressions: previous.impressions,
        currentClicks: current.clicks,
        previousClicks: previous.clicks,
        currentCost: current.cost,
        previousCost: previous.cost
      }
    })
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Kampagnen werden geladen...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Zurück zur Validierung
          </Button>
          <h2 className="text-2xl font-bold">Kampagnen-Dashboard</h2>
          <p className="text-gray-600">Überwachen Sie Ihre Validierungs-Kampagnen</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={isAutoRefreshEnabled}
              onCheckedChange={setIsAutoRefreshEnabled}
            />
            <Label className="text-sm">Auto-Refresh</Label>
          </div>
          
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15000">15s</SelectItem>
              <SelectItem value="30000">30s</SelectItem>
              <SelectItem value="60000">1m</SelectItem>
              <SelectItem value="300000">5m</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="YESTERDAY">Gestern</SelectItem>
              <SelectItem value="LAST_7_DAYS">Letzte 7 Tage</SelectItem>
              <SelectItem value="LAST_14_DAYS">Letzte 14 Tage</SelectItem>
              <SelectItem value="LAST_30_DAYS">Letzte 30 Tage</SelectItem>
              <SelectItem value="THIS_MONTH">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => loadCampaigns()}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExport('json')}
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Keine Kampagnen gefunden</AlertTitle>
          <AlertDescription>
            Sie haben noch keine Kampagnen erstellt. Gehen Sie zurück zur Validierung, um eine neue Kampagne zu erstellen.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Kampagnen ({campaigns.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedCampaign?.id === campaign.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{campaign.name}</h4>
                      <Badge className={`${getStatusColor(campaign.status)} text-white text-xs`}>
                        {getStatusText(campaign.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {campaign.impressions.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MousePointer className="w-3 h-3 mr-1" />
                        {campaign.clicks.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {formatPercentage(campaign.ctr)}
                      </div>
                      <div className="flex items-center">
                        <Euro className="w-3 h-3 mr-1" />
                        {formatCurrency(campaign.cost)}
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant={campaign.status === 'ENABLED' ? 'secondary' : 'default'}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCampaignStatusChange(
                            campaign.id, 
                            campaign.status === 'ENABLED' ? 'PAUSED' : 'ENABLED'
                          )
                        }}
                        className="flex-1 text-xs"
                      >
                        {campaign.status === 'ENABLED' ? (
                          <><Pause className="w-3 h-3 mr-1" /> Pausieren</>
                        ) : (
                          <><Play className="w-3 h-3 mr-1" /> Starten</>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Campaign Details */}
          <div className="lg:col-span-2">
            {selectedCampaign && (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Übersicht</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="comparison">Vergleich</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Impressionen</p>
                            <p className="text-2xl font-bold">{selectedCampaign.impressions.toLocaleString()}</p>
                          </div>
                          <Eye className="w-8 h-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Klicks</p>
                            <p className="text-2xl font-bold">{selectedCampaign.clicks.toLocaleString()}</p>
                          </div>
                          <MousePointer className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">CTR</p>
                            <p className="text-2xl font-bold flex items-center">
                              {formatPercentage(selectedCampaign.ctr)}
                              {getPerformanceIndicator(selectedCampaign.ctr, 1.5)}
                            </p>
                          </div>
                          <Target className="w-8 h-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Kosten</p>
                            <p className="text-2xl font-bold">{formatCurrency(selectedCampaign.cost)}</p>
                          </div>
                          <Euro className="w-8 h-8 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Campaign Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Kampagnen-Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Status:</span>
                          <Badge className={`${getStatusColor(selectedCampaign.status)} text-white`}>
                            {getStatusText(selectedCampaign.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tägliches Budget:</span>
                          <span className="font-medium">{formatCurrency(selectedCampaign.budget)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Kampagnen-Typ:</span>
                          <span className="font-medium">{selectedCampaign.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Kosten pro Klick:</span>
                          <span className="font-medium">{formatCurrency(selectedCampaign.costPerClick)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Conversion Rate:</span>
                          <span className="font-medium flex items-center">
                            {formatPercentage(selectedCampaign.conversionRate)}
                            {getPerformanceIndicator(selectedCampaign.conversionRate, 2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-gray-500">Letzte Aktualisierung:</span>
                          <span className="text-sm font-medium flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatLastRefresh()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  {campaignInsights && (
                    <>
                      {/* Performance Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Tägliche Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={campaignInsights.dailyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Bar yAxisId="left" dataKey="impressions" fill="#8884d8" name="Impressionen" />
                              <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#82ca9d" name="Klicks" strokeWidth={2} />
                              <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#ff7300" name="Conversions" strokeWidth={2} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Cost Analysis */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Kosten-Analyse</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={campaignInsights.dailyData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="cost" fill="#ffc658" name="Kosten (€)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-4">
                  {getComparisonData() && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Zeitraum-Vergleich</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-4 mb-4">
                            <Label>Vergleichszeitraum:</Label>
                            <Select value={comparisonDateRange} onValueChange={setComparisonDateRange}>
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LAST_14_DAYS">Letzte 14 Tage</SelectItem>
                                <SelectItem value="LAST_30_DAYS">Letzte 30 Tage</SelectItem>
                                <SelectItem value="LAST_90_DAYS">Letzte 90 Tage</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getComparisonData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line type="monotone" dataKey="currentImpressions" stroke="#8884d8" name="Aktuelle Impressionen" strokeWidth={2} />
                              <Line type="monotone" dataKey="previousImpressions" stroke="#8884d8" strokeDasharray="5 5" name="Vorherige Impressionen" strokeWidth={2} />
                              <Line type="monotone" dataKey="currentClicks" stroke="#82ca9d" name="Aktuelle Klicks" strokeWidth={2} />
                              <Line type="monotone" dataKey="previousClicks" stroke="#82ca9d" strokeDasharray="5 5" name="Vorherige Klicks" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle>Kosten-Vergleich</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getComparisonData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="currentCost" fill="#ffc658" name="Aktuelle Kosten" />
                              <Bar dataKey="previousCost" fill="#ffb347" name="Vorherige Kosten" />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {!getComparisonData() && (
                    <Alert>
                      <BarChart3 className="h-4 w-4" />
                      <AlertTitle>Keine Vergleichsdaten verfügbar</AlertTitle>
                      <AlertDescription>
                        Wählen Sie eine Kampagne aus, um Vergleichsdaten zu sehen.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  {campaignInsights && (
                    <>
                      {/* Performance Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance-Zusammenfassung ({dateRange})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Gesamt-Impressionen</p>
                              <p className="text-xl font-bold">{campaignInsights.totals.impressions.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Gesamt-Klicks</p>
                              <p className="text-xl font-bold">{campaignInsights.totals.clicks.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Gesamt-Kosten</p>
                              <p className="text-xl font-bold">{formatCurrency(campaignInsights.totals.cost)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Durchschnittliche CTR</p>
                              <p className="text-xl font-bold">{formatPercentage(campaignInsights.averages.ctr)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Kosten pro Klick</p>
                              <p className="text-xl font-bold">{formatCurrency(campaignInsights.averages.costPerClick)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Conversion Rate</p>
                              <p className="text-xl font-bold">{formatPercentage(campaignInsights.averages.conversionRate)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recommendations */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Empfehlungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {campaignInsights.averages.ctr < 1.5 && (
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Niedrige CTR</AlertTitle>
                                <AlertDescription>
                                  Ihre CTR liegt unter 1,5%. Überprüfen Sie Ihre Anzeigentexte und Keywords.
                                </AlertDescription>
                              </Alert>
                            )}
                            {campaignInsights.averages.costPerClick > 2 && (
                              <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Hohe Kosten pro Klick</AlertTitle>
                                <AlertDescription>
                                  Ihre Kosten pro Klick sind über 2€. Optimieren Sie Ihre Gebotsstrategien.
                                </AlertDescription>
                              </Alert>
                            )}
                            {campaignInsights.averages.conversionRate > 2 && (
                              <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertTitle>Gute Conversion Rate</AlertTitle>
                                <AlertDescription>
                                  Ihre Conversion Rate ist über 2%. Ihre Kampagne performt gut!
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignDashboard 