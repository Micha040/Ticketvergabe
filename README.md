# Ticketvergabe System

Eine React-Anwendung mit eigener Benutzer-Tabelle und Supabase-Datenbank für ein Ticketvergabe-System.

## Setup

### 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Notiere dir die Projekt-URL und den anonymen Schlüssel

### 2. Datenbank-Schema erstellen

1. Gehe zu deinem Supabase-Dashboard
2. Navigiere zu "SQL Editor"
3. Führe das SQL-Script aus `database/schema.sql` aus
4. Dies erstellt die `users`-Tabelle mit Demo-Benutzern

### 3. Umgebungsvariablen konfigurieren

Erstelle eine `.env`-Datei im Root-Verzeichnis:

```env
VITE_SUPABASE_URL=deine_supabase_projekt_url
VITE_SUPABASE_ANON_KEY=dein_supabase_anon_key
```

### 4. Entwicklungsserver starten

```bash
npm install
npm run dev
```

## Anmeldesystem

Das System verwendet ein zweistufiges Anmeldesystem:

1. **E-Mail eingeben:** Benutzer gibt ihre E-Mail-Adresse ein
2. **Passwort eingeben:** Nach Bestätigung kann das Passwort eingegeben werden

### Demo-Anmeldedaten

- **Admin:** admin@example.com / admin123
- **User 1:** user1@example.com / user123
- **User 2:** user2@example.com / user456

## Features

- ✅ Eigene Benutzer-Tabelle in Supabase
- ✅ Zweistufiges Anmeldesystem
- ✅ E-Mail-basierte Passwort-Anfrage
- ✅ Admin- und User-Rollen
- ✅ Responsive Design mit Tailwind CSS
- ✅ Sichere Passwort-Speicherung (für Produktion: hashen!)

## Datenbank-Schema

```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Nächste Schritte

- Passwort-Hashing implementieren
- E-Mail-Benachrichtigungen für Admin
- Ticketvergabe-Funktionalität hinzufügen
- Benutzerverwaltung erweitern
- Session-Management verbessern
