import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import BookingModal from './BookingModal'

type Service = {
  id: number
  professional_id: string
  service_id: number
  professional_name: string
  professional_title: string
  professional_location: string | null
  professional_bio: string | null
  service_name: string
  service_category: string
  hourly_rate: number | null
  rating: number
  jobs_completed: number
}

export default function UserDashboard() {
  const navigate = useNavigate()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [userName, setUserName] = useState('User')
  const [favorites, setFavorites] = useState<number[]>([])
  const [bookingModal, setBookingModal] = useState<{
    serviceId: number
    serviceName: string
    professionalId: string
    professionalName: string
    hourlyRate: number
  } | null>(null)

  const categories = [
    'All Categories',
    'Technology & Development',
    'Design & Creative',
    'Marketing & Business',
    'Data & Analytics',
    'Writing & Translation',
    'Audio & Music'
  ]

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

      // Load user's favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('professional_service_id')
        .eq('user_id', session.user.id)

      if (favoritesData) {
        setFavorites(favoritesData.map(f => f.professional_service_id))
      }

      // Get all active professional services
      const { data: professionalServicesData, error: psError } = await supabase
        .from('professional_services')
        .select('*')
        .eq('is_active', true)

      if (psError) {
        console.error('Error loading professional_services:', psError)
        setLoading(false)
        return
      }

      // Get all professionals from profiles table
      const { data: professionalsData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'professional')
        .eq('status', 'active')

      if (profError) {
        console.error('Error loading professionals:', profError)
        setLoading(false)
        return
      }

      // Get all services
      const { data: servicesData, error: servError } = await supabase
        .from('services')
        .select('*')

      if (servError) {
        console.error('Error loading services:', servError)
        setLoading(false)
        return
      }

      console.log('Professional Services:', professionalServicesData)
      console.log('Professionals:', professionalsData)
      console.log('Services:', servicesData)

      // Manually join the data
      const transformed = professionalServicesData
        ?.map((ps: any) => {
          const professional = professionalsData?.find((p: any) => p.id === ps.professional_id)
          const service = servicesData?.find((s: any) => s.id === ps.service_id)

          if (!professional || !service) return null

          return {
            id: ps.id,
            professional_id: ps.professional_id,
            service_id: ps.service_id,
            professional_name: professional.full_name || 'Professional',
            professional_title: ps.custom_title || service.name || 'Service Provider',
            professional_location: professional.location,
            professional_bio: professional.bio,
            service_name: service.name || 'Service',
            service_category: service.category || 'Other',
            hourly_rate: ps.rate || 50,
            rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
            jobs_completed: Math.floor(Math.random() * 200) + 50
          }
        })
        .filter((item: any) => item !== null) || []

      console.log('Transformed services:', transformed)

      setServices(transformed.filter(Boolean) as Service[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const filteredServices = useMemo(() => {
    let filtered = services

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.professional_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.professional_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.service_category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((service) =>
        service.service_category === selectedCategory
      )
    }

    return filtered
  }, [searchQuery, selectedCategory, services])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleHireNow = (service: Service) => {
    setBookingModal({
      serviceId: service.service_id,
      serviceName: service.service_name,
      professionalId: service.professional_id,
      professionalName: service.professional_name,
      hourlyRate: service.hourly_rate || 50
    })
  }

  const handleBookingSuccess = () => {
    // Navigate to My Hires page
    navigate('/user/my-hires')
  }

  const toggleFavorite = async (serviceId: number) => {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session) return

    const isFavorited = favorites.includes(serviceId)

    if (isFavorited) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('professional_service_id', serviceId)

      if (!error) {
        setFavorites(favorites.filter(id => id !== serviceId))
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: session.user.id,
          professional_service_id: serviceId
        })

      if (!error) {
        setFavorites([...favorites, serviceId])
      }
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2>Loading services...</h2>
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
          <button className="nav-item active" onClick={() => navigate('/user')}>
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
            <span className="avatar" style={{ background: '#3498db' }}>U</span>
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

        {/* Search and Filter Section */}
        <section className="table-section">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name, skill, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '15px'
              }}
            />
            <button
              className="add-btn"
              style={{ padding: '12px 32px' }}
            >
              🔍 Search
            </button>
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '24px',
                  border: selectedCategory === cat ? '2px solid #1abc9c' : '2px solid #e5e7eb',
                  background: selectedCategory === cat ? '#1abc9c' : 'white',
                  color: selectedCategory === cat ? 'white' : '#6b7280',
                  fontWeight: selectedCategory === cat ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '24px'
          }}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1abc9c'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,188,156,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Service Category Badge */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {service.service_category}
                  </span>
                </div>

                {/* Service Name */}
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#1f2937'
                }}>
                  {service.service_name}
                </h3>

                {/* Professional Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {service.professional_name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                      {service.professional_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {service.professional_title}
                    </div>
                  </div>
                  <span style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    Available
                  </span>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '12px'
                }}>
                  <span>⭐ {service.rating} ({service.jobs_completed} jobs)</span>
                  {service.professional_location && <span>📍 {service.professional_location}</span>}
                </div>

                {/* Bio */}
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {service.professional_bio || 'Experienced professional ready to help with your project.'}
                </p>

                {/* Price and Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <div>
                    <span style={{ fontSize: '24px', fontWeight: '700', color: '#1abc9c' }}>
                      ${service.hourly_rate}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>/hour</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleFavorite(service.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '2px solid #e5e7eb',
                        background: favorites.includes(service.id) ? '#fef3c7' : 'white',
                        color: favorites.includes(service.id) ? '#f59e0b' : '#6b7280',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: '500',
                        transition: 'all 0.3s'
                      }}
                      title={favorites.includes(service.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.includes(service.id) ? '★' : '☆'}
                    </button>
                    <button
                      className="add-btn"
                      style={{ padding: '8px 24px', fontSize: '14px' }}
                      onClick={() => handleHireNow(service)}
                    >
                      Hire Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No services found</h3>
              <p>Try adjusting your search or filters</p>
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

      {bookingModal && (
        <BookingModal
          serviceId={bookingModal.serviceId}
          serviceName={bookingModal.serviceName}
          professionalId={bookingModal.professionalId}
          professionalName={bookingModal.professionalName}
          hourlyRate={bookingModal.hourlyRate}
          onClose={() => setBookingModal(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
