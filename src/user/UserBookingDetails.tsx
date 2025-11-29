import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type BookingDetails = {
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
  professional?: {
    full_name: string | null
    email: string | null
    phone: string | null
  }
  service?: {
    name: string | null
    description: string | null
  }
}

export default function UserBookingDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<BookingDetails | null>(null)
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

      // Get booking details
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('client_id', session.user.id)
        .single()

      if (error || !bookingData) {
        alert('Booking not found')
        navigate('/user/my-hires')
        return
      }

      // Get professional details
      const { data: professionalData } = await supabase
        .from('professionals')
        .select('full_name, email, phone')
        .eq('id', bookingData.professional_id)
        .single()

      // Get service details if service_id exists
      let serviceData = null
      if (bookingData.service_id) {
        const { data } = await supabase
          .from('services')
          .select('name, description')
          .eq('id', bookingData.service_id)
          .single()
        serviceData = data
      }

      setBooking({
        ...bookingData,
        professional: professionalData || undefined,
        service: serviceData || undefined
      })
      setLoading(false)
    }

    load()
  }, [navigate, id])

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

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2>Loading booking details...</h2>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h2>Booking not found</h2>
          <button
            className="add-btn"
            onClick={() => navigate('/user/my-hires')}
            style={{ marginTop: '24px' }}
          >
            Back to My Hires
          </button>
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
          <button className="nav-item" onClick={() => navigate('/user/my-hires')}>
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
            <h1>Booking Details</h1>
            <p>View your booking information</p>
          </div>
          <button
            className="add-btn"
            onClick={() => navigate('/user/my-hires')}
            style={{ padding: '10px 24px', fontSize: '15px' }}
          >
            ← Back to My Hires
          </button>
        </header>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Booking Overview */}
          <section className="table-section">
            <h2>Booking Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</label>
                <p style={{ margin: '8px 0 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>#{booking.id}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</label>
                <p style={{ margin: '8px 0 0' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: `${getStatusColor(booking.status)}20`,
                      color: getStatusColor(booking.status)
                    }}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget</label>
                <p style={{ margin: '8px 0 0', fontSize: '24px', fontWeight: '700', color: '#1abc9c' }}>${booking.budget || 100}</p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Status</label>
                <p style={{ margin: '8px 0 0' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: booking.payment_status === 'paid' ? '#10b98120' : '#f59e0b20',
                      color: booking.payment_status === 'paid' ? '#10b981' : '#f59e0b'
                    }}
                  >
                    {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Service Information */}
          <section className="table-section">
            <h2>Service Information</h2>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Service Name</label>
                <p style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  {booking.service?.name || booking.title || 'Service'}
                </p>
              </div>
              {booking.description && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
                  <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>
                    {booking.description}
                  </p>
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scheduled Date</label>
                <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#1f2937' }}>
                  {booking.scheduled_at
                    ? new Date(booking.scheduled_at).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })
                    : 'Not scheduled'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booked On</label>
                <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#6b7280' }}>
                  {new Date(booking.created_at).toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section className="table-section">
            <h2>Professional Information</h2>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</label>
                <p style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  {booking.professional?.full_name || 'Professional'}
                </p>
              </div>
              {booking.professional?.email && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                  <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#1f2937' }}>
                    <a href={`mailto:${booking.professional.email}`} style={{ color: '#1abc9c', textDecoration: 'none' }}>
                      {booking.professional.email}
                    </a>
                  </p>
                </div>
              )}
              {booking.professional?.phone && (
                <div>
                  <label style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                  <p style={{ margin: '8px 0 0', fontSize: '15px', color: '#1f2937' }}>
                    <a href={`tel:${booking.professional.phone}`} style={{ color: '#1abc9c', textDecoration: 'none' }}>
                      {booking.professional.phone}
                    </a>
                  </p>
                </div>
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
