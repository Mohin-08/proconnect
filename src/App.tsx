import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import AuthPage from './AuthPage'
import AdminDashboard from './admin/AdminDashboard'
import AdminUserManagement from './admin/AdminUserManagement'
import AdminServiceListings from './admin/AdminServiceListings'
import AdminPlatformSettings from './admin/AdminPlatformSettings'
import ProfessionalDashboard from './professional/ProfessionalDashboard'
import ProfessionalJobs from './professional/ProfessionalJobs'
import ProfessionalProfile from './professional/ProfessionalProfile'
import ProfessionalServices from './professional/ProfessionalServices'
import UserDashboard from './user/UserDashboard'
import UserProfile from './user/UserProfile'
import UserMyHires from './user/UserMyHires'
import UserBookingDetails from './user/UserBookingDetails'
import UserFavorites from './user/UserFavorites'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/services" element={<AdminServiceListings />} />
        <Route path="/admin/settings" element={<AdminPlatformSettings />} />
        <Route path="/professional" element={<ProfessionalDashboard />} />
        <Route path="/professional/jobs" element={<ProfessionalJobs />} />
        <Route path="/professional/services" element={<ProfessionalServices />} />
        <Route path="/professional/profile" element={<ProfessionalProfile />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/my-hires" element={<UserMyHires />} />
        <Route path="/user/booking/:id" element={<UserBookingDetails />} />
        <Route path="/user/favorites" element={<UserFavorites />} />
        {/* Add more professional routes as needed */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
