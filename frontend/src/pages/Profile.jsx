import { useState } from 'react'
import api, { errMsg, fmtDate, fmtDay, label } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PageHead, Avatar, Badge } from '../components/ui'

const Field = ({ id, label: l, err, ...p }) => <div className="fld"><label htmlFor={id}>{l}</label><input id={id} className="in" aria-invalid={!!err} {...p} />{err && <span className="err">{err}</span>}</div>

export default function Profile() {
  const { user, profile, setUser } = useAuth(), toast = useToast()
  const [a, setA] = useState({ name: user.name, email: user.email }), [ae, setAe] = useState({}), [ab, setAb] = useState(false)
  const [p, setP] = useState({ currentPassword: '', password: '', confirm: '' }), [pe, setPe] = useState({}), [pb, setPb] = useState(false)
  const dirty = a.name.trim() !== user.name || a.email.trim().toLowerCase() !== user.email
  const patch = async body => { const { data } = await api.patch('/users/me', body); setUser(data); setA({ name: data.name, email: data.email }) }
  const saveAccount = async e => {
    e.preventDefault(); const er = {}
    if (!a.name.trim()) er.name = 'Name is required'
    if (!/^\S+@\S+\.\S+$/.test(a.email.trim())) er.email = 'Enter a valid email address'
    setAe(er); if (Object.keys(er).length) return
    setAb(true); try { await patch({ name: a.name.trim(), email: a.email.trim() }); toast('Account updated') } catch (x) { toast(errMsg(x), 'error') } finally { setAb(false) }
  }
  const savePassword = async e => {
    e.preventDefault(); const er = {}
    if (!p.currentPassword) er.currentPassword = 'Enter your current password'
    if (p.password.length < 8) er.password = 'Use at least 8 characters'
    if (p.confirm !== p.password) er.confirm = 'Passwords do not match'
    setPe(er); if (Object.keys(er).length) return
    setPb(true); setPe({}); try { await patch({ currentPassword: p.currentPassword, password: p.password }); setP({ currentPassword: '', password: '', confirm: '' }); toast('Password changed') } catch (x) { setPe({ currentPassword: x.response?.status === 401 ? errMsg(x) : '' }); toast(errMsg(x), 'error') } finally { setPb(false) }
  }
  const extra = user.role === 'student' ? [['Student ID', profile?.studentId], ['Class', label(profile?.classId)], ['Phone', profile?.phone], ['Parent phone', profile?.parentPhone], ['Birth date', fmtDay(profile?.birthDate)], ['Address', profile?.address]] : user.role === 'teacher' ? [['Phone', profile?.phone]] : []
  return <><PageHead title="Profile" sub="Your account and security settings." />
    <div className="split even">
      <div className="card pad"><div className="who" style={{ marginBottom: 16, gap: 14 }}><span className="av lg">{String(user.name).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span><div><h2>{user.name}</h2><div style={{ color: 'var(--mute)' }}>{user.email}</div></div></div>
        <div className="kv"><span>Role</span><Badge v={user.role} /></div><div className="kv"><span>Status</span><Badge v={user.status} /></div><div className="kv"><span>Member since</span><b>{fmtDate(user.createdAt)}</b></div>
        {extra.map(([k, v]) => <div key={k} className="kv"><span>{k}</span><b>{v || '—'}</b></div>)}
        {extra.length > 0 && <p className="hint">School details are managed by an administrator.</p>}</div>
      <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <form className="card pad" onSubmit={saveAccount} noValidate><h2 style={{ marginBottom: 14 }}>Account details</h2>
          <Field id="n" label="Full name" value={a.name} err={ae.name} onChange={e => setA({ ...a, name: e.target.value })} /><Field id="m" label="Email" type="email" value={a.email} err={ae.email} onChange={e => setA({ ...a, email: e.target.value })} />
          <div className="actions"><button className="btn p" disabled={ab || !dirty}>{ab ? 'Saving…' : 'Save changes'}</button></div></form>
        <form className="card pad" onSubmit={savePassword} noValidate><h2 style={{ marginBottom: 14 }}>Change password</h2>
          <Field id="cp" label="Current password" type="password" autoComplete="current-password" value={p.currentPassword} err={pe.currentPassword} onChange={e => setP({ ...p, currentPassword: e.target.value })} />
          <Field id="np" label="New password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={p.password} err={pe.password} onChange={e => setP({ ...p, password: e.target.value })} />
          <Field id="cf" label="Confirm new password" type="password" autoComplete="new-password" value={p.confirm} err={pe.confirm} onChange={e => setP({ ...p, confirm: e.target.value })} />
          <div className="actions"><button className="btn p" disabled={pb}>{pb ? 'Updating…' : 'Update password'}</button></div></form></div></div></>
}
