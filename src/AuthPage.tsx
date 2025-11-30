import { useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './supabaseClient'
import { useNavigate } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'

type Mode = 'login' | 'signup'
type Role = 'admin' | 'professional' | 'user' | 'support'

function AuthPage() {
  const navigate = useNavigate()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('user')
  const [loading, setLoading] = useState(false)
  const [captchaValue, setCaptchaValue] = useState<string | null>(null)

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setCaptchaValue(null)
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const onCaptchaChange = (value: string | null) => {
    setCaptchaValue(value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!captchaValue) {
      alert('Please complete the CAPTCHA verification')
      return
    }
    
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        const user = data.user
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email,
              full_name: email.split('@')[0],
              role,
              status: 'active'
            })
          if (profileError) throw profileError
        }
        alert('Signup successful, now login.')
        setMode('login')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        const user = data.user
        if (!user) {
          throw new Error('Login failed - no user data returned')
        }

        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
        
        if (profileError) {
          console.error('Profile error:', profileError)
          throw new Error(`Failed to fetch user profile: ${profileError.message}`)
        }

        if (!profiles || profiles.length === 0) {
          throw new Error('No profile found for this user. Please sign up again.')
        }

        if (profiles.length > 1) {
          throw new Error('Multiple profiles found. Please contact support.')
        }

        const userRole = profiles[0].role as Role

        // Navigate based on role
        if (userRole === 'admin') {
          navigate('/admin')
        } else if (userRole === 'professional') {
          navigate('/professional')
        } else if (userRole === 'support') {
          navigate('/support')
        } else {
          navigate('/user')
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      alert(message)
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card">
        <h2>ProConnect</h2>
        <p>Connect with the Right Professional</p>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="field">
              <label>Select your role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="user">User</option>
                <option value="professional">Professional</option>
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="field" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              onChange={onCaptchaChange}
            />
          </div>

          <button type="submit" disabled={loading || !captchaValue}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <button className="link-btn" onClick={toggleMode}>
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}

export default AuthPage
