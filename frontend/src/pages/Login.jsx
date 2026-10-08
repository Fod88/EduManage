import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../services/api'
export default function Login() {
  const { user, login } = useAuth(), nav = useNavigate()
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [fe, setFe] = useState({})
  if (user) return <Navigate to="/" replace />
  const submit = async e => {
    e.preventDefault(); const x = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) x.email = 'Enter a valid email address'
    if (!pw) x.pw = 'Enter your password'
    setFe(x); setErr(''); if (Object.keys(x).length) return
    setBusy(true); try { await login(email, pw); nav('/') } catch (e) { setErr(errMsg(e)) } finally { setBusy(false) }
  }
  return <div className="login"><div className="art"><div className="brand" style={{ padding: 0 }}><i><GraduationCap size={18} /></i>EduManage</div>
    <h1>Attendance, classes and people in one calm place.</h1><p style={{ color: 'var(--mute)', maxWidth: 380 }}>Sign in with the account your school administrator created for you.</p></div>
    <div className="form"><form onSubmit={submit} noValidate style={{ width: '100%', maxWidth: 360 }}>
      <div className="brand mbrand"><i><GraduationCap size={18} /></i>EduManage</div><h1 style={{ marginBottom: 4 }}>Sign in</h1><p style={{ color: 'var(--mute)', marginTop: 0, marginBottom: 20 }}>Welcome back.</p>
      {err && <div className="note" style={{ background: 'var(--bad-s)', color: 'var(--bad)' }} role="alert">{err}</div>}
      <div className="fld"><label htmlFor="e">Email</label><input id="e" className="in" type="email" autoComplete="username" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} />{fe.email && <span className="err">{fe.email}</span>}</div>
      <div className="fld"><label htmlFor="p">Password</label><div style={{ position: 'relative' }}><input id="p" className="in" type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} />
        <button type="button" className="btn ghost" style={{ position: 'absolute', right: 4, top: 3 }} onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>{fe.pw && <span className="err">{fe.pw}</span>}</div>
      <button className="btn p" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div></div>
}
