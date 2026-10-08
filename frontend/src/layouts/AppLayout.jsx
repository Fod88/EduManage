import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, GraduationCap, School, BookOpen, Link2, CalendarCheck, ShieldCheck, UserCircle, LogOut, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/ui'
const A = ['admin'], T = ['admin', 'teacher'], ALL = ['admin', 'teacher', 'student']
const NAV = [['Overview', [['/', 'Dashboard', LayoutDashboard, ALL]]],
  ['People', [['/students', 'Students', Users, T], ['/teachers', 'Teachers', GraduationCap, A], ['/users', 'Users', ShieldCheck, A]]],
  ['Academics', [['/classes', 'Classes', School, A], ['/subjects', 'Subjects', BookOpen, A], ['/teaching-assignments', 'Teaching Assignments', Link2, T], ['/attendance', 'Attendance', CalendarCheck, T]]],
  ['Account', [['/profile', 'Profile', UserCircle, ALL]]]]
export default function AppLayout() {
  const { user, logout } = useAuth(), [open, setOpen] = useState(false), nav = useNavigate()
  return <div className="shell"><div className={`scrim ${open ? 'on' : ''}`} onClick={() => setOpen(false)} />
    <aside className={`side ${open ? 'open' : ''}`}><div className="brand"><i><GraduationCap size={18} /></i>EduManage</div>
      <nav aria-label="Main">{NAV.map(([g, items]) => { const v = items.filter(i => i[3].includes(user.role)); return v.length > 0 && <div key={g}><div className="grp">{g}</div>{v.map(([to, t, I]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}><I size={18} />{t}</NavLink>)}</div> })}</nav>
      <div className="ucard"><Avatar name={user.name} /><div><b>{user.name}</b><span>{user.role}</span></div><button className="btn ghost" aria-label="Log out" onClick={() => { logout(); nav('/login') }}><LogOut size={16} /></button></div></aside>
    <div className="col"><header className="top"><button className="btn ghost menu" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Menu size={20} /></button><span className="brandm">EduManage</span></header>
      <main className="main"><Outlet /></main></div></div>
}
