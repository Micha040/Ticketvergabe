import { useState, useEffect } from 'react'
import { GameService } from '../lib/gameService'
import { TicketService } from '../lib/ticketService'
import { AuthService } from '../lib/auth'

// Definiere die Typen direkt hier
interface Game {
  id: string;
  team1: string;
  team2: string;
  total_tickets: number;
  available_tickets: number;
  game_date: string;
  ticket_decision_days: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Application {
  id: string;
  user_id: string;
  game_id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  decided_at?: string;
  decided_by?: string;
  users: {
    email: string;
    name: string;
  };
  games: {
    team1: string;
    team2: string;
    game_date: string;
    available_tickets: number;
    ticket_decision_days: number;
  };
}

export default function GameManagement() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  
  // Formular-Felder
  const [team1, setTeam1] = useState('')
  const [team2, setTeam2] = useState('')
  const [totalTickets, setTotalTickets] = useState('')
  const [gameDate, setGameDate] = useState('')
  const [gameTime, setGameTime] = useState('')
  const [ticketDecisionDays, setTicketDecisionDays] = useState('7')

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      const result = await GameService.getAllGames()
      if (result.success && result.games) {
        setGames(result.games)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Fehler beim Laden der Spiele')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        setMessage('Nicht angemeldet')
        return
      }

      // Kombiniere Datum und Zeit
      const combinedDateTime = `${gameDate}T${gameTime}`

      const result = await GameService.createGame({
        team1,
        team2,
        total_tickets: parseInt(totalTickets),
        game_date: combinedDateTime,
        ticket_decision_days: parseInt(ticketDecisionDays)
      }, currentUser.id)

