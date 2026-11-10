import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ChampionsPage from './pages/ChampionsPage'
import ChampionDetailPage from './pages/ChampionDetailPage'
import BuildsPage from './pages/BuildsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import PWABadge from './components/PWABadge'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#010a13', color: '#c89b3c', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: 2 }}>
      LOADING...
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#010a13', color: '#c89b3c', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: 2 }}>
      LOADING...
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="champions" element={<ChampionsPage />} />
        <Route path="champions/:id" element={<ChampionDetailPage />} />
        <Route path="builds" element={<BuildsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <PWABadge />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
