import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type JobRow = {
  id: number
  title: string
  description: string | null
  scheduled_at: string | null
  budget: number | null
  status: string
  client_id: string | null
  client_name?: string
  service_name?: string
}

export default function ProfessionalJobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobRow[]>([])
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

      const proId = session.user.id

      // Load professional profile
      const { data: profileData } = await supabase
        .from('professionals')
        .select('full_name, title')
        .eq('id', proId)
        .single()

      if (profileData) {
        const name = profileData.full_name || 'Professional'
        setProfessionalName(name.charAt(0).toUpperCase() + name.slice(1))
        const title = profileData.title || 'Professional'
        setProfessionalTitle(title.charAt(0).toUpperCase() + title.slice(1))
      }

      // Get bookings for this professional
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('professional_id', proId)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('scheduled_at', { ascending: true })

      if (bookingsError) {
        console.error(bookingsError)
        alert(bookingsError.message)
        setLoading(false)
        return
      }

      // Get client profiles
      const clientIds = bookingsData?.map((b: any) => b.client_id).filter(Boolean) || []
      const clientProfiles: Record<string, string> = {}
      
      if (clientIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', clientIds)
        
        profilesData?.forEach((p: any) => {
          if (p.full_name) {
            clientProfiles[p.id] = p.full_name.charAt(0).toUpperCase() + p.full_name.slice(1)
          }
        })

        // For clients without full_name, try to get from auth.users
        const missingIds = clientIds.filter(id => !clientProfiles[id])
        if (missingIds.length > 0) {
          for (const clientId of missingIds) {
            const { data: userData } = await supabase.auth.admin.getUserById(clientId)
            if (userData?.user?.email) {
              const emailName = userData.user.email.split('@')[0]
              clientProfiles[clientId] = emailName.charAt(0).toUpperCase() + emailName.slice(1)
            } else {
              clientProfiles[clientId] = 'Client'
            }
          }
        }
      }

      // Get service details
      const serviceIds = bookingsData?.map((b: any) => b.service_id).filter(Boolean) || []
      const serviceDetails: Record<number, string> = {}
      
      if (serviceIds.length > 0) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds)
        
        servicesData?.forEach((s: any) => {
          serviceDetails[s.id] = s.name
        })
      }

      // Transform data to include client name and service name
      const transformedJobs = bookingsData?.map((booking: any) => ({
        id: booking.id,
        title: booking.title,
        description: booking.description,
        scheduled_at: booking.scheduled_at,
        budget: booking.budget,
        status: booking.status,
        client_id: booking.client_id,
        client_name: clientProfiles[booking.client_id] || booking.client_id?.substring(0, 8) || 'Client',
        service_name: serviceDetails[booking.service_id] || booking.title || 'Service'
      })) || []

      setJobs(transformedJobs as JobRow[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const markCompleted = async (job: JobRow) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', job.id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setJobs((prev) => prev.filter((j) => j.id !== job.id))
  }

  const acceptJob = async (job: JobRow) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', job.id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: 'accepted' } : j))
    )
  }

  const viewDetails = (job: JobRow) => {
    alert(
      `Job: ${job.title}\n\n${job.description || 'No description'}\n\nBudget: $${job.budget ?? 0}\nScheduled: ${
        job.scheduled_at
          ? new Date(job.scheduled_at).toLocaleDateString()
          : 'Not set'
      }\nStatus: ${job.status}`
    )
  }

  if (loading) {
    return <div className="admin-page">Loading jobs…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="logo">ProConnect</div>
        <nav>
          <button className="nav-item" onClick={() => navigate('/professional')}>
            Dashboard
          </button>
          <button
            className="nav-item active"
            onClick={() => navigate('/professional/jobs')}
          >
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
          <div>
            <h1>Active Jobs</h1>
            <p>Track and manage your ongoing projects</p>
          </div>
        </header>

        <section className="table-section">
          <h2>Active Jobs</h2>

          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Client</th>
                <th>Description</th>
                <th>Scheduled Date</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.service_name || job.title || '-'}</td>
                  <td>{job.client_name || '-'}</td>
                  <td>{job.description ? job.description.substring(0, 50) + '...' : '-'}</td>
                  <td>
                    {job.scheduled_at
                      ? new Date(job.scheduled_at).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>{job.budget != null ? `$${job.budget}` : '-'}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background:
                          job.status === 'accepted'
                            ? '#dbeafe'
                            : job.status === 'pending'
                            ? '#fef3c7'
                            : '#dcfce7',
                        color:
                          job.status === 'accepted'
                            ? '#1e40af'
                            : job.status === 'pending'
                            ? '#92400e'
                            : '#166534'
                      }}
                    >
                      {job.status === 'in_progress' ? 'In Progress' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {job.status === 'pending' && (
                      <button
                        className="btn-small approve"
                        onClick={() => acceptJob(job)}
                        style={{ marginRight: '8px' }}
                      >
                        Accept
                      </button>
                    )}
                    <button
                      className="btn-small approve"
                      onClick={() => markCompleted(job)}
                    >
                      Complete
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => viewDetails(job)}
                      style={{ marginLeft: '8px' }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="empty-state">No active jobs at the moment.</div>
                  </td>
                </tr>
              )}
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
    </div>
  )
}
