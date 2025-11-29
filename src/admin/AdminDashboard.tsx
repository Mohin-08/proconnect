import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  status: string | null
  phone: string | null
  location: string | null
  bio: string | null
  avatar_url: string | null
  created_at?: string
}

type Stats = {
  totalUsers: number
  professionals: number
  activeJobs: number
  completedJobs: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    professionals: 0,
    activeJobs: 0,
    completedJobs: 0
  })
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('Admin User')
  const [selectedUser, setSelectedUser] = useState<ProfileRow | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }

      // Get admin profile
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()

      if (adminProfile?.full_name) {
        setAdminName(adminProfile.full_name.charAt(0).toUpperCase() + adminProfile.full_name.slice(1))
      } else if (session.user.email) {
        const emailName = session.user.email.split('@')[0]
        setAdminName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
      }

      const [allProfilesRes, proCountRes, activeJobsRes, completedJobsRes] =
        await Promise.all([
          supabase.from('profiles').select('id, full_name, email, role, status, phone, location, bio, avatar_url, created_at'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'professional'),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'accepted', 'in_progress']),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed')
        ])

      console.log('Admin Stats Debug:', {
        allProfiles: allProfilesRes.data?.length,
        professionals: proCountRes.count,
        activeJobs: activeJobsRes.count,
        completedJobs: completedJobsRes.count,
        activeJobsError: activeJobsRes.error,
        completedJobsError: completedJobsRes.error
      })

      setProfiles(allProfilesRes.data || [])
      setStats({
        totalUsers: allProfilesRes.data ? allProfilesRes.data.length : 0,
        professionals: proCountRes.count ?? 0,
        activeJobs: activeJobsRes.count ?? 0,
        completedJobs: completedJobsRes.count ?? 0
      })
      setLoading(false)
    }

    load()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleViewUser = (user: ProfileRow) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => setSelectedUser(null), 300)
  }

  if (loading) {
    return <div className="admin-page">Loading dashboard…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="logo">ProConnect</div>
        <nav>
          <button className="nav-item active" onClick={() => navigate('/admin')}>Overview</button>
          <button className="nav-item" onClick={() => navigate('/admin/users')}>User Management</button>
          <button className="nav-item" onClick={() => navigate('/admin/services')}>Service Listings</button>
          <button className="nav-item" onClick={() => navigate('/admin/settings')}>Platform Settings</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-info">
            <span className="avatar">{adminName.charAt(0).toUpperCase()}</span>
            <div>
              <div className="admin-name">{adminName}</div>
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
          <h1>Dashboard</h1>
          <p>Welcome back, {adminName}!</p>
        </header>

        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Professionals</div>
            <div className="stat-value">{stats.professionals}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Jobs</div>
            <div className="stat-value">{stats.activeJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Jobs</div>
            <div className="stat-value">{stats.completedJobs}</div>
          </div>
        </section>

        <section className="table-section">
          <h2>Recent User Activity</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name || '-'}</td>
                  <td>{p.email}</td>
                  <td>
                    <span className={`badge role-${p.role}`}>{p.role}</span>
                  </td>
                  <td>
                    <span className={`badge status-${p.status}`}>{p.status}</span>
                  </td>
                  <td>
                    <button className="btn-small" onClick={() => handleViewUser(p)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            
            <div className="user-details-header">
              <div className="user-avatar-large">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt={selectedUser.full_name || 'User'} />
                ) : (
                  <span>{(selectedUser.full_name || selectedUser.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h2>{selectedUser.full_name || 'No Name'}</h2>
                <p className="user-email">{selectedUser.email}</p>
              </div>
            </div>

            <div className="user-details-grid">
              <div className="detail-item">
                <label>Role</label>
                <span className={`badge role-${selectedUser.role}`}>{selectedUser.role}</span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span className={`badge status-${selectedUser.status}`}>{selectedUser.status}</span>
              </div>
              <div className="detail-item">
                <label>Phone</label>
                <p>{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div className="detail-item">
                <label>Location</label>
                <p>{selectedUser.location || 'Not provided'}</p>
              </div>
              <div className="detail-item full-width">
                <label>Bio</label>
                <p>{selectedUser.bio || 'No bio available'}</p>
              </div>
              {selectedUser.created_at && (
                <div className="detail-item full-width">
                  <label>Joined</label>
                  <p>{new Date(selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
