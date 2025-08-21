-- Erstelle die users-Tabelle
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255), -- Erlaubt NULL-Werte für Benutzer ohne Passwort
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle einen Index für die E-Mail-Suche
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Erstelle einen Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Erstelle die games-Tabelle für Spiele
UPDATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team1 VARCHAR(255) NOT NULL,
  team2 VARCHAR(255) NOT NULL,
  total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
  available_tickets INTEGER NOT NULL CHECK (available_tickets >= 0),
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  ticket_decision_days INTEGER NOT NULL DEFAULT 7 CHECK (ticket_decision_days >= 1 AND ticket_decision_days <= 30),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erstelle einen Trigger für games updated_at
CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON games 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Erstelle einen Index für das Spiel-Datum
CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);

-- Erstelle die ticket_applications-Tabelle für Ticket-Bewerbungen
CREATE TABLE IF NOT EXISTS ticket_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decided_at TIMESTAMP WITH TIME ZONE,
  decided_by UUID REFERENCES users(id),
  UNIQUE(user_id, game_id) -- Ein Benutzer kann sich nur einmal pro Spiel bewerben
);

-- Erstelle einen Index für Ticket-Bewerbungen
CREATE INDEX IF NOT EXISTS idx_ticket_applications_user ON ticket_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_applications_game ON ticket_applications(game_id);
CREATE INDEX IF NOT EXISTS idx_ticket_applications_status ON ticket_applications(status);

-- Erstelle eine Funktion um zu prüfen, ob ein Benutzer kürzlich ein Ticket bekommen hat
CREATE OR REPLACE FUNCTION has_recent_ticket(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ticket_applications ta
    JOIN games g ON ta.game_id = g.id
    WHERE ta.user_id = user_uuid 
    AND ta.status = 'approved'
    AND ta.decided_at >= NOW() - INTERVAL '1 day' * days_back
  );
END;
$$ LANGUAGE plpgsql;

-- Füge Demo-Benutzer hinzu (Passwort: admin123)
INSERT INTO users (email, password, name, role) 
VALUES ('admin@example.com', 'admin123', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Füge weitere Demo-Benutzer hinzu
INSERT INTO users (email, password, name, role) 
VALUES 
  ('user1@example.com', 'user123', 'Max Mustermann', 'user'),
  ('user2@example.com', 'user456', 'Anna Schmidt', 'user')
ON CONFLICT (email) DO NOTHING;

-- Füge Demo-Spiele hinzu
INSERT INTO games (team1, team2, total_tickets, available_tickets, game_date, created_by) 
VALUES 
  ('FC Bayern München', 'Borussia Dortmund', 50000, 50000, NOW() + INTERVAL '7 days', (SELECT id FROM users WHERE email = 'admin@example.com')),
  ('Real Madrid', 'FC Barcelona', 80000, 80000, NOW() + INTERVAL '14 days', (SELECT id FROM users WHERE email = 'admin@example.com')),
  ('Manchester United', 'Liverpool FC', 75000, 75000, NOW() + INTERVAL '21 days', (SELECT id FROM users WHERE email = 'admin@example.com'))
ON CONFLICT DO NOTHING;
