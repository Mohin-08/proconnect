import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

type Role = 'admin' | 'professional' | 'user' | 'support'
type Status = 'active' | 'pending' | 'inactive' | 'blocked'

type ProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  role: Role
  status: Status
}

export default function AdminUserManagement() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')

  const [editingUser, setEditingUser] = useState<ProfileRow | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<Role>('user')
  const [newUserStatus, setNewUserStatus] = useState<Status>('active')

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
        .from('profiles')
        .select('id, full_name, email, role, status')
        .order('created_at', { ascending: true })

      if (error) {
        console.error(error)
        alert(error.message)
        return
      }

      setProfiles((data || []) as ProfileRow[])
      setLoading(false)
    }

    load()
  }, [navigate])

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (search) {
        const term = search.toLowerCase()
        const matchText =
          (p.full_name || '').toLowerCase() + ' ' + (p.email || '').toLowerCase()
        if (!matchText.includes(term)) return false
      }
      if (roleFilter !== 'all' && p.role !== roleFilter) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      return true
    })
  }, [profiles, search, roleFilter, statusFilter])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const openEdit = (user: ProfileRow) => {
    setEditingUser(user)
  }

  const saveEdit = async () => {
    if (!editingUser) return
    const { id, full_name, role, status } = editingUser

    const { error } = await supabase
      .from('profiles')
      .update({ full_name, role, status })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, full_name, role, status } : p))
    )
    setEditingUser(null)
  }

  const approveUser = async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'active' } : p))
    )
  }

  const deleteUser = async (id: string, email: string | null) => {
    if (!window.confirm(`Delete user ${email || id}?`)) return

    // delete profile row
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setProfiles((prev) => prev.filter((p) => p.id !== id))

    // optional: delete auth user using service role key (skip for now in browser)
  }

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      alert('Email and password required')
      return
    }

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: newUserEmail,
      password: newUserPassword
    })
    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    const user = data.user
    if (!user) {
      alert('No user returned from signup')
      return
    }

    // Insert profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      email: newUserEmail,
      full_name: newUserEmail.split('@')[0],
      role: newUserRole,
      status: newUserStatus
    })

    if (profileError) {
      console.error(profileError)
      alert(profileError.message)
      return
    }

    setProfiles((prev) => [
      ...prev,
      {
        id: user.id,
        email: newUserEmail,
        full_name: newUserEmail.split('@')[0],
        role: newUserRole,
        status: newUserStatus
      }
    ])

    setShowAddModal(false)
    setNewUserEmail('')
    setNewUserPassword('')
    setNewUserRole('user')
    setNewUserStatus('active')
  }

  if (loading) {
    return <div className="admin-page">Loading users…</div>
  }

  return (
    <div className="admin-page">
      <aside className="sidebar">
        <div className="logo">ProConnect</div>
        <nav>
          <button className="nav-item" onClick={() => navigate('/admin')}>
            Overview
          </button>
          <button
            className="nav-item active"
            onClick={() => navigate('/admin/users')}
          >
            User Management
          </button>
          <button className="nav-item" onClick={() => navigate('/admin/services')}>Service Listings</button>
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
            <h2>User Management</h2>
            <button
              className="add-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Add New User
            </button>
          </div>

          <div className="filters-row">
            <input
              className="search-input"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="professional">Professional</option>
              <option value="user">User</option>
              <option value="support">Support</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((p, index) => (
                <tr key={p.id}>
                  <td>#{index + 1}</td>
                  <td>{p.full_name || '-'}</td>
                  <td>{p.email}</td>
                  <td>
                    <span className={`badge role-${p.role}`}>{p.role}</span>
                  </td>
                  <td>
                    <span className={`badge status-${p.status}`}>{p.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => openEdit(p)}
                    >
                      Edit
                    </button>
                    {p.status === 'pending' && (
                      <button
                        className="btn-small approve"
                        onClick={() => approveUser(p.id)}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      className="btn-small danger"
                      onClick={() => deleteUser(p.id, p.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {editingUser && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Edit User</h3>
              <label>
                Name
                <input
                  value={editingUser.full_name || ''}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      full_name: e.target.value
                    })
                  }
                />
              </label>
              <label>
                Role
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as Role
                    })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="professional">Professional</option>
                  <option value="user">User</option>
                  <option value="support">Support</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      status: e.target.value as Status
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
              <div className="modal-actions">
                <button onClick={() => setEditingUser(null)}>Cancel</button>
                <button onClick={saveEdit}>Save</button>
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Add New User</h3>
              <label>
                Email
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </label>
              <label>
                Role
                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(e.target.value as Role)
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="professional">Professional</option>
                  <option value="user">User</option>
                  <option value="support">Support</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={newUserStatus}
                  onChange={(e) =>
                    setNewUserStatus(e.target.value as Status)
                  }
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
              <div className="modal-actions">
                <button onClick={() => setShowAddModal(false)}>Cancel</button>
                <button onClick={createUser}>Create</button>
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
