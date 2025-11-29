import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type Booking = {
  id: number
  professional_id: string
  service_id: number | null
  title: string
  description: string | null
  scheduled_at: string | null
  budget: number | null
  status: string
  payment_status: string
  created_at: string
  professional: {
    full_name: string | null
  } | null
  service: {
    name: string | null
  } | null
}

export default function UserMyHires() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        const name = profile.full_name || session.user.email || 'User'
        setUserName(name.charAt(0).toUpperCase() + name.slice(1))
      }

      // Get user's bookings with professional and service details
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          professional_id,
          service_id,
          title,
          description,
          scheduled_at,
          budget,
          status,
          payment_status,
          created_at,
          professional:professionals!professional_id (
            full_name
          ),
          service:services (
            name
          )
        `)
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading bookings:', error)
        alert(error.message)
        setLoading(false)
        return
      }

      setBookings((bookingsData || []) as unknown as Booking[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'
      case 'in_progress':
      case 'accepted':
        return '#3b82f6'
      case 'cancelled':
        return '#ef4444'
      default:
        return '#f59e0b'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'accepted':
        return 'Accepted'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Pending'
    }
  }

  const handleEndContract = async (bookingId: number) => {
    if (!confirm('Are you sure you want to end this contract?')) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'completed' } : b
      )
    )
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2>Loading your hires...</h2>
        </div>
      </div>
    )
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
          <button className="nav-item active" onClick={() => navigate('/user/my-hires')}>
            <span className="icon">💼</span> My Hires
          </button>
          <button className="nav-item" onClick={() => navigate('/user/favorites')}>
            <span className="icon">⭐</span> Favorites
          </button>
          <button className="nav-item" onClick={() => navigate('/user/profile')}>
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
            <h1>Welcome, {userName}!</h1>
            <p>Find and hire the perfect professional for your needs</p>
          </div>
        </header>

        <section className="table-section">
          <h2>My Hires</h2>

          {bookings.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💼</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No hires yet</h3>
              <p>Start by finding and hiring professionals for your projects</p>
              <button
                className="add-btn"
                onClick={() => navigate('/user')}
                style={{ marginTop: '24px', padding: '12px 32px' }}
              >
                Find Professionals
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>Professional</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>
                          {booking.professional?.full_name || 'Professional'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#6b7280' }}>
                          {booking.service?.name || booking.title || 'Service'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                          {booking.scheduled_at
                            ? new Date(booking.scheduled_at).toLocaleDateString()
                            : new Date(booking.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#1abc9c' }}>
                          ${booking.budget || 100}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: '500',
                            background: `${getStatusColor(booking.status)}20`,
                            color: getStatusColor(booking.status)
                          }}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleEndContract(booking.id)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              End Contract
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/user/booking/${booking.id}`)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb',
                              background: 'white',
                              color: '#6b7280',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
