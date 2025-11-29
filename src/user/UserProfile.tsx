import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type UserProfile = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  location: string | null
  bio: string | null
  avatar_url: string | null
}

export default function UserProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showCreatePrompt, setShowCreatePrompt] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userName, setUserName] = useState('User')

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
      const userId = session.user.id

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location, bio, avatar_url')
        .eq('id', userId)
        .limit(1)

      if (error) {
        console.error(error)
        setLoading(false)
        alert(error.message)
        return
      }

      if (!data || data.length === 0) {
        setShowCreatePrompt(true)
        setLoading(false)
      } else {
        const profileData = data[0] as UserProfile
        setProfile(profileData)
        const name = profileData.full_name || session.user.email || 'User'
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  const createProfile = async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session) return

    const insert = {
      id: session.user.id,
      full_name: session.user.user_metadata.full_name || session.user.email,
      email: session.user.email,
      role: 'user',
      status: 'active'
    }

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert(insert)
      .select('id, full_name, email, phone, location, bio, avatar_url')
      .single()

    if (insertError) {
      console.error(insertError)
      alert(insertError.message)
      return
    }
    setProfile(created as UserProfile)
    setShowCreatePrompt(false)
    setIsEditing(true)
  }

  const handleChange = (
    field: keyof UserProfile,
    value: string | null
  ) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value } as UserProfile)
  }

  const save = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { id, ...rest } = profile
      const { error } = await supabase
        .from('profiles')
        .update(rest)
        .eq('id', id)

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      alert('Profile updated successfully.')
      setIsEditing(false)
      
      // Update userName
      if (profile.full_name) {
        const name = profile.full_name
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
      }
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location, bio, avatar_url')
        .eq('id', session.user.id)
        .limit(1)

      if (data && data.length > 0) {
        setProfile(data[0] as UserProfile)
      }
    }
    load()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!profile) {
    if (loading) {
      return (
        <div className="admin-page">
          <aside className="sidebar" style={{ background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)' }}>
            <div className="logo" style={{ color: 'white' }}>ProConnect</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', padding: '0 20px', marginBottom: '10px', fontSize: '12px' }}>
              User Portal
            </div>
            <nav>
              <button className="nav-item" onClick={() => navigate('/user')}>
                <span className="icon">🔍</span> Find Professionals
              </button>
              <button className="nav-item" onClick={() => navigate('/user/my-hires')}>
                <span className="icon">💼</span> My Hires
              </button>
              <button className="nav-item" onClick={() => navigate('/user/favorites')}>
                <span className="icon">⭐</span> Favorites
              </button>
              <button className="nav-item active" onClick={() => navigate('/user/profile')}>
                <span className="icon">👤</span> Profile
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

    if (showCreatePrompt) {
      return (
        <div className="admin-page">
          <aside className="sidebar" style={{ background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)' }}>
            <div className="logo" style={{ color: 'white' }}>ProConnect</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', padding: '0 20px', marginBottom: '10px', fontSize: '12px' }}>
              User Portal
            </div>
            <nav>
              <button className="nav-item" onClick={() => navigate('/user')}>
                <span className="icon">🔍</span> Find Professionals
              </button>
              <button className="nav-item" onClick={() => navigate('/user/my-hires')}>
                <span className="icon">💼</span> My Hires
              </button>
              <button className="nav-item" onClick={() => navigate('/user/favorites')}>
                <span className="icon">⭐</span> Favorites
              </button>
              <button className="nav-item active" onClick={() => navigate('/user/profile')}>
                <span className="icon">👤</span> Profile
              </button>
            </nav>
          </aside>
          <main className="content">
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>👤</div>
              <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#1f2937' }}>
                No Profile Found
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                You haven't created your profile yet. Create one now to get personalized recommendations and save your preferences.
              </p>
              <button
                className="add-btn"
                onClick={createProfile}
                style={{
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Create Your Profile
              </button>
            </div>
          </main>
        </div>
      )
    }

    return <div className="admin-page">Loading profile…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar" style={{ background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)' }}>
        <div className="logo" style={{ color: 'white' }}>ProConnect</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', padding: '0 20px', marginBottom: '10px', fontSize: '12px' }}>
          User Portal
        </div>
        <nav>
          <button className="nav-item" onClick={() => navigate('/user')}>
            <span className="icon">🔍</span> Find Professionals
          </button>
          <button className="nav-item" onClick={() => navigate('/user/my-hires')}>
            <span className="icon">💼</span> My Hires
          </button>
          <button className="nav-item" onClick={() => navigate('/user/favorites')}>
            <span className="icon">⭐</span> Favorites
          </button>
          <button className="nav-item active" onClick={() => navigate('/user/profile')}>
            <span className="icon">👤</span> Profile
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-info">
            <span className="avatar" style={{ background: '#3498db' }}>{userName.charAt(0).toUpperCase()}</span>
            <div>
              <div className="admin-name">{userName}</div>
              <div className="admin-role">User</div>
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
            <h1>My Profile</h1>
            <p>Manage your personal information and preferences</p>
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
                  onChange={(e) => handleChange('full_name', e.target.value)}
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
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="City, State/Country"
                  disabled={!isEditing}
                />
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">About You</h3>
            <div className="settings-group">
              <label>
                Bio
                <textarea
                  rows={4}
                  value={profile.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us a bit about yourself..."
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
