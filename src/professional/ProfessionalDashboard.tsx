import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type Stats = {
  activeJobs: number
  completedJobs: number
  totalServices: number
  activeServices: number
}

type ActivityItem = {
  id: number
  title: string
  client_name: string | null
  type: 'booking' | 'completed' | 'review'
  created_at: string
}

type DeadlineItem = {
  id: number
  title: string
  client_name: string | null
  scheduled_at: string
}

export default function ProfessionalDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    completedJobs: 0,
    totalServices: 0,
    activeServices: 0
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [professionalName, setProfessionalName] = useState('Professional')
  const [professionalTitle, setProfessionalTitle] = useState('Professional')

  useEffect(() => {
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }
      const professionalId = session.user.id

      // Load professional profile
      const { data: profileData } = await supabase
        .from('professionals')
        .select('full_name, title')
        .eq('id', professionalId)
        .single()

      if (profileData) {
        const name = profileData.full_name || 'Professional'
        setProfessionalName(name.charAt(0).toUpperCase() + name.slice(1))
        const title = profileData.title || 'Professional'
        setProfessionalTitle(title.charAt(0).toUpperCase() + title.slice(1))
      }

      // stats
      const [{ count: activeJobsCount }, { count: completedJobsCount }, { count: totalServicesCount }, { count: activeServicesCount }] =
        await Promise.all([
          supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', professionalId)
            .in('status', ['pending', 'accepted', 'in_progress']),
          supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', professionalId)
            .eq('status', 'completed'),
          supabase
            .from('professional_services')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', professionalId),
          supabase
            .from('professional_services')
            .select('*', { count: 'exact', head: true })
            .eq('professional_id', professionalId)
            .eq('is_active', true)
        ])

      setStats({
        activeJobs: activeJobsCount || 0,
        completedJobs: completedJobsCount || 0,
        totalServices: totalServicesCount || 0,
        activeServices: activeServicesCount || 0
      })

      // recent activity: latest bookings for this professional
      const { data: recent, error: recentError } = await supabase
        .from('bookings')
        .select('id, title, client_id, status, created_at')
        .eq('professional_id', professionalId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!recentError && recent) {
        // Get client names
        const clientIds = recent.map((b: any) => b.client_id).filter(Boolean)
        const clientNames: Record<string, string> = {}
        
        if (clientIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', clientIds)
          
          profiles?.forEach((p: any) => {
            if (p.full_name) {
              clientNames[p.id] = p.full_name.charAt(0).toUpperCase() + p.full_name.slice(1)
            }
          })
        }

        const mapped: ActivityItem[] = recent.map((j: any) => {
          const clientName = clientNames[j.client_id] || 'Client'
          return {
            id: j.id,
            title:
              j.status === 'completed'
                ? `Job completed for ${clientName}`
                : `New booking from ${clientName}`,
            client_name: clientName,
            type: j.status === 'completed' ? ('completed' as const) : ('booking' as const),
            created_at: j.created_at
          }
        })
        setRecentActivity(mapped)
      }

      // upcoming deadlines: future scheduled bookings
      const { data: upcoming, error: upcomingError } = await supabase
        .from('bookings')
        .select('id, title, client_id, scheduled_at')
        .eq('professional_id', professionalId)
        .gte('scheduled_at', new Date().toISOString())
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('scheduled_at', { ascending: true })
        .limit(5)

      if (!upcomingError && upcoming) {
        // Get client names for deadlines
        const clientIds = upcoming.map((b: any) => b.client_id).filter(Boolean)
        const clientNames: Record<string, string> = {}
        
        if (clientIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', clientIds)
          
          profiles?.forEach((p: any) => {
            if (p.full_name) {
              clientNames[p.id] = p.full_name.charAt(0).toUpperCase() + p.full_name.slice(1)
            }
          })
        }

        const mapped: DeadlineItem[] = upcoming.map((j: any) => ({
          id: j.id,
          title: j.title,
          client_name: clientNames[j.client_id] || 'Client',
          scheduled_at: j.scheduled_at
        }))
        setDeadlines(mapped)
      }

      setLoading(false)
    }

    load()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return <div className="admin-page">Loading dashboard…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="logo">ProConnect</div>
        <nav>
          <button className="nav-item active" onClick={() => navigate('/professional')}>Dashboard</button>
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
            className="nav-item"
            onClick={() => navigate('/professional/profile')}
          >
            Profile
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-info">
            <span className="avatar">{professionalName.charAt(0).toUpperCase()}</span>
            <div>
              <div className="admin-name">{professionalName}</div>
              <div className="admin-role">{professionalTitle}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="header">
          <h1>Welcome Back!</h1>
          <p>Manage your services and connect with clients</p>
        </header>

        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Active Jobs</div>
            <div className="stat-value">{stats.activeJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completedJobs}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Services</div>
            <div className="stat-value">{stats.totalServices}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Services</div>
            <div className="stat-value">{stats.activeServices}</div>
          </div>
        </section>

        <div className="professional-grid">
          <section className="table-section">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((a) => (
                <div key={a.id} className="activity-item">
                  <div className="activity-content">
                    <span className="activity-title">{a.title}</span>
                    <span className={`badge status-${a.type === 'completed' ? 'active' : 'pending'}`}>
                      {a.type === 'completed' ? 'Completed' : 'New'}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="empty-state">No recent activity.</div>
              )}
            </div>
          </section>

          <section className="table-section">
            <h2>Upcoming Deadlines</h2>
            <div className="activity-list">
              {deadlines.map((d) => (
                <div key={d.id} className="activity-item">
                  <div className="activity-content">
                    <span className="activity-title">{d.title}</span>
                    <span className="activity-meta">
                      {d.client_name || 'Client'} • {new Date(d.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {deadlines.length === 0 && (
                <div className="empty-state">No upcoming deadlines.</div>
              )}
            </div>
          </section>
        </div>
        
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
