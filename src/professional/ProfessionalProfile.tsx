import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type ProRow = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  location: string | null
  bio: string | null
  avatar_url: string | null
  role: string | null
}

export default function ProfessionalProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location, bio, avatar_url, role')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error(error)
        alert(error.message)
        setLoading(false)
        return
      }

      setProfile(data as ProRow)
      setLoading(false)
    }

    load()
  }, [navigate])

  const handleChange = (
    field: keyof ProRow,
    value: string | null
  ) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value } as ProRow)
  }

  const save = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { id, role, ...rest } = profile
      console.log('Saving profile:', { id, rest })
      
      const { data, error } = await supabase
        .from('profiles')
        .update(rest)
        .eq('id', id)
        .select()

      console.log('Update response:', { data, error })

      if (error) {
        console.error('Update error:', error)
        alert(error.message)
        return
      }

      alert('Profile updated successfully.')
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    // Reload profile to discard changes
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location, bio, avatar_url, role')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setProfile(data as ProRow)
      }
    }
    load()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!profile) {
    // Show loading state
    if (loading) {
      return (
        <div className="admin-page">
          <aside className="sidebar">
            <div className="logo">ProConnect</div>
            <nav>
              <button className="nav-item" onClick={() => navigate('/professional')}>
                Dashboard
              </button>
              <button className="nav-item" onClick={() => navigate('/professional/jobs')}>
                Active Jobs
              </button>
              <button
                className="nav-item"
                onClick={() => navigate('/professional/services')}
              >
                My Services
              </button>
              <button
                className="nav-item active"
                onClick={() => navigate('/professional/profile')}
              >
                Profile
              </button>
              <button
                className="nav-item"
                onClick={() => navigate('/professional/messages')}
              >
                Messages
              </button>
            </nav>
          </aside>
          <main className="content">
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <h2>Loading your profile...</h2>
            </div>
          </main>
        </div>
      )
    }

    return <div className="admin-page">Loading profile…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="logo">ProConnect</div>
        <nav>
          <button className="nav-item" onClick={() => navigate('/professional')}>
            Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate('/professional/jobs')}>
            Active Jobs
          </button>
          <button
            className="nav-item"
            onClick={() => navigate('/professional/services')}
          >
            My Services
          </button>
          <button
            className="nav-item active"
            onClick={() => navigate('/professional/profile')}
          >
            Profile
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-info">
            <span className="avatar">P</span>
            <div>
              <div className="admin-name">
                {profile.full_name || 'Professional'}
              </div>
              <div className="admin-role">Professional</div>
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
            <h1>Professional Profile</h1>
            <p>Manage your professional information and availability</p>
          </div>
          {!isEditing ? (
            <button
              className="add-btn"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '10px 24px',
                fontSize: '15px'
              }}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <button
              className="delete-btn"
              onClick={cancelEdit}
              style={{
                padding: '10px 24px',
                fontSize: '15px'
              }}
            >
              ✕ Cancel
            </button>
          )}
        </header>

        <section className="table-section">
          <div className="settings-section">
            <h3 className="settings-section-title">Basic Information</h3>
            <div className="settings-group">
              <label>
                Full Name
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) =>
                    handleChange('full_name', e.target.value)
                  }
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={!isEditing}
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  disabled={!isEditing}
                />
              </label>
              <label>
                Location
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) =>
                    handleChange('location', e.target.value)
                  }
                  placeholder="City, State/Country"
                  disabled={!isEditing}
                />
              </label>
              <label>
                Bio
                <textarea
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                  disabled={!isEditing}
                  style={{
                    borderRadius: 12,
                    border: '2px solid #e5e7eb',
                    padding: '12px 16px',
                    resize: 'vertical',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit'
                  }}
                />
              </label>
            </div>
          </div>

          {isEditing && (
            <div className="settings-actions">
              <button
                className="add-btn save-settings-btn"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Profile'}
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
