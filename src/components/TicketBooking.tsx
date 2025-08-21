import { useState, useEffect } from 'react'
import { TicketService } from '../lib/ticketService'
import { AuthService } from '../lib/auth'

// Definiere die Typen direkt hier
interface GameWithApplications {
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
  user_application?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    applied_at: string;
    decided_at?: string;
  };
  can_apply: boolean;
  days_until_game: number;
}

export default function TicketBooking() {
  const [games, setGames] = useState<GameWithApplications[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [applyingForGame, setApplyingForGame] = useState<string | null>(null)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        setMessage('Nicht angemeldet')
        return
      }

      const result = await TicketService.getAvailableGames(currentUser.id)
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

  const handleApplyForTicket = async (gameId: string) => {
    setApplyingForGame(gameId)
    setMessage('')

    try {
      const currentUser = AuthService.getCurrentUser()
      if (!currentUser) {
        setMessage('Nicht angemeldet')
        return
      }

      const result = await TicketService.applyForTicket(currentUser.id, gameId)
      if (result.success) {
        setMessage(result.message)
        loadGames() // Liste neu laden
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Unerwarteter Fehler beim Einreichen der Bewerbung')
    } finally {
      setApplyingForGame(null)
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

  const getApplicationStatusText = (application: any) => {
    switch (application.status) {
      case 'pending':
        return 'Bewerbung eingereicht - Entscheidung folgt'
      case 'approved':
        return '✅ Ticket genehmigt!'
      case 'rejected':
        return '❌ Ticket abgelehnt'
      default:
        return 'Unbekannter Status'
    }
  }

  const getApplicationStatusClass = (application: any) => {
    switch (application.status) {
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

  if (loading) {
    return <div className="loading">Lade verfügbare Spiele...</div>
  }

  return (
    <div className="ticket-booking">
      <div className="booking-header">
        <h2>Ticketvergabe</h2>
        <p>Bewirb dich für Tickets zu den verfügbaren Spielen</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="games-list">
        {games.length === 0 ? (
          <div className="no-games">
            <h3>Keine Spiele verfügbar</h3>
            <p>Derzeit sind keine Spiele für die Ticketvergabe verfügbar.</p>
          </div>
        ) : (
          <div className="games-grid">
            {games.map(game => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <h3>{game.team1} vs {game.team2}</h3>
                  <div className="game-date">
                    {formatGameDate(game.game_date)}
                  </div>
                </div>
                
                <div className="game-details">
                  <div className="ticket-info">
                    <span className="label">Verfügbare Tickets:</span>
                    <span className="value">{game.available_tickets.toLocaleString('de-DE')}</span>
                  </div>
                  <div className="days-info">
                    <span className="label">Tage bis zum Spiel:</span>
                    <span className="value">{game.days_until_game}</span>
                  </div>
                  <div className="decision-info">
                    <span className="label">Ticketvergabe:</span>
                    <span className="value">{game.ticket_decision_days} Tage vorher</span>
                  </div>
                </div>

                {game.user_application ? (
                  <div className="application-status">
                    <div className={`status-badge ${getApplicationStatusClass(game.user_application)}`}>
                      {getApplicationStatusText(game.user_application)}
                    </div>
                    {game.user_application.status === 'pending' && (
                      <p className="status-note">
                        Du erhältst {game.ticket_decision_days} Tage vor dem Spiel Bescheid über deine Bewerbung.
                      </p>
                    )}
                  </div>
                ) : game.can_apply ? (
                  <button
                    onClick={() => handleApplyForTicket(game.id)}
                    disabled={applyingForGame === game.id}
                    className="btn btn-primary apply-button"
                  >
                    {applyingForGame === game.id ? 'Wird eingereicht...' : 'Für Ticket bewerben'}
                  </button>
                ) : (
                  <div className="cannot-apply">
                    <p>Bewerbungen sind nur bis {game.ticket_decision_days} Tage vor dem Spiel möglich</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="booking-info">
        <h3>Wie funktioniert die Ticketvergabe?</h3>
        <div className="info-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Bewerbung einreichen</h4>
              <p>Bewirb dich für ein Ticket bis zur konfigurierten Zeit vor dem Spiel.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Prioritäten-System</h4>
              <p>Benutzer ohne kürzliche Tickets haben Vorrang.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Entscheidung</h4>
              <p>Zum konfigurierten Zeitpunkt erhältst du Bescheid über deine Bewerbung.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
