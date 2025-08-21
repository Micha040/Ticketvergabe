import { useState } from 'react'
import { AuthService } from '../lib/auth'

interface LoginProps {
  onLoginSuccess: () => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const result = await AuthService.requestLogin(email)
      
      if (result.success) {
        setSuccessMessage(result.message)
        setStep('password')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await AuthService.login(email, password)
      
      if (result.success) {
        onLoginSuccess()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setPassword('')
    setError('')
    setSuccessMessage('')
  }

  return (
    <div className="login-container">
      <img src="/comp.png" alt="Logo" className="login-image" />
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">
            Anmeldung
          </h2>
          <p className="login-subtitle">
            {step === 'email' 
              ? 'Gib deine E-Mail-Adresse ein, um einen Account zu erstellen oder dich anzumelden'
              : 'Gib das Passwort ein, das dir vom Administrator zugesendet wurde'
            }
          </p>
        </div>

        {step === 'email' ? (
          <form className="login-form" onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="form-button"
            >
              {loading ? 'Wird verarbeitet...' : 'Account erstellen / Anmelden'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handlePasswordSubmit}>
            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            <div className="form-group">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="button-group">
              <button
                type="button"
                onClick={handleBackToEmail}
                className="form-button secondary"
              >
                Zurück
              </button>
              <button
                type="submit"
                disabled={loading}
                className="form-button"
              >
                {loading ? 'Anmeldung läuft...' : 'Anmelden'}
              </button>
            </div>
          </form>
        )}

        <div className="demo-credentials">
          <p>Demo-Anmeldedaten:</p>
          <p>E-Mail: admin@example.com</p>
          <p>Passwort: admin123</p>
          <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
            Oder gib eine neue E-Mail ein, um einen Account zu erstellen
          </p>
        </div>
      </div>
    </div>
  )
}
