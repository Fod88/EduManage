import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import api, { errMsg, toList, label } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Modal, Confirm, Skeleton, Empty, PageHead, Avatar, Badge } from './ui'

const idOf = v => (v && typeof v === 'object' ? v._id : v) ?? ''
const cap = o => o[0].toUpperCase() + o.slice(1)
const Opts = ({ list }) => list.map(o => typeof o === 'string' ? <option key={o} value={o}>{cap(o)}</option> : <option key={o._id} value={o._id}>{label(o)}</option>)
// GET /classes and /subjects are admin-only; teachers get the classes/subjects of their own assignments instead.
async function loadOptions(path, mineId) {
  try { return toList((await api.get(path)).data) } catch (e) {
    const key = { '/classes': 'classId', '/subjects': 'subjectId' }[path]
    if (e.response?.status !== 403 || !key) throw e
    const seen = new Map(); toList((await api.get('/teachingAssignments')).data).filter(a => !mineId || a.teacherId?._id === mineId).forEach(a => a[key] && seen.set(a[key]._id, a[key])); return [...seen.values()]
  }
}

function FormModal({ cfg, item, opts, onClose, onSaved }) {
  const { user } = useAuth(), toast = useToast()
  const self = !!item && item._id === user._id && cfg.lockSelf
  const fields = cfg.fields.filter(f => (item ? !f.createOnly : !f.editOnly) && !(self && cfg.lockSelf.includes(f.name)))
  const [v, setV] = useState(() => Object.fromEntries(fields.map(f => [f.name, f.optionsFrom ? idOf(item?.[f.name]) : item?.[f.name] ?? f.default ?? ''])))
  const [errs, setErrs] = useState({}), [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault(); const er = {}
    fields.forEach(f => { const x = String(v[f.name]).trim()
      if (f.required && !x) er[f.name] = `${f.label} is required`
      else if (x && f.type === 'email' && !/^\S+@\S+\.\S+$/.test(x)) er[f.name] = 'Enter a valid email address'
      else if (x && f.type === 'password' && x.length < 8) er[f.name] = 'Use at least 8 characters' })
    setErrs(er); if (Object.keys(er).length) return
    const body = {}; fields.forEach(f => { const x = v[f.name]; if (x === '' && (!item || f.optionsFrom || f.options)) return; body[f.name] = typeof x === 'string' ? x.trim() : x })
    setBusy(true)
    try { item ? await api.patch(`${cfg.path}/${item._id}`, body) : await api.post(cfg.path, body); toast(`${cfg.singular} ${item ? 'updated' : 'created'}`); onSaved() }
    catch (x) { toast(errMsg(x), 'error') } finally { setBusy(false) }
  }
  return <Modal title={`${item ? 'Edit' : 'Add'} ${cfg.singular.toLowerCase()}`} onClose={busy ? () => {} : onClose}><form onSubmit={submit} noValidate>
    {cfg.formHint && !item && <div className="note">{cfg.formHint}</div>}
    {self && <div className="note">You can’t change your own role or status.</div>}
    <div className="fgrid">{fields.map(f => <div className={`fld ${f.wide || f.warn ? 'wide' : ''}`} key={f.name}><label htmlFor={f.name}>{f.label}{f.required && <i className="req" aria-hidden="true"> *</i>}</label>
      {f.options || f.optionsFrom ? <select id={f.name} className="in" value={v[f.name]} aria-invalid={!!errs[f.name]} onChange={e => setV({ ...v, [f.name]: e.target.value })}><option value="">Select…</option><Opts list={f.options || opts[f.name] || []} /></select>
        : <input id={f.name} className="in" type={f.type || 'text'} autoComplete="off" placeholder={f.placeholder} value={v[f.name]} onChange={e => setV({ ...v, [f.name]: e.target.value })} aria-invalid={!!errs[f.name]} />}
      {errs[f.name] && <span className="err" role="alert">{errs[f.name]}</span>}
      {f.warn && item && v[f.name] !== item[f.name] && <div className="note warn" role="alert">{f.warn}</div>}</div>)}</div>
    <div className="actions"><button type="button" className="btn" disabled={busy} onClick={onClose}>Cancel</button><button className="btn p" disabled={busy}>{busy ? 'Saving…' : item ? 'Save changes' : `Create ${cfg.singular.toLowerCase()}`}</button></div></form></Modal>
}

function Details({ cfg, item, onClose }) {
  const d = cfg.details, [as, setAs] = useState(null)
  useEffect(() => { if (!d.assignments) return; let on = true
    api.get('/teachingAssignments').then(r => on && setAs({ list: toList(r.data).filter(a => a.teacherId?._id === item._id) })).catch(e => on && setAs({ error: errMsg(e) })); return () => { on = false } }, [d.assignments, item._id])
  const u = item.userId || item
  return <Modal title={`${cfg.singular} details`} onClose={onClose}>
    <div className="who" style={{ gap: 14, marginBottom: 12 }}><span className="av lg">{label(item).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span><div><h2>{label(item)}</h2><div style={{ color: 'var(--mute)', overflowWrap: 'anywhere' }}>{u.email}</div></div></div>
    <div className="dl">{d.rows(item).map(([k, v]) => <div key={k} className="kv"><span>{k}</span><b>{v || '—'}</b></div>)}</div>
    {d.assignments && <><h2 style={{ margin: '18px 0 6px' }}>Teaching assignments</h2>
      {!as ? <div className="sk" style={{ width: '70%' }} /> : as.error ? <p className="err">{as.error}</p> : !as.list.length ? <p style={{ color: 'var(--mute)' }}>No teaching assignments yet.</p>
        : as.list.map(a => <div key={a._id} className="kv"><span>{label(a.classId)}</span><b>{label(a.subjectId)} <Badge v={a.status} /></b></div>)}</>}
  </Modal>
}

export default function ResourcePage({ cfg, rowFilter }) {
  const { user, profile } = useAuth(), toast = useToast(), canWrite = cfg.write.includes(user.role)
  const mineId = user.role === 'teacher' ? profile?._id : undefined
  const [rows, setRows] = useState(null), [error, setError] = useState(''), [q, setQ] = useState(''), [f, setF] = useState({})
  const [opts, setOpts] = useState({}), [edit, setEdit] = useState(null), [view, setView] = useState(null), [del, setDel] = useState(null), [busy, setBusy] = useState(false), [delErr, setDelErr] = useState('')
  const load = useCallback(async () => {
    setError('')
    try { const params = cfg.client ? {} : { ...Object.fromEntries(Object.entries(f).filter(([, x]) => x)), ...(q && { search: q }) }
      setRows(toList((await api.get(cfg.path, { params })).data)) } catch (e) { setError(errMsg(e)); setRows([]) }
  }, [cfg, f, q])
  useEffect(() => { const t = setTimeout(load, cfg.client ? 0 : 250); return () => clearTimeout(t) }, [load, cfg.client])
  useEffect(() => { [...cfg.fields, ...(cfg.filters || [])].filter(x => x.optionsFrom).forEach(x => loadOptions(x.optionsFrom, mineId).then(l => setOpts(o => ({ ...o, [x.name]: l }))).catch(() => {})) }, [cfg, mineId])
  const shown = useMemo(() => { let r = rows || []
    if (cfg.client) { const t = q.trim().toLowerCase()
      if (t) r = r.filter(x => [label(x), x.email, x.userId?.email, x.code, x.studentId, label(x.teacherId), label(x.classId), label(x.subjectId)].join(' ').toLowerCase().includes(t))
      Object.entries(f).forEach(([k, val]) => { if (val) r = r.filter(x => idOf(x[k]) === val) }) }
    return rowFilter ? rowFilter(r) : r }, [rows, q, f, cfg, rowFilter])
  const nameOf = r => cfg.itemName ? cfg.itemName(r) : label(r)
  const remove = async () => { setBusy(true); setDelErr(''); try { await api.delete(`${cfg.path}/${del._id}`); toast(`${cfg.singular} deleted`); setDel(null); load() } catch (e) { setDelErr(errMsg(e)) } finally { setBusy(false) } }
  const filtered = q || Object.values(f).some(Boolean), showActs = canWrite || cfg.details
  return <>
    <PageHead title={cfg.title} sub={cfg.sub}>{canWrite && !cfg.noCreate && <button className="btn p" onClick={() => setEdit({})}><Plus size={16} />Add {cfg.singular.toLowerCase()}</button>}</PageHead>
    {cfg.hint && <div className="note">{cfg.hint}</div>}
    <div className="card">
      <div className="bar">
        {cfg.search !== false && <div className="search"><Search size={16} /><input className="in" placeholder={cfg.searchHint || `Search ${cfg.title.toLowerCase()}…`} aria-label={`Search ${cfg.title.toLowerCase()}`} value={q} onChange={e => setQ(e.target.value)} /></div>}
        {(cfg.filters || []).map(x => x.type === 'date' ? <input key={x.name} type="date" className="in" aria-label={x.label} value={f[x.name] || ''} onChange={e => setF({ ...f, [x.name]: e.target.value })} />
          : <select key={x.name} className="in" aria-label={`Filter by ${x.label.toLowerCase()}`} value={f[x.name] || ''} onChange={e => setF({ ...f, [x.name]: e.target.value })}><option value="">All {x.label.toLowerCase()}</option><Opts list={x.options || opts[x.name] || []} /></select>)}
        {filtered && <button className="btn" onClick={() => { setQ(''); setF({}) }}>Clear</button>}
        {rows && !error && <span className="count" aria-live="polite">{shown.length} {shown.length === 1 ? 'record' : 'records'}</span>}
      </div>
      {rows === null ? <Skeleton /> : error ? <Empty title="Couldn’t load data" text={error} onRetry={load} /> : !shown.length ? <Empty title={filtered ? 'No matching records' : `No ${cfg.title.toLowerCase()} yet`} text={filtered ? 'Try different search terms or clear the filters.' : canWrite && !cfg.noCreate ? `Add the first ${cfg.singular.toLowerCase()} to get started.` : undefined} /> :
        <div className="tw"><table className="rt"><thead><tr>{cfg.columns.map(c => <th key={c.label}>{c.label}</th>)}{showActs && <th><span className="sr">Actions</span></th>}</tr></thead><tbody>
          {shown.map(r => { const blocked = cfg.deleteBlocked?.(r, user); return <tr key={r._id}>{cfg.columns.map(c => <td key={c.label} data-l={c.label}>{c.render(r)}</td>)}
            {showActs && <td className="acts">
              {cfg.details && <button className="btn ghost" aria-label={`View ${nameOf(r)}`} title="View details" onClick={() => setView(r)}><Eye size={16} /></button>}
              {canWrite && <><button className="btn ghost" aria-label={`Edit ${nameOf(r)}`} title="Edit" onClick={() => setEdit(r)}><Pencil size={16} /></button>
                <button className="btn ghost danger" aria-label={`Delete ${nameOf(r)}`} title={blocked || 'Delete'} disabled={!!blocked} onClick={() => { setDelErr(''); setDel(r) }}><Trash2 size={16} /></button></>}</td>}</tr> })}</tbody></table></div>}
    </div>
    {edit && <FormModal cfg={cfg} item={edit._id ? edit : null} opts={opts} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load() }} />}
    {view && <Details cfg={cfg} item={view} onClose={() => setView(null)} />}
    {del && <Confirm title={`Delete ${cfg.singular.toLowerCase()}?`} text={`“${nameOf(del)}” will be permanently deleted. ${cfg.deleteHint || ''} This can’t be undone.`} error={delErr} busy={busy} onYes={remove} onClose={() => setDel(null)} />}
  </>
}