      if (result.success) {
        setMessage(result.message)
        // Formular zurücksetzen
        setTeam1('')
        setTeam2('')
        setTotalTickets('')
        setGameDate('')
        setGameTime('')
        setTicketDecisionDays('7')
        setShowCreateForm(false)
        loadGames() // Liste neu laden
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Unerwarteter Fehler beim Erstellen des Spiels')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Möchtest du dieses Spiel wirklich löschen?')) {
      return
    }

    try {
      const result = await GameService.deleteGame(gameId)
      if (result.success) {
        setMessage(result.message)
        loadGames() // Liste neu laden
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Fehler beim Löschen des Spiels')
    }
  }

  const handleViewApplications = async (gameId: string) => {
    setSelectedGame(gameId)
    setLoadingApplications(true)
    setMessage('')

    try {
      const result = await TicketService.getApplicationsForGame(gameId)
      if (result.success && result.applications) {
        setApplications(result.applications)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Fehler beim Laden der Bewerbungen')
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleDecideApplications = async (gameId: string) => {
    if (!confirm('Möchtest du alle ausstehenden Bewerbungen für dieses Spiel entscheiden? Dies kann nicht rückgängig gemacht werden.')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        setMessage('Nicht angemeldet')
        return
      }

      const result = await TicketService.decideApplications(gameId, currentUser.id)
      if (result.success) {
        setMessage(result.message)
        // Bewerbungen neu laden
        handleViewApplications(gameId)
        // Spiele neu laden um verfügbare Tickets zu aktualisieren
        loadGames()
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Fehler beim Entscheiden der Bewerbungen')
    } finally {
      setLoading(false)
    }
  }

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatApplicationDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getApplicationStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend'
      case 'approved':
        return 'Genehmigt'
      case 'rejected':
        return 'Abgelehnt'
      default:
        return 'Unbekannt'
    }
  }

  const getApplicationStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'approved':
        return 'status-approved'
      case 'rejected':
        return 'status-rejected'
      default:
        return ''
    }
  }

  const getSelectedGame = () => {
    return games.find(game => game.id === selectedGame)
  }

  if (loading && games.length === 0) {
    return <div className="loading">Lade Spiele...</div>
  }

  return (
    <div className="game-management">
      <div className="game-header">
        <h2>Spiel-Verwaltung</h2>
        <p>Erstelle und verwalte Spiele für die Ticketvergabe</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Formular schließen' : 'Neues Spiel erstellen'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showCreateForm && (
        <div className="create-game-form">
          <h3>Neues Spiel erstellen</h3>
          <form onSubmit={handleCreateGame}>
            <div className="form-row">
              <div className="form-group">
                <label>Verein 1:</label>
                <input
                  type="text"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  className="form-input"
                  placeholder="z.B. FC Bayern München"
                  required
                />
              </div>
              <div className="form-group">
                <label>Verein 2:</label>
                <input
                  type="text"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  className="form-input"
                  placeholder="z.B. Borussia Dortmund"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Anzahl Tickets:</label>
                <input
                  type="number"
                  value={totalTickets}
                  onChange={(e) => setTotalTickets(e.target.value)}
                  className="form-input"
                  placeholder="z.B. 50000"
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Datum:</label>
                <input
                  type="date"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Uhrzeit:</label>
                <input
                  type="time"
                  value={gameTime}
                  onChange={(e) => setGameTime(e.target.value)}
                  className="form-input"
                  placeholder="z.B. 20:30"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ticketvergabe (Tage vor Spiel):</label>
                <input
                  type="number"
                  value={ticketDecisionDays}
                  onChange={(e) => setTicketDecisionDays(e.target.value)}
                  className="form-input"
                  placeholder="z.B. 7"
                  min="1"
                  max="30"
                  required
                />
                <small className="form-help">Wann sollen die Tickets vergeben werden? (1-30 Tage vor dem Spiel)</small>
              </div>
            </div>
            <div className="button-group">
              <button
                type="submit"
                disabled={loading}
                className="form-button"
              >
                {loading ? 'Wird erstellt...' : 'Spiel erstellen'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="form-button secondary"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="games-list">
        <h3>Alle Spiele</h3>
        {games.length === 0 ? (
          <p className="no-games">Noch keine Spiele vorhanden.</p>
        ) : (
          <div className="games-table">
            <table>
              <thead>
                <tr>
                  <th>Teams</th>
                  <th>Datum & Uhrzeit</th>
                  <th>Tickets</th>
                  <th>Verfügbar</th>
                  <th>Ticketvergabe</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr key={game.id}>
                    <td>
                      <strong>{game.team1}</strong> vs <strong>{game.team2}</strong>
                    </td>
                    <td>{formatGameDate(game.game_date)}</td>
                    <td>{game.total_tickets.toLocaleString('de-DE')}</td>
                    <td>
                      <span className={`ticket-status ${game.available_tickets > 0 ? 'available' : 'sold-out'}`}>
                        {game.available_tickets.toLocaleString('de-DE')}
                      </span>
                    </td>
                    <td>{game.ticket_decision_days} Tage vorher</td>
                    <td>
                      <div className="actions">
                        <button
                          onClick={() => handleViewApplications(game.id)}
                          className="btn btn-primary"
                        >
                          Bewerbungen
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="btn btn-danger"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bewerbungen für ausgewähltes Spiel */}
      {selectedGame && (
        <div className="applications-section">
          <div className="applications-header">
            <h3>Bewerbungen für: {getSelectedGame()?.team1} vs {getSelectedGame()?.team2}</h3>
            <button
              onClick={() => setSelectedGame(null)}
              className="btn btn-secondary"
            >
              Schließen
            </button>
          </div>

          {loadingApplications ? (
            <div className="loading">Lade Bewerbungen...</div>
          ) : applications.length === 0 ? (
            <p className="no-applications">Keine Bewerbungen für dieses Spiel vorhanden.</p>
          ) : (
            <>
              <div className="applications-actions">
                <button
                  onClick={() => handleDecideApplications(selectedGame)}
                  disabled={loading || !applications.some(app => app.status === 'pending')}
                  className="btn btn-primary"
                >
                  {loading ? 'Wird verarbeitet...' : 'Alle Bewerbungen entscheiden'}
                </button>
              </div>

              <div className="applications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Benutzer</th>
                      <th>E-Mail</th>
                      <th>Bewerbung eingereicht</th>
                      <th>Status</th>
                      <th>Entscheidung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(application => (
                      <tr key={application.id}>
                        <td>{application.users.name || 'Unbekannt'}</td>
                        <td>{application.users.email}</td>
                        <td>{formatApplicationDate(application.applied_at)}</td>
                        <td>
                          <span className={`status-badge ${getApplicationStatusClass(application.status)}`}>
                            {getApplicationStatusText(application.status)}
                          </span>
                        </td>
                        <td>
                          {application.decided_at ? formatApplicationDate(application.decided_at) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
