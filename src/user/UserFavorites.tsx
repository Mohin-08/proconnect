import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type FavoriteService = {
  id: number
  professional_service_id: number
  professional_id: string
  service_id: number
  professional_name: string
  professional_title: string
  professional_location: string | null
  service_name: string
  service_category: string
  hourly_rate: number | null
  rating: number
  jobs_completed: number
}

export default function UserFavorites() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<FavoriteService[]>([])
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

      // Get user's favorites
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select('professional_service_id')
        .eq('user_id', session.user.id)

      if (error) {
        console.error('Error loading favorites:', error)
        setLoading(false)
        return
      }

      if (!favoritesData || favoritesData.length === 0) {
        setLoading(false)
        return
      }

      const serviceIds = favoritesData.map(f => f.professional_service_id)

      // Get professional services
      const { data: professionalServicesData } = await supabase
        .from('professional_services')
        .select('*')
        .in('id', serviceIds)

      // Get professionals
      const { data: professionalsData } = await supabase
        .from('professionals')
        .select('*')

      // Get services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')

      // Combine data
      const combinedFavorites = professionalServicesData
        ?.map((ps: any) => {
          const professional = professionalsData?.find((p: any) => p.id === ps.professional_id)
          const service = servicesData?.find((s: any) => s.id === ps.service_id)

          if (!professional || !service) return null

          return {
            id: (favoritesData.find((f: any) => f.professional_service_id === ps.id) as any)?.id || 0,
            professional_service_id: ps.id,
            professional_id: ps.professional_id,
            service_id: ps.service_id,
            professional_name: professional.full_name,
            professional_title: professional.title,
            professional_location: professional.location,
            service_name: service.name,
            service_category: service.category,
            hourly_rate: ps.rate || professional.hourly_rate,
            rating: 5,
            jobs_completed: 54
          }
        })
        .filter((item: any) => item !== null) || []

      setFavorites(combinedFavorites.filter(Boolean) as FavoriteService[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const removeFavorite = async (professionalServiceId: number) => {
    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('professional_service_id', professionalServiceId)

    if (!error) {
      setFavorites(favorites.filter(f => f.professional_service_id !== professionalServiceId))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2>Loading favorites...</h2>
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
          <button className="nav-item active" onClick={() => navigate('/user/favorites')}>
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
            <h1>My Favorites</h1>
            <p>Services and professionals you've saved</p>
          </div>
        </header>

        <section className="table-section">
          {favorites.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⭐</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No favorites yet</h3>
              <p>Start by adding services to your favorites from the Find Professionals page</p>
              <button
                className="add-btn"
                onClick={() => navigate('/user')}
                style={{ marginTop: '24px', padding: '12px 32px' }}
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
              gap: '24px'
            }}>
              {favorites.map((favorite) => (
                <div
                  key={favorite.professional_service_id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '2px solid #fbbf24',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {/* Favorite Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    fontSize: '24px',
                    color: '#fbbf24'
                  }}>
                    ★
                  </div>

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
                      {favorite.service_category}
                    </span>
                  </div>

                  {/* Service Name */}
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    marginBottom: '12px',
                    color: '#1f2937'
                  }}>
                    {favorite.service_name}
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
                      fontWeight: '600'
                    }}>
                      {favorite.professional_name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>
                        {favorite.professional_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {favorite.professional_title}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px'
                  }}>
                    <span>⭐ {favorite.rating} ({favorite.jobs_completed} jobs)</span>
                    {favorite.professional_location && <span>📍 {favorite.professional_location}</span>}
                  </div>

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
                        ${favorite.hourly_rate}
                      </span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>/hour</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => removeFavorite(favorite.professional_service_id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '2px solid #fef3c7',
                          background: '#fef3c7',
                          color: '#f59e0b',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.3s'
                        }}
                      >
                        Remove
                      </button>
                      <button
                        className="add-btn"
                        style={{ padding: '8px 24px', fontSize: '14px' }}
                        onClick={() => navigate('/user')}
                      >
                        Hire Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
