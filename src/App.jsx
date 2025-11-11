import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Subscription from './pages/Subscription.jsx'
import Payment from './pages/Payment.jsx'
import Contact from './pages/Contact.jsx'
import Profile from './pages/Profile.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import AdminHome from './pages/Admin/AdminHome.jsx'
import AdminMatches from './pages/Admin/AdminMatches.jsx'
import AdminPredictions from './pages/Admin/AdminPredictions.jsx'
import AdminUsers from './pages/Admin/AdminUsers.jsx'
import AdminPayments from './pages/Admin/AdminPayments.jsx'
import Navbar from './components/common/Navbar.jsx'
import Footer from './components/common/Footer.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import AdminRoute from './components/auth/AdminRoute.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/subscription" element={<Subscription />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/payment" element={<Payment />} />
          </Route>
          <Route path="/contact" element={<Contact />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/predictions" element={<AdminPredictions />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

