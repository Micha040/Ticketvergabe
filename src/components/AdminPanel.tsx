import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  role: 'admin' | 'user';
  created_at: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Benutzer:', error)
        setMessage('Fehler beim Laden der Benutzer')
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Unerwarteter Fehler:', error)
      setMessage('Unerwarteter Fehler beim Laden der Benutzer')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !newPassword.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({ password: newPassword.trim() })
        .eq('id', selectedUser)

      if (error) {
        console.error('Fehler beim Setzen des Passworts:', error)
        setMessage('Fehler beim Setzen des Passworts')
        return
      }

      setMessage('Passwort erfolgreich gesetzt!')
      setNewPassword('')
      setShowPasswordForm(false)
      setSelectedUser(null)
      loadUsers() // Liste neu laden
    } catch (error) {
      console.error('Unerwarteter Fehler:', error)
      setMessage('Unerwarteter Fehler beim Setzen des Passworts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Möchtest du den Benutzer "${userEmail}" wirklich löschen?`)) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Fehler beim Löschen des Benutzers:', error)
        setMessage('Fehler beim Löschen des Benutzers')
        return
      }

      setMessage('Benutzer erfolgreich gelöscht!')
      loadUsers() // Liste neu laden
    } catch (error) {
      console.error('Unerwarteter Fehler:', error)
      setMessage('Unerwarteter Fehler beim Löschen des Benutzers')
    } finally {
      setLoading(false)
    }
  }

  const isBlockedEmail = (email: string): boolean => {
    const domain = email.toLowerCase().split('@')[1];
    return domain === 'mailrez.com';
  }

  if (loading && users.length === 0) {
    return <div className="loading">Lade Benutzer...</div>
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Benutzer-Verwaltung</h2>
        <p>Verwalte Benutzer und setze Passwörter</p>
      </div>

      <div className="admin-content">
        {message && (
          <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="users-list">
          <h3>Alle Benutzer</h3>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>E-Mail</th>
                  <th>Name</th>
                  <th>Rolle</th>
                  <th>Status</th>
                  <th>Registriert</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={isBlockedEmail(user.email) ? 'blocked-user' : ''}>
                    <td>
                      {user.email}
                      {isBlockedEmail(user.email) && (
                        <span className="blocked-badge">BLOCKIERT</span>
                      )}
                    </td>
                    <td>{user.name || '-'}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={user.password ? 'status-active' : 'status-pending'}>
                        {user.password ? 'Aktiv' : 'Wartet auf Passwort'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td>
                      <div className="actions">
                        {!user.password && user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              setSelectedUser(user.id)
                              setShowPasswordForm(true)
                            }}
                            className="btn btn-primary"
                          >
                            Passwort setzen
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="btn btn-danger"
                          >
                            Löschen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showPasswordForm && (
          <div className="password-form">
            <h3>Passwort für Benutzer setzen</h3>
            <form onSubmit={handleSetPassword}>
              <div className="form-group">
                <label>Neues Passwort:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Neues Passwort eingeben"
                  required
                  minLength={6}
                />
              </div>
              <div className="button-group">
                <button
                  type="submit"
                  disabled={loading}
                  className="form-button"
                >
                  {loading ? 'Wird gesetzt...' : 'Passwort setzen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setSelectedUser(null)
                    setNewPassword('')
                  }}
                  className="form-button secondary"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
