import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Attendance from './pages/Attendance'
import { Page } from './pages/resources'
import { Skeleton, Empty } from './components/ui'

// Route access mirrors what the backend actually permits (see README).
const A = ['admin'], T = ['admin', 'teacher']
const PAGES = [['students', 'students', T], ['teachers', 'teachers', A], ['classes', 'classes', A], ['subjects', 'subjects', A], ['teaching-assignments', 'assignments', T], ['users', 'users', A]]
const Guard = ({ roles, children }) => { const { user, loading, authError, restore, logout } = useAuth()
  if (loading) return <div className="card" style={{ margin: 40 }}><Skeleton /></div>
  if (!user && authError) return <div className="card" style={{ maxWidth: 520, margin: '12vh auto' }}><Empty title="We couldn’t restore your session" text={authError} onRetry={() => restore()} /><div style={{ textAlign: 'center', paddingBottom: 24 }}><Link to="/login" onClick={logout}>Go to sign in</Link></div></div>
  if (!user) return <Navigate to="/login" replace />
  return roles && !roles.includes(user.role) ? <div className="card"><Empty title="You don’t have access to this page" text={<Link to="/">Back to dashboard</Link>} /></div> : children }
const Mine = ({ k }) => { const { user, profile } = useAuth()
  return <Page k={k} rowFilter={user.role === 'teacher' && k === 'assignments' ? rows => rows.filter(a => a.teacherId?._id === profile?._id) : undefined} /> }
export default function App() {
  return <Routes><Route path="/login" element={<Login />} />
    <Route element={<Guard><AppLayout /></Guard>}>
      <Route index element={<Dashboard />} /><Route path="profile" element={<Profile />} />
      {PAGES.map(([p, k, roles]) => <Route key={p} path={p} element={<Guard roles={roles}><Mine k={k} /></Guard>} />)}
      <Route path="attendance" element={<Guard roles={T}><Attendance /></Guard>} />
    </Route><Route path="*" element={<Navigate to="/" />} /></Routes>
}
