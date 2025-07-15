# Startup Idea Validator

Eine React-App zur Validierung von Startup-Ideen mit integrierter Google Ads API.

## Features

- **Startup-Ideen Analyse**: Bewertung von Startup-Ideen mit OpenAI
- **Google Ads Integration**: Automatische Kampagnenerstellung über Google Ads API
- **Personalisierte Validierung**: Maßgeschneiderte Werbekampagnen basierend auf der Startup-Idee
- **Manuelle Anleitungen**: Detaillierte Schritt-für-Schritt Anleitungen für Google Ads und Meta Ads

## Setup

### 1. Installation

```bash
pnpm install
```

### 2. Umgebungsvariablen

Erstelle eine `.env` Datei im Projektverzeichnis:

```env
# OpenAI API
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Google Ads API Configuration
GOOGLE_ADS_CLIENT_ID=your_google_ads_client_id
GOOGLE_ADS_CLIENT_SECRET=your_google_ads_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token
GOOGLE_ADS_MANAGER_ACCOUNT_ID=your_manager_account_id
GOOGLE_ADS_REDIRECT_URI=http://localhost:3001/api/google-ads/callback

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. Google Ads API Setup

1. **Google Cloud Console**:
   - Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
   - Erstelle ein neues Projekt oder wähle ein bestehendes
   - Aktiviere die Google Ads API

2. **OAuth 2.0 Credentials**:
   - Gehe zu "APIs & Services" → "Credentials"
   - Erstelle OAuth 2.0 Client ID
   - Füge `http://localhost:3001/api/google-ads/callback` als Redirect URI hinzu
   - Notiere Client ID und Client Secret

3. **Developer Token**:
   - Gehe zu [Google Ads](https://ads.google.com/)
   - Klicke auf "Tools & Settings" → "API Center"
   - Beantrage einen Developer Token
   - Warte auf die Genehmigung (kann einige Tage dauern)

4. **Manager Account**:
   - Erstelle ein Google Ads Manager Account
   - Notiere die Manager Account ID

### 4. Starten

```bash
# Frontend und Backend gleichzeitig starten
pnpm run dev:full

# Oder separat:
# Backend starten
pnpm run server

# Frontend starten (in neuem Terminal)
pnpm run dev
```

## Verwendung

1. **Startup-Idee eingeben**: Fülle die drei Fragen zur Startup-Idee aus
2. **Analyse erhalten**: Die App analysiert die Idee und gibt einen Score
3. **Validierung wählen**:
   - **Automatische Google Ads**: Verbinde dein Google Ads Konto für automatische Kampagnenerstellung
   - **Manuelle Einrichtung**: Erhalte detaillierte Anleitungen für Google Ads oder Meta Ads

## API Endpoints

- `GET /api/google-ads/auth-url` - OAuth URL generieren
- `POST /api/google-ads/auth-callback` - OAuth Callback verarbeiten
- `GET /api/google-ads/accounts/:userId` - Google Ads Konten abrufen
- `POST /api/google-ads/create-campaign` - Kampagne erstellen
- `GET /api/google-ads/campaign/:userId/:accountId/:campaignId` - Kampagnen-Performance abrufen

## Technologie Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express
- **APIs**: OpenAI API, Google Ads API
- **Authentifizierung**: OAuth 2.0

## Entwicklung

### Projektstruktur

```
src/
├── components/
│   ├── ValidationSuite.jsx    # Hauptkomponente für Validierung
│   └── ui/                    # UI-Komponenten
├── services/
│   └── googleAdsService.js    # Google Ads API Service
├── api.js                     # OpenAI API Service
└── main.jsx                   # App Entry Point

server.js                      # Backend Server
public/
└── google-ads-callback.html   # OAuth Callback Seite
```

### Debugging

1. **Backend Logs**: Überprüfe die Konsole des Backend-Servers
2. **Frontend Logs**: Öffne die Browser-Entwicklertools
3. **OAuth Flow**: Teste den OAuth Flow mit der Callback-Seite

## Deployment

Für Production:

1. Aktualisiere die Umgebungsvariablen für Production
2. Baue die App: `pnpm run build`
3. Deploye Frontend und Backend separat
4. Aktualisiere die Redirect URIs in Google Cloud Console

## Troubleshooting

### Häufige Probleme

1. **"Developer Token not approved"**: Warte auf die Genehmigung von Google
2. **"Invalid redirect URI"**: Überprüfe die Redirect URI in Google Cloud Console
3. **"Authentication failed"**: Überprüfe Client ID und Client Secret
4. **CORS Errors**: Stelle sicher, dass Backend und Frontend auf korrekten Ports laufen

### Support

Bei Problemen überprüfe:
- Alle Umgebungsvariablen sind gesetzt
- Google Ads API ist aktiviert
- OAuth Credentials sind korrekt konfiguriert
- Backend Server läuft auf Port 3001 