import { createContext, useCallback, useContext, useState } from 'react'
const Ctx = createContext()
export const useToast = () => useContext(Ctx)
export function ToastProvider({ children }) {
  const [t, setT] = useState([])
  const push = useCallback((message, type = 'success') => { const id = Date.now() + Math.random(); setT(a => [...a, { id, message, type }]); setTimeout(() => setT(a => a.filter(x => x.id !== id)), 4000) }, [])
  return <Ctx.Provider value={push}>{children}<div className="toasts" role="status">{t.map(x => <div key={x.id} className={`toast ${x.type}`}>{x.message}</div>)}</div></Ctx.Provider>
}
