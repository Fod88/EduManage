import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { TOKEN_KEY, toObj, errMsg } from '../services/api'
const Ctx = createContext()
export const useAuth = () => useContext(Ctx)
const claims = t => { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) } catch { return null } }
// The backend has no generic "current user" read. Teachers and students use /teachers/me and /students/me
// (user populated); admins read their own record via GET /users/:id using the id in the JWT.
async function loadMe() {
  const c = claims(localStorage.getItem(TOKEN_KEY) || ''); if (!c?._id) throw new Error('Invalid session')
  if (c.role === 'student' || c.role === 'teacher') { const p = toObj((await api.get(`/${c.role}s/me`)).data); if (!p?.userId) throw new Error('Profile unavailable'); return { user: p.userId, profile: p } }
  return { user: toObj((await api.get(`/users/${c._id}`)).data), profile: null }
}
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, profile: null }), [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY)), [authError, setAuthError] = useState('')
  const restore = useCallback((retry = true) => {
    if (retry) { setAuthError(''); setLoading(true) }
    loadMe().then(setState).catch(e => {
      const s = e.response?.status
      // Rejected/invalid token -> back to login. Network or server trouble -> keep the token and offer a retry.
      if (!e.response && e.request) setAuthError(errMsg(e))
      else if (s >= 500) setAuthError(errMsg(e))
      else { localStorage.removeItem(TOKEN_KEY); if (s === 404 || e.message === 'Profile unavailable') setAuthError('Your account has no matching profile. Please contact an administrator.') }
    }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { if (localStorage.getItem(TOKEN_KEY)) restore(false) }, [restore])
  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    try { setAuthError(''); setState(await loadMe()) } catch (e) { localStorage.removeItem(TOKEN_KEY); throw e }
  }
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setAuthError(''); setState({ user: null, profile: null }) }
  const setUser = user => setState(s => ({ ...s, user }))
  return <Ctx.Provider value={{ user: state.user && { ...state.user, role: (state.user.role || '').toLowerCase() }, profile: state.profile, loading, authError, restore, login, logout, setUser }}>{children}</Ctx.Provider>
}
