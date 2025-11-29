import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type ServiceRow = {
  id: number
  name: string
  category: string | null
  description: string | null
  is_active: boolean
  professionals_count: number | null
}

export default function AdminServiceListings() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [editing, setEditing] = useState<ServiceRow | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        navigate('/')
        return
      }

      const { data, error } = await supabase
        .from('services')
        .select('id, name, category, description, is_active, professionals_count')
        .order('created_at', { ascending: true })

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      setServices((data || []) as ServiceRow[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const openAdd = () => {
    setEditing(null)
    setName('')
    setCategory('')
    setDescription('')
    setIsActive(true)
    setShowAddModal(true)
  }

  const openEdit = (service: ServiceRow) => {
    setEditing(service)
    setName(service.name)
    setCategory(service.category || '')
    setDescription(service.description || '')
    setIsActive(service.is_active)
    setShowAddModal(true)
  }

  const saveService = async () => {
    if (!name.trim()) {
      alert('Service name is required')
      return
    }

    if (editing) {
      const { error } = await supabase
        .from('services')
        .update({
          name,
          category,
          description,
          is_active: isActive
        })
        .eq('id', editing.id)

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      setServices((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? { ...s, name, category, description, is_active: isActive }
            : s
        )
      )
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name,
          category,
          description,
          is_active: isActive,
          professionals_count: 0
        })
        .select('id, name, category, description, is_active, professionals_count')
        .single()

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      setServices((prev) => [...prev, data as ServiceRow])
    }

    setShowAddModal(false)
  }

  const toggleActive = async (service: ServiceRow, active: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: active })
      .eq('id', service.id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, is_active: active } : s
      )
    )
  }

  const viewService = (service: ServiceRow) => {
    alert(
      `${service.name} (${service.category || 'Uncategorized'})\n\n${
        service.description || 'No description'
      }`
    )
  }

  const filtered = services.filter((s) => {
    if (!search) return true
    const term = search.toLowerCase()
    return (
      s.name.toLowerCase().includes(term) ||
      (s.category || '').toLowerCase().includes(term)
    )
  })

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
          <button className="nav-item" onClick={() => navigate('/admin')}>
            Overview
          </button>
          <button className="nav-item" onClick={() => navigate('/admin/users')}>
            User Management
          </button>
          <button
            className="nav-item active"
            onClick={() => navigate('/admin/services')}
          >
            Service Listings
          </button>
          <button className="nav-item" onClick={() => navigate('/admin/settings')}>Platform Settings</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-info">
            <span className="avatar">A</span>
            <div>
              <div className="admin-name">Admin User</div>
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
          <p>Welcome back, Admin User!</p>
        </header>

        <section className="table-section">
          <div className="table-header-row">
            <h2>Service Listings</h2>
            <button className="add-btn" onClick={openAdd}>
              + Add New Service
            </button>
          </div>

          <div className="filters-row">
            <input
              className="search-input"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="services-grid">
            {filtered.map((s) => (
              <div
                key={s.id}
                className={`service-card ${
                  s.is_active ? 'service-active' : 'service-inactive'
                }`}
              >
                <div className="service-header">
                  <h3>{s.name}</h3>
                  <span
                    className={`badge ${
                      s.is_active ? 'status-active' : 'status-inactive'
                    }`}
                  >
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="service-meta">
                  <div className="service-category">
                    {s.category || 'Uncategorized'}
                  </div>
                  <div className="service-pro-count">
                    {s.professionals_count || 0} Professionals
                  </div>
                </div>
                <p className="service-description">
                  {s.description || 'No description.'}
                </p>
                <div className="service-actions">
                  <button className="btn-small" onClick={() => viewService(s)}>
                    View
                  </button>
                  <button className="btn-small" onClick={() => openEdit(s)}>
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
            ))}
          </div>
        </section>

        {showAddModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>{editing ? 'Edit Service' : 'Add New Service'}</h3>
              <label>
                Name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Category
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </label>
              <label>
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    padding: '6px 8px',
                    resize: 'vertical'
                  }}
                />
              </label>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="modal-actions">
                <button onClick={() => setShowAddModal(false)}>Cancel</button>
                <button onClick={saveService}>
                  {editing ? 'Save' : 'Create'}
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
