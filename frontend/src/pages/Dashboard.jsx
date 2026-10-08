import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, School, UserCheck, UserX, Clock, Percent, CalendarCheck, Link2, ArrowRight, Hash } from 'lucide-react'
import api, { errMsg, toObj, toList, label, fmtDate, fmtDay } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PageHead, Skeleton, Empty, Badge } from '../components/ui'

const Kpi = ({ icon: I, label: l, value, tone = 'pri' }) => <div className="card kpi"><div className={`ic ${tone}`}><I size={18} /></div><div><b>{value ?? '—'}</b><span>{l}</span></div></div>
const pct = (n, t) => t ? Math.round(n / t * 100) : 0

function Breakdown({ a = {}, title = 'Attendance today' }) {
  const p = a.present || 0, ab = a.absent || 0, l = a.late || 0, t = p + ab + l
  return <div className="card pad"><h2>{title}</h2>
    {!t ? <Empty title="No attendance recorded yet" text="Figures appear as teachers submit attendance." /> : <>
      <div className="rate"><b>{a.rate ?? pct(p, t)}%</b><span>attendance rate</span></div>
      <div className="stack"><i style={{ width: `${pct(p, t)}%`, background: 'var(--ok)' }} /><i style={{ width: `${pct(l, t)}%`, background: '#e0a53a' }} /><i style={{ width: `${pct(ab, t)}%`, background: 'var(--bad)' }} /></div>
      <div className="tiles">{[['Present', p, 'ok', UserCheck], ['Late', l, 'warn', Clock], ['Absent', ab, 'bad', UserX]].map(([n, v, tone, I]) => <div key={n} className="tile"><div className={`ic ${tone}`}><I size={16} /></div><div><b>{v}</b><span>{n} · {pct(v, t)}%</span></div></div>)}</div></>}</div>
}
const Actions = ({ items }) => <div className="card pad"><h2 style={{ marginBottom: 10 }}>Quick actions</h2>{items.map(([to, t, d, I]) => <Link key={to} to={to} className="qa"><div className="ic pri"><I size={16} /></div><div><b>{t}</b><span>{d}</span></div><ArrowRight size={16} /></Link>)}</div>

function Staff({ role }) {
  const [d, setD] = useState(null), [err, setErr] = useState(''), [n, setN] = useState(0)
  useEffect(() => { api.get(`/dashboard/${role}`).then(r => setD(toObj(r.data))).catch(e => setErr(errMsg(e))) }, [role, n])
  if (err) return <div className="card"><Empty title="Couldn’t load the dashboard" text={err} onRetry={() => { setErr(''); setN(n + 1) }} /></div>
  if (!d) return <div className="card"><Skeleton /></div>
  if (role === 'admin') return <><div className="grid">
      <Kpi icon={Users} label="Total students" value={d.students?.total} /><Kpi icon={UserCheck} label="Active students" value={d.students?.active} tone="ok" />
      <Kpi icon={GraduationCap} label="Total teachers" value={d.teachers?.total} tone="cy" /><Kpi icon={UserCheck} label="Active teachers" value={d.teachers?.active} tone="ok" />
      <Kpi icon={School} label="Total classes" value={d.classes?.total} tone="warn" /><Kpi icon={Percent} label="Today’s attendance rate" value={d.attendance?.total ? `${d.attendance.rate}%` : '—'} /></div>
    <div className="split"><Breakdown a={d.attendance} /><Actions items={[['/students', 'Manage students', 'Add, edit or deactivate students', Users], ['/teaching-assignments', 'Teaching assignments', 'Connect teachers, classes and subjects', Link2], ['/attendance', 'Review attendance', 'Filter and correct records', CalendarCheck], ['/users', 'Manage users', 'Roles and account status', UserCheck]]} /></div></>
  const as = d.classes?.assignments || []
  return <><div className="grid"><Kpi icon={School} label="Assigned classes" value={d.classes?.total} /><Kpi icon={Users} label="Students in my classes" value={d.students?.total} tone="cy" />
      <Kpi icon={Link2} label="Active assignments" value={as.length} tone="warn" /><Kpi icon={Percent} label="Today’s attendance rate" value={d.attendance?.total ? `${d.attendance.rate}%` : '—'} tone="ok" /></div>
    <div className="split"><Breakdown a={d.attendance} title="My attendance records today" /><Actions items={[['/attendance', 'Record attendance', 'Class → subject → students', CalendarCheck], ['/students', 'View students', 'Search and filter by class', Users], ['/teaching-assignments', 'My assignments', 'Classes and subjects you teach', Link2]]} /></div>
    <div className="card" style={{ marginTop: 14 }}><div className="pad" style={{ paddingBottom: 0 }}><h2>My teaching assignments</h2></div>
      {!as.length ? <Empty title="No active assignments" text="An administrator needs to assign you to a class and subject." /> :
        <div className="tw"><table className="rt"><thead><tr><th>Class</th><th>Subject</th><th>Status</th></tr></thead><tbody>{as.map(a => <tr key={a._id}><td data-l="Class"><b>{label(a.classId)}</b></td><td data-l="Subject">{label(a.subjectId)}</td><td data-l="Status"><Badge v={a.status} /></td></tr>)}</tbody></table></div>}</div></>
}

