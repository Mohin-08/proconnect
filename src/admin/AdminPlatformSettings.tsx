// src/admin/AdminPlatformSettings.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type SettingsRow = {
  id: number
  platform_name: string | null
  support_email: string | null
  commission_rate: number | null
  enable_two_factor: boolean | null
  require_email_verification: boolean | null
  send_welcome_emails: boolean | null
  send_weekly_reports: boolean | null
}

export default function AdminPlatformSettings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SettingsRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<SettingsRow | null>(null)

  useEffect(() => {
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }

      const { data, error } = await supabase
        .from('platform_settings')
        .select(
          'id, platform_name, support_email, commission_rate, enable_two_factor, require_email_verification, send_welcome_emails, send_weekly_reports'
        )
        .limit(1)

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      if (!data || data.length === 0) {
        alert(
          'No platform_settings row found. Insert one row in the table first.'
        )
        return
      }

      setSettings(data[0] as SettingsRow)
      setOriginalSettings(data[0] as SettingsRow)
    }

    load()
  }, [navigate])

  const handleChange = (
    field: keyof SettingsRow,
    value: string | number | boolean
  ) => {
    if (!settings || !isEditing) return
    setSettings({ ...settings, [field]: value } as SettingsRow)
  }

  const startEdit = () => {
    setIsEditing(true)
    if (settings) {
      setOriginalSettings({ ...settings })
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    if (originalSettings) {
      setSettings({ ...originalSettings })
    }
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const { id, ...rest } = settings
      const { error } = await supabase
        .from('platform_settings')
        .update(rest)
        .eq('id', id)

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      alert('Settings saved successfully.')
      setOriginalSettings({ ...settings })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!settings) {
    return <div className="admin-page">Loading settings…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="logo">ProConnect</div>
        <nav>
          <button className="nav-item" onClick={() => navigate('/admin')}>
            Overview
          </button>
          <button className="nav-item" onClick={() => navigate('/admin/users')}>
            User Management
          </button>
          <button className="nav-item" onClick={() => navigate('/admin/services')}>
            Service Listings
          </button>
          <button
            className="nav-item active"
            onClick={() => navigate('/admin/settings')}
          >
            Platform Settings
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-info">
            <span className="avatar">A</span>
            <div>
              <div className="admin-name">Admin User</div>
              <div className="admin-role">Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="header">
          <div>
            <h1>Platform Settings</h1>
            <p>Configure and manage your platform settings</p>
          </div>
          {!isEditing ? (
            <button className="add-btn" onClick={startEdit}>
              Edit Settings
            </button>
          ) : null}
        </header>

        <section className="table-section">
          <div className="settings-section">
            <h3 className="settings-section-title">General Settings</h3>
            <div className="settings-group">
              <label>
                Platform Name
                <input
                  type="text"
                  value={settings.platform_name || ''}
                  onChange={(e) =>
                    handleChange('platform_name', e.target.value)
                  }
                  placeholder="Enter platform name"
                  disabled={!isEditing}
                />
              </label>
              <label>
                Support Email
                <input
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) =>
                    handleChange('support_email', e.target.value)
                  }
                  placeholder="support@example.com"
                  disabled={!isEditing}
                />
              </label>
              <label>
                Commission Rate (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.commission_rate ?? 0}
                  onChange={(e) =>
                    handleChange('commission_rate', Number(e.target.value))
                  }
                  placeholder="10"
                  disabled={!isEditing}
                />
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Security Settings</h3>
            <div className="settings-group settings-checks">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!settings.enable_two_factor}
                  onChange={(e) =>
                    handleChange('enable_two_factor', e.target.checked)
                  }
                  disabled={!isEditing}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Enable Two-Factor Authentication</span>
                  <span className="checkbox-description">Add an extra layer of security to user accounts</span>
                </div>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!settings.require_email_verification}
                  onChange={(e) =>
                    handleChange(
                      'require_email_verification',
                      e.target.checked
                    )
                  }
                  disabled={!isEditing}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Require Email Verification</span>
                  <span className="checkbox-description">Users must verify their email before accessing the platform</span>
                </div>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Notification Settings</h3>
            <div className="settings-group settings-checks">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!settings.send_welcome_emails}
                  onChange={(e) =>
                    handleChange('send_welcome_emails', e.target.checked)
                  }
                  disabled={!isEditing}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Send Welcome Emails</span>
                  <span className="checkbox-description">Automatically send welcome emails to new users</span>
                </div>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!settings.send_weekly_reports}
                  onChange={(e) =>
                    handleChange('send_weekly_reports', e.target.checked)
                  }
                  disabled={!isEditing}
                />
                <div className="checkbox-content">
                  <span className="checkbox-title">Send Weekly Reports</span>
                  <span className="checkbox-description">Receive weekly analytics and activity reports</span>
                </div>
              </label>
            </div>
          </div>

          {isEditing && (
            <div className="settings-actions">
              <button
                className="cancel-btn"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="add-btn save-settings-btn"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>
          )}
        </section>
        
        <footer className="site-footer">
          <div className="footer-content">
            <div className="footer-support">
              <strong>Support:</strong>
              <a href="mailto:2400030974@kluniversity.in" className="footer-email">2400030974@kluniversity.in</a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} ProConnect. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
