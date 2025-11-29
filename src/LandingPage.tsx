import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-container">
          <div className="landing-logo">ProConnect</div>
          <button className="landing-btn-login" onClick={() => navigate('/auth')}>
            Sign In
          </button>
        </div>
      </nav>

      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Connect with Professional <span className="gradient-text">Service Providers</span>
            </h1>
            <p className="hero-subtitle">
              Find trusted professionals for all your service needs. From home repairs to specialized skills,
              we connect you with verified experts.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/auth')}>
                Get Started
              </button>
              <button className="btn-secondary" onClick={() => navigate('/auth')}>
                Join as Professional
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="landing-container">
          <h2 className="section-title">Why Choose ProConnect?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Find Experts</h3>
              <p>Browse through verified professionals across multiple service categories</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Trusted Reviews</h3>
              <p>Read reviews and ratings from real customers to make informed decisions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Easy Booking</h3>
              <p>Book services instantly with transparent pricing and scheduling</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure Platform</h3>
              <p>Your data and payments are protected with enterprise-level security</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="landing-container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers and professionals</p>
          <button className="btn-cta" onClick={() => navigate('/auth')}>
            Sign Up Now
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-support">
              <strong>Support:</strong>
              <a href="mailto:2400030974@kluniversity.in" className="footer-email">
                2400030974@kluniversity.in
              </a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} ProConnect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
