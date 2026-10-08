import { useEffect, useState } from 'react'
import api, { errMsg, toList } from '../services/api'
import { useAuth } from '../context/AuthContext'
// Active teaching assignments. For teachers only their own (GET /teachingAssignments returns everyone's).
export default function useMyAssignments() {
  const { user, profile } = useAuth(), [s, setS] = useState({ list: [], loading: true, error: '' })
  useEffect(() => { api.get('/teachingAssignments').then(r => {
    let l = toList(r.data).filter(a => a.status === 'active'); if (user.role === 'teacher') l = l.filter(a => a.teacherId?._id === profile?._id)
    setS({ list: l, loading: false, error: '' }) }).catch(e => setS({ list: [], loading: false, error: errMsg(e) })) }, [user.role, profile?._id])
  return s
}
