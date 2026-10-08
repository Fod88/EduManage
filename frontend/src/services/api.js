import axios from 'axios'
// Single place to adjust base URL, token storage and endpoint paths.
export const TOKEN_KEY = 'edumanage_token'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })
api.interceptors.request.use(c => { const t = localStorage.getItem(TOKEN_KEY); if (t) c.headers.Authorization = `Bearer ${t}`; return c })
api.interceptors.response.use(r => r, e => {
  // Only a rejected token (not e.g. a wrong current password) should end the session.
  if (e.response?.status === 401 && /authentication|token|authorization/i.test(e.response.data?.error || '')) { localStorage.removeItem(TOKEN_KEY); window.location.assign('/login') }
  return Promise.reject(e)
})
const MSG = { 403: 'You do not have permission to do this.', 404: 'Not found.', 409: 'This record conflicts with an existing one.', 500: 'Server error. Try again shortly.' }
export const errMsg = e => e.response?.data?.error || e.response?.data?.message || MSG[e.response?.status] || (e.request ? 'Cannot reach the server.' : e.message)
// Backends wrap lists differently; take the first array found in the payload.
export const toList = d => Array.isArray(d) ? d : d && typeof d === 'object' ? (Object.values(d).find(Array.isArray) ?? (d.data ? toList(d.data) : [])) : []
export const toObj = d => d?.data && typeof d.data === 'object' && !Array.isArray(d.data) ? d.data : d
export const label = o => !o ? '—' : typeof o === 'string' ? o : o.userId && typeof o.userId === 'object' ? label(o.userId) : o.grade != null && o.name ? `${o.grade}-${o.name}` : o.name || o.fullName || o.title || [o.firstName, o.lastName].filter(Boolean).join(' ') || o.email || o._id
export default api
// birthDate is stored as a plain string; format it when it is an ISO date.
export const fmtDay = s => /^\d{4}-\d{2}-\d{2}/.test(s || '') ? new Date(`${s.slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : s || '—'
// The backend stamps attendance with the Egypt calendar day.
export const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date())
export const fmtDate = d => d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Cairo' }) : '—'
