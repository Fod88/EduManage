import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, CheckCheck } from 'lucide-react'
import api, { errMsg, toList, label, today, fmtDate } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import useMyAssignments from '../hooks/useMyAssignments'
import { Page } from './resources'
import { Avatar, Empty, PageHead, Skeleton } from '../components/ui'

const ST = ['present', 'late', 'absent']
const uniq = list => [...new Map(list.filter(Boolean).map(x => [x._id, x])).values()]
const plural = n => `${n} ${n === 1 ? 'record' : 'records'}`

// Class -> Subject -> students -> status -> save. New students are created (POST); today's existing records are corrected (PATCH).
// The backend has no bulk endpoint, so each changed student is one request.
function Take({ list, loading, error }) {
  const toast = useToast(), pending = useRef({})
  const [cid, setCid] = useState(''), [sid, setSid] = useState(''), [students, setStudents] = useState(null), [marks, setMarks] = useState({}), [ex, setEx] = useState({})
  const [busy, setBusy] = useState(false), [tick, setTick] = useState(0), [failed, setFailed] = useState(null)
  const classes = useMemo(() => uniq(list.map(a => a.classId)), [list])
  const subjects = useMemo(() => uniq(list.filter(a => a.classId?._id === cid).map(a => a.subjectId)), [list, cid])
  useEffect(() => {
    if (!cid || !sid) return
    let on = true
    Promise.all([api.get('/students', { params: { classId: cid, status: 'active' } }), api.get('/attendance', { params: { classId: cid, subjectId: sid, date: today() } })]).then(([s, a]) => {
      if (!on) return
      const st = toList(s.data), e = {}; toList(a.data).forEach(r => { e[r.studentId?._id] = r })
      setEx(e); setStudents(st); setMarks(Object.fromEntries(st.map(x => [x._id, pending.current[x._id] || e[x._id]?.status || 'present']))); pending.current = {}
    }).catch(e => { if (on) { toast(errMsg(e), 'error'); setStudents([]) } })
    return () => { on = false }
  }, [cid, sid, tick, toast])
  const pick = (c, s) => { setCid(c); setSid(s); setStudents(null); setFailed(null); pending.current = {} }
  const todo = (students || []).filter(s => !ex[s._id] || ex[s._id].status !== marks[s._id])
  const save = async () => {
    setBusy(true); setFailed(null)
    const res = await Promise.allSettled(todo.map(s => ex[s._id] ? api.patch(`/attendance/${ex[s._id]._id}`, { status: marks[s._id] }) : api.post('/attendance', { studentId: s._id, classId: cid, subjectId: sid, status: marks[s._id] })))
    const bad = res.map((r, i) => [r, todo[i]]).filter(([r]) => r.status === 'rejected'), ok = todo.length - bad.length
    if (!bad.length) toast(`${plural(ok)} saved.`)
    else { toast(`${plural(ok)} saved, ${bad.length} failed.`, 'error'); pending.current = Object.fromEntries(bad.map(([, s]) => [s._id, marks[s._id]])); setFailed({ names: bad.map(([, s]) => label(s)), reasons: [...new Set(bad.map(([r]) => errMsg(r.reason)))] }) }
    setBusy(false); setTick(t => t + 1)
  }
  const n = s => Object.values(marks).filter(x => x === s).length
  if (loading) return <div className="card"><Skeleton /></div>
  if (error) return <div className="card"><Empty title="Couldn’t load your assignments" text={error} /></div>
  if (!list.length) return <div className="card"><Empty title="No active teaching assignments" text="You can record attendance only for classes and subjects you are assigned to. Ask an administrator to assign you." /></div>
  return <div className="card" aria-busy={busy}>
    <div className="bar"><select className="in" aria-label="Class" disabled={busy} value={cid} onChange={e => pick(e.target.value, '')}><option value="">Select class…</option>{classes.map(c => <option key={c._id} value={c._id}>{label(c)}</option>)}</select>
      <select className="in" aria-label="Subject" value={sid} disabled={!cid || busy} onChange={e => pick(cid, e.target.value)}><option value="">Select subject…</option>{subjects.map(s => <option key={s._id} value={s._id}>{label(s)}</option>)}</select>
      <span className="count">Today · {fmtDate(new Date())}</span></div>
    {!cid || !sid ? <Empty title="Choose a class and subject" text="Only your active assignments are listed. Attendance is recorded for today." />
      : !students ? <Skeleton /> : !students.length ? <Empty title="No active students in this class" />
      : <>
        {failed && <div className="note bad" role="alert" style={{ margin: 14 }}>Not saved: {failed.names.join(', ')}. {failed.reasons.join(' ')} Your selections are kept — fix the problem and save again.</div>}
        <div className="bar"><button className="btn" disabled={busy} onClick={() => setMarks(Object.fromEntries(students.map(s => [s._id, 'present'])))}><CheckCheck size={16} />Mark all present</button>
          <span className="count"><b className="tp">{n('present')}</b> present · <b className="tl">{n('late')}</b> late · <b className="ta">{n('absent')}</b> absent</span></div>
        <div className="tw"><table className="rt"><thead><tr><th>Student</th><th>ID</th><th>Status</th></tr></thead><tbody>
          {students.map(s => <tr key={s._id}><td data-l="Student"><div className="who"><Avatar name={label(s)} />{label(s)}{ex[s._id] && <span className="bd n">Recorded</span>}</div></td><td data-l="ID">{s.studentId}</td>
            <td data-l="Status"><div className="seg" role="group" aria-label={`Attendance status for ${label(s)}`}>{ST.map(k => <button key={k} disabled={busy} className={`${k} ${marks[s._id] === k ? 'on' : ''}`} aria-pressed={marks[s._id] === k} onClick={() => setMarks({ ...marks, [s._id]: k })}>{k[0].toUpperCase() + k.slice(1)}</button>)}</div></td></tr>)}</tbody></table></div>
        <div className="bar" style={{ borderTop: '1px solid var(--line)', borderBottom: 0, justifyContent: 'flex-end' }}><span className="count">{todo.length ? `${plural(todo.length)} to save` : 'Everything is saved'}</span>
          <button className="btn p" disabled={busy || !todo.length} onClick={save}><Check size={16} />{busy ? 'Saving…' : 'Save attendance'}</button></div></>}
  </div>
}

export default function Attendance() {
  const { user } = useAuth(), teacher = user.role === 'teacher', [tab, setTab] = useState(teacher ? 'take' : 'records'), mine = useMyAssignments()
  const rowFilter = useMemo(() => { if (!teacher) return undefined; const ok = new Set(mine.list.map(a => `${a.classId?._id}:${a.subjectId?._id}`)); return rows => rows.filter(r => ok.has(`${r.classId?._id}:${r.subjectId?._id}`)) }, [teacher, mine.list])
  return <>
    {teacher && <><PageHead title="Attendance" sub="Record today’s attendance or review records for your classes." />
      <div className="tabs" role="tablist">{[['take', 'Take attendance'], ['records', 'Records']].map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{t}</button>)}</div></>}
    {tab === 'take' && teacher ? <Take {...mine} /> : teacher && mine.loading ? <div className="card"><Skeleton /></div> : <Page k="attendance" rowFilter={rowFilter} />}
  </>
}
