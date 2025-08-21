import { useState } from 'react'
import { AuthService } from '../lib/auth'
import AdminPanel from './AdminPanel'
import GameManagement from './GameManagement'
import TicketBooking from './TicketBooking'

interface DashboardProps {
  onLogout: () => void
}

type TabType = 'ticketvergabe' | 'admin' | 'games'

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('ticketvergabe')
  const currentUser = AuthService.getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  const handleLogout = () => {
    AuthService.logout()
    onLogout()
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ticketvergabe':
        return <TicketBooking />
      case 'admin':
        return <AdminPanel />
      case 'games':
        return <GameManagement />
      default:
        return null
    }
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <h1 className="nav-title">
            Compagni St. Pauli
          </h1>
          <div className="nav-user">
            <span className="user-info">
              Angemeldet als: {currentUser?.email}
            </span>
            <button
              onClick={handleLogout}
              className="nav-button"
            >
              Abmelden
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-tabs">
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'ticketvergabe' ? 'active' : ''}`}
            onClick={() => setActiveTab('ticketvergabe')}
          >
            Ticketvergabe
          </button>
          {isAdmin && (
            <>
              <button
                className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
                onClick={() => setActiveTab('games')}
              >
                Spiele verwalten
              </button>
              <button
                className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                Benutzer verwalten
              </button>
            </>
          )}
        </div>
      </div>

      <main className="dashboard-main">
        {renderTabContent()}
      </main>
    </div>
  )
}
