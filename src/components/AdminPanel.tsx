import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  password: string | null
  name?: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')

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
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Unerwarteter Fehler:', error)
      setMessage('Unerwarteter Fehler beim Laden der Benutzer')
    } finally {
      setLoading(false)
    }
  }

  const handleSetPassword = async () => {
    if (!selectedUser || !newPassword.trim()) {
      setMessage('Bitte wähle einen Benutzer aus und gib ein Passwort ein')
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ password: newPassword.trim() })
        .eq('id', selectedUser.id)

      if (error) {
        console.error('Fehler beim Setzen des Passworts:', error)
        setMessage('Fehler beim Setzen des Passworts')
      } else {
        setMessage(`Passwort für ${selectedUser.email} erfolgreich gesetzt!`)
        setNewPassword('')
        setSelectedUser(null)
        loadUsers() // Liste neu laden
      }
    } catch (error) {
      console.error('Unerwarteter Fehler:', error)
      setMessage('Unerwarteter Fehler beim Setzen des Passworts')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Möchtest du diesen Benutzer wirklich löschen?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Fehler beim Löschen des Benutzers:', error)
        setMessage('Fehler beim Löschen des Benutzers')
      } else {
        setMessage('Benutzer erfolgreich gelöscht!')
        loadUsers() // Liste neu laden
      }
    } catch (error) {
      console.error('Unerwarteter Fehler:', error)
      setMessage('Unerwarteter Fehler beim Löschen des Benutzers')
    }
  }

  if (loading) {
    return <div className="loading">Lade Benutzer...</div>
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin-Panel - Benutzerverwaltung</h2>
        <p>Verwalte Benutzer und setze Passwörter</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-content">
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
                  <th>Erstellt</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={selectedUser?.id === user.id ? 'selected' : ''}>
                    <td>{user.email}</td>
                    <td>{user.name || '-'}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.password ? (
                        <span className="status-active">Aktiv</span>
                      ) : (
                        <span className="status-pending">Wartet auf Passwort</span>
                      )}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('de-DE')}</td>
                    <td>
                      <div className="actions">
                        {!user.password && (
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="btn btn-primary"
                          >
                            Passwort setzen
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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

        {selectedUser && (
          <div className="password-form">
            <h3>Passwort für {selectedUser.email} setzen</h3>
            <div className="form-group">
              <input
                type="password"
                placeholder="Neues Passwort"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="button-group">
              <button
                onClick={handleSetPassword}
                disabled={!newPassword.trim()}
                className="form-button"
              >
                Passwort setzen
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setNewPassword('')
                }}
                className="form-button secondary"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
