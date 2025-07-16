# Supabase Setup für Landing Page Generator

## 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere dir die Project URL und den anon public key

## 2. Datenbank Tabellen erstellen

### Tabelle: landing_pages

```sql
CREATE TABLE landing_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subline TEXT NOT NULL,
  cta VARCHAR(100) NOT NULL,
  startup_idea TEXT NOT NULL,
  target_customer TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabelle: leads

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. Row Level Security (RLS) einrichten

```sql
-- Landing Pages: Öffentlich lesbar
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landing pages are viewable by everyone" ON landing_pages
  FOR SELECT USING (true);

CREATE POLICY "Landing pages are insertable by everyone" ON landing_pages
  FOR INSERT WITH CHECK (true);

-- Leads: Nur einfügen erlaubt
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads can be inserted by everyone" ON leads
  FOR INSERT WITH CHECK (true);
```

## 4. Environment Variables

Füge folgende Variablen zu deiner `.env` Datei hinzu:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Indizes für Performance

```sql
-- Index für Slug-Suche
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);

-- Index für Lead-Suche nach Landing Page
CREATE INDEX idx_leads_landing_page_id ON leads(landing_page_id);

-- Index für zeitbasierte Sortierung
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
```

## 6. Testen

Nach der Einrichtung kannst du die Landing Page Generation testen:

1. Starte die Anwendung: `pnpm run dev`
2. Gehe durch den Validierungsprozess
3. Klicke auf "Landing Page erstellen"
4. Überprüfe die Supabase Dashboard für neue Einträge

## Troubleshooting

### Fehler: "Failed to fetch"
- Überprüfe die Supabase URL und API Key
- Stelle sicher, dass RLS-Policies korrekt gesetzt sind

### Fehler: "Permission denied"
- Überprüfe die RLS-Policies
- Stelle sicher, dass die Tabellen existieren

### Fehler: "Unique constraint violation"
- Der Slug existiert bereits
- Die UUID-Generierung funktioniert korrekt 