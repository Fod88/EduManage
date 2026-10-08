import { useEffect, useRef } from 'react'
import { X, Inbox } from 'lucide-react'
export const Avatar = ({ name = '?' }) => <span className="av">{String(name).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}</span>
export const Badge = ({ v }) => <span className={`bd ${String(v).toLowerCase()}`}>{v ? String(v)[0].toUpperCase() + String(v).slice(1) : '—'}</span>
export const Skeleton = ({ rows = 5 }) => <div className="pad" style={{ display: 'grid', gap: 18 }}>{Array.from({ length: rows }, (_, i) => <div key={i} className="sk" style={{ width: `${95 - i * 6}%` }} />)}</div>
export const Empty = ({ title = 'Nothing here yet', text, onRetry }) => <div className="empty"><Inbox size={32} /><h2>{title}</h2>{text && <p>{text}</p>}{onRetry && <button className="btn" onClick={onRetry}>Try again</button>}</div>
export function Modal({ title, onClose, children }) {
  const ref = useRef(), close = useRef(onClose)
  useEffect(() => { close.current = onClose })
  useEffect(() => { const prev = document.activeElement; ref.current?.focus()
    const k = e => e.key === 'Escape' && close.current(); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('keydown', k); prev?.focus?.() } }, [])
  return <div className="ov" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
    <div className="mhead"><h2>{title}</h2><button className="btn ghost" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>{children}</div></div>
}
export const Confirm = ({ title, text, error, busy, onYes, onClose }) => <Modal title={title} onClose={busy ? () => {} : onClose}><p style={{ color: 'var(--mute)', marginTop: 0 }}>{text}</p>
  {error && <div className="note bad" role="alert">{error}</div>}
  <div className="actions"><button className="btn" disabled={busy} onClick={onClose}>Cancel</button><button className="btn d" disabled={busy} onClick={onYes}>{busy ? 'Deleting…' : 'Delete'}</button></div></Modal>
export const PageHead = ({ title, sub, eyebrow, children }) => <div className="head"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{sub && <p>{sub}</p>}</div><div>{children}</div></div>