function Student() {
  const { profile: p } = useAuth(), [rec, setRec] = useState(null), [err, setErr] = useState(''), [n, setN] = useState(0)
  // GET /attendance has no per-role scoping on the backend, so the request is always limited to this student's own id.
  useEffect(() => { api.get('/attendance', { params: { studentId: p._id } }).then(r => setRec(toList(r.data))).catch(e => setErr(errMsg(e))) }, [p._id, n])
  const c = s => (rec || []).filter(r => r.status === s).length, t = rec?.length || 0
  const info = [['Phone', p.phone], ['Parent phone', p.parentPhone], ['Birth date', fmtDay(p.birthDate)], ['Address', p.address]]
  return <><div className="grid"><Kpi icon={Hash} label="Student ID" value={p.studentId} /><Kpi icon={School} label="Class" value={label(p.classId)} tone="cy" /><div className="card kpi"><div className="ic ok"><UserCheck size={18} /></div><div><b><Badge v={p.status} /></b><span>Status</span></div></div></div>
    <div className="split"><div className="card pad"><h2 style={{ marginBottom: 6 }}>Attendance summary</h2>
        {err ? <Empty title="Couldn’t load attendance" text={err} onRetry={() => { setErr(''); setN(n + 1) }} /> : !rec ? <Skeleton rows={3} /> : !t ? <Empty title="No attendance records yet" /> : <>
          <div className="rate"><b>{pct(c('present'), t)}%</b><span>present across {t} records</span></div>
          <div className="stack"><i style={{ width: `${pct(c('present'), t)}%`, background: 'var(--ok)' }} /><i style={{ width: `${pct(c('late'), t)}%`, background: '#e0a53a' }} /><i style={{ width: `${pct(c('absent'), t)}%`, background: 'var(--bad)' }} /></div>
          <div className="tiles">{[['Present', 'ok', UserCheck], ['Late', 'warn', Clock], ['Absent', 'bad', UserX]].map(([k, tone, I]) => <div key={k} className="tile"><div className={`ic ${tone}`}><I size={16} /></div><div><b>{c(k.toLowerCase())}</b><span>{k}</span></div></div>)}</div></>}</div>
      <div className="card pad"><h2 style={{ marginBottom: 10 }}>My details</h2>{info.map(([k, v]) => <div key={k} className="kv"><span>{k}</span><b>{v || '—'}</b></div>)}<Link className="btn" style={{ marginTop: 12 }} to="/profile">Edit account</Link></div></div>
    {rec?.length > 0 && <div className="card" style={{ marginTop: 14 }}><div className="pad" style={{ paddingBottom: 0 }}><h2>Attendance history</h2></div><div className="tw"><table className="rt"><thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead><tbody>
      {[...rec].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15).map(r => <tr key={r._id}><td data-l="Date">{fmtDate(r.date)}</td><td data-l="Subject">{label(r.subjectId)}</td><td data-l="Status"><Badge v={r.status} /></td></tr>)}</tbody></table></div></div>}</>
}

export default function Dashboard() {
  const { user, profile } = useAuth(), first = String(user.name).split(' ')[0]
  return <><PageHead eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} title={`Welcome back, ${first}`} sub={{ admin: 'School overview for today.', teacher: 'Your classes and today’s attendance.', student: 'Your profile and attendance.' }[user.role]} />
    {user.role !== 'student' ? <Staff role={user.role} /> : profile ? <Student /> : <div className="card"><Empty title="Student profile unavailable" text="Please sign out and back in, or contact an administrator." /></div>}</>
}
