import { useState, useEffect } from 'react'
import { AuthService } from './lib/auth'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Prüfe den aktuellen Authentifizierungsstatus
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (loading) {
    return (
      <div className="loading">
        <div>Laden...</div>
      </div>
    )
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  )
}

export default App
