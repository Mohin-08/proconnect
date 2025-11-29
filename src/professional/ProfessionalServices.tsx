import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type ServiceOption = {
  id: number
  name: string
  category: string | null
}

type ProServiceRow = {
  id: number
  service_id: number
  custom_title: string | null
  notes: string | null
  is_active: boolean
  rate: number | null
  service: {
    name: string
    category: string | null
  } | null
}

export default function ProfessionalServices() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ProServiceRow[]>([])
  const [allServiceOptions, setAllServiceOptions] = useState<ServiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [professionalName, setProfessionalName] = useState('Professional')
  const [professionalTitle, setProfessionalTitle] = useState('Professional')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ProServiceRow | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  const [customTitle, setCustomTitle] = useState('')
  const [rate, setRate] = useState<number | ''>('')
  const [notes, setNotes] = useState('')

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

      // global services (for dropdown)
      const { data: globalServices, error: globalErr } = await supabase
        .from('services')
        .select('id, name, category')
        .order('category', { ascending: true })

      if (globalErr) {
        console.error('Error loading services:', globalErr)
        alert(`Error loading services: ${globalErr.message}`)
        return
      }
      
      console.log('Loaded services:', globalServices)
      setAllServiceOptions((globalServices || []) as ServiceOption[])

      // professional services with join to services
      const { data, error } = await supabase
        .from('professional_services')
        .select(
          'id, service_id, custom_title, notes, is_active, rate, service:services ( name, category )'
        )
        .eq('professional_id', proId)
        .order('id', { ascending: true })

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      setServices((data || []) as ProServiceRow[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const openAdd = () => {
    setEditing(null)
    setSelectedServiceId(null)
    setCustomTitle('')
    setRate('')
    setNotes('')
    setShowModal(true)
  }

  const openEdit = (row: ProServiceRow) => {
    setEditing(row)
    setSelectedServiceId(row.service_id)
    setCustomTitle(row.custom_title || '')
    setRate(row.rate ?? '')
    setNotes(row.notes || '')
    setShowModal(true)
  }

  const save = async () => {
    if (!selectedServiceId) {
      alert('Please select a service.')
      return
    }

    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (!session) {
      navigate('/')
      return
    }
    const proId = session.user.id

    if (editing) {
      const { error } = await supabase
        .from('professional_services')
        .update({
          service_id: selectedServiceId,
          custom_title: customTitle || null,
          rate: rate === '' ? null : rate,
          notes: notes || null
        })
        .eq('id', editing.id)

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      const serviceMeta = allServiceOptions.find(
        (s) => s.id === selectedServiceId
      )

      setServices((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                service_id: selectedServiceId,
                custom_title: customTitle || null,
                rate: rate === '' ? null : (rate as number),
                notes: notes || null,
                service: serviceMeta
                  ? { name: serviceMeta.name, category: serviceMeta.category }
                  : p.service
              }
            : p
        )
      )
    } else {
      const { data, error } = await supabase
        .from('professional_services')
        .insert({
          professional_id: proId,
          service_id: selectedServiceId,
          custom_title: customTitle || null,
          rate: rate === '' ? null : rate,
          notes: notes || null,
          is_active: false
        })
        .select(
          'id, service_id, custom_title, notes, is_active, rate, service:services ( name, category )'
        )
        .single()

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      setServices((prev) => [...prev, data as ProServiceRow])
    }

    setShowModal(false)
  }

  const toggleActive = async (row: ProServiceRow, active: boolean) => {
    const { error } = await supabase
      .from('professional_services')
      .update({ is_active: active })
      .eq('id', row.id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setServices((prev) =>
      prev.map((p) =>
        p.id === row.id ? { ...p, is_active: active } : p
      )
    )
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return <div className="admin-page">Loading services…</div>
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
            className="nav-item active"
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

        <section className="table-section">
          <div className="table-header-row">
            <h2>My Services</h2>
            <button className="add-btn" onClick={openAdd}>
              + Add New Service
            </button>
          </div>

          <div className="services-grid">
            {services.map((s) => {
              const title = s.custom_title || s.service?.name || 'Service'
              const category = s.service?.category || 'Professional Service'
              return (
                <div
                  key={s.id}
                  className={`service-card ${
                    s.is_active ? 'service-active' : 'service-inactive'
                  }`}
                >
                  <div className="service-header">
                    <h3>{title}</h3>
                    <span
                      className={`badge ${
                        s.is_active ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="service-meta">
                    <div className="service-category">{category}</div>
                    <div className="service-pro-count">
                      {s.rate != null ? `$${s.rate}/hr` : 'Custom rate'}
                    </div>
                  </div>
                  <p className="service-description">
                    {s.notes || 'Click Edit to add a description.'}
                  </p>
                  <div className="service-actions">
                    <button
                      className="btn-small"
                      onClick={() => openEdit(s)}
                    >
                      Edit
                    </button>
                    {s.is_active ? (
                      <button
                        className="btn-small danger"
                        onClick={() => toggleActive(s, false)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn-small approve"
                        onClick={() => toggleActive(s, true)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {services.length === 0 && (
              <div>No services added yet. Click “Add New Service”.</div>
            )}
          </div>
        </section>

        {showModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>{editing ? 'Edit Service' : 'Add New Service'}</h3>

              <label>
                Base Service
                <select
                  value={selectedServiceId ?? ''}
                  onChange={(e) =>
                    setSelectedServiceId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">Select a service</option>
                  {allServiceOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.category ? `(${s.category})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Custom Title (optional)
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </label>

              <label>
                Rate (per hour)
                <input
                  type="number"
                  min={0}
                  value={rate}
                  onChange={(e) =>
                    setRate(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </label>

              <label>
                Notes / Description
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    padding: '6px 8px',
                    resize: 'vertical'
                  }}
                />
              </label>

              <div className="modal-actions">
                <button onClick={() => setShowModal(false)}>Cancel</button>
                <button onClick={save}>
                  {editing ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </div>
          </div>
        )}
        
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
