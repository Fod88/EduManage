import ResourcePage from '../components/ResourcePage'
import { Avatar, Badge } from '../components/ui'
import { label, fmtDate as fmt, fmtDay } from '../services/api'
const status = ['active', 'inactive'], A = ['admin'], AT = ['admin', 'teacher']
const person = r => { const n = label(r), u = r.userId || r; return <div className="who"><Avatar name={n} /><div><b>{n}</b><div style={{ color: 'var(--mute)', fontSize: 12, overflowWrap: 'anywhere' }}>{u.email}</div></div></div> }
const st = { label: 'Status', render: r => <Badge v={r.status} /> }
const stF = { name: 'status', label: 'Statuses', options: status }
const stFld = { name: 'status', label: 'Status', options: status, default: 'active', editOnly: true }
const cF = { name: 'classId', label: 'Classes', optionsFrom: '/classes' }
const sF = { name: 'subjectId', label: 'Subjects', optionsFrom: '/subjects' }
export const configs = {
  students: { title: 'Students', singular: 'Student', path: '/students', write: A, sub: 'Everyone enrolled at your school.', searchHint: 'Search by name, email or student ID…',
    deleteHint: 'The server refuses this if the student has attendance records; otherwise their login account is removed too.', formHint: 'This creates the student’s login account and profile together.',
    details: { rows: r => [['Student ID', r.studentId], ['Class', label(r.classId)], ['Phone', r.phone], ['Parent phone', r.parentPhone], ['Birth date', fmtDay(r.birthDate)], ['Address', r.address], ['Status', <Badge v={r.status} />]] },
    columns: [{ label: 'Student', render: person }, { label: 'Student ID', render: r => r.studentId }, { label: 'Class', render: r => label(r.classId) }, { label: 'Phone', render: r => r.phone || '—' }, st],
    filters: [stF, cF],
    fields: [{ name: 'name', label: 'Full name', required: true, createOnly: true }, { name: 'email', label: 'Email', type: 'email', required: true, createOnly: true }, { name: 'password', label: 'Initial password', type: 'password', required: true, createOnly: true, placeholder: 'At least 8 characters' }, { name: 'studentId', label: 'Student ID', required: true, createOnly: true },
      { name: 'classId', label: 'Class', optionsFrom: '/classes', required: true }, { name: 'phone', label: 'Phone' }, { name: 'parentPhone', label: 'Parent phone' }, { name: 'birthDate', label: 'Birth date', type: 'date' }, { name: 'address', label: 'Address', wide: true }, stFld] },
  teachers: { title: 'Teachers', singular: 'Teacher', path: '/teachers', write: A, client: true, filters: [stF], sub: 'Teaching staff and their status.', searchHint: 'Search teachers…',
    deleteHint: 'The server refuses this while the teacher still has teaching assignments; otherwise their login account is removed too.', formHint: 'This creates the teacher’s login account and profile together.',
    details: { assignments: true, rows: r => [['Phone', r.phone], ['Status', <Badge v={r.status} />]] },
    columns: [{ label: 'Teacher', render: person }, { label: 'Phone', render: r => r.phone || '—' }, st],
    fields: [{ name: 'name', label: 'Full name', required: true, createOnly: true }, { name: 'email', label: 'Email', type: 'email', required: true, createOnly: true }, { name: 'password', label: 'Initial password', type: 'password', required: true, createOnly: true }, { name: 'phone', label: 'Phone' }, stFld] },
  classes: { title: 'Classes', singular: 'Class', path: '/classes', write: A, client: true, sub: 'Grades and class groups.',
    deleteHint: 'The server deletes the class immediately and does not check for students or assignments that still use it.',
    columns: [{ label: 'Class', render: r => <b>{label(r)}</b> }, { label: 'Grade', render: r => r.grade }, { label: 'Name', render: r => r.name }, st],
    fields: [{ name: 'name', label: 'Class name', required: true, placeholder: 'A' }, { name: 'grade', label: 'Grade', required: true, placeholder: '7' }] },
  subjects: { title: 'Subjects', singular: 'Subject', path: '/subjects', write: A, client: true, filters: [stF], sub: 'Curriculum subjects.',
    deleteHint: 'The server deletes the subject immediately and does not check for assignments or attendance that use it.',
    columns: [{ label: 'Subject', render: r => <b>{r.name}</b> }, { label: 'Code', render: r => r.code }, st],
    fields: [{ name: 'name', label: 'Subject name', required: true }, { name: 'code', label: 'Subject code', required: true, placeholder: 'MATH101' }, stFld] },
  assignments: { title: 'Teaching assignments', singular: 'Assignment', path: '/teachingAssignments', write: A, client: true, searchHint: 'Search teacher, class or subject…',
    sub: 'Who teaches which subject to which class. Teachers can record attendance only for their active assignments.', formHint: 'Each teacher, class and subject combination can exist only once.',
    deleteHint: 'The teacher will no longer be able to record attendance for this class and subject. Existing attendance records are kept.', itemName: r => `${label(r.teacherId)} · ${label(r.classId)} · ${label(r.subjectId)}`,
    columns: [{ label: 'Teacher', render: r => label(r.teacherId) }, { label: 'Class', render: r => label(r.classId) }, { label: 'Subject', render: r => label(r.subjectId) }, st],
    filters: [{ name: 'teacherId', label: 'Teachers', optionsFrom: '/teachers' }, cF, sF, stF],
    fields: [{ name: 'teacherId', label: 'Teacher', optionsFrom: '/teachers', required: true }, { name: 'classId', label: 'Class', optionsFrom: '/classes', required: true }, { name: 'subjectId', label: 'Subject', optionsFrom: '/subjects', required: true }, stFld] },
  attendance: { title: 'Attendance records', singular: 'Attendance record', path: '/attendance', write: AT, noCreate: true, search: false, sub: 'Review and correct attendance records.',
    deleteHint: 'Teachers can change or delete records only for classes and subjects they are assigned to.', itemName: r => `${label(r.studentId)} · ${label(r.subjectId)} · ${fmt(r.date)}`,
    columns: [{ label: 'Date', render: r => fmt(r.date) }, { label: 'Student', render: r => <div className="who"><Avatar name={label(r.studentId)} />{label(r.studentId)}</div> }, { label: 'Class', render: r => label(r.classId) }, { label: 'Subject', render: r => label(r.subjectId) }, st],
    filters: [{ name: 'date', label: 'Date', type: 'date' }, cF, sF, { name: 'studentId', label: 'Students', optionsFrom: '/students' }, { name: 'status', label: 'Statuses', options: ['present', 'absent', 'late'] }],
    fields: [{ name: 'status', label: 'Status', options: ['present', 'absent', 'late'], required: true }] },
  users: { title: 'Users', singular: 'User', path: '/users', write: A, noCreate: true, client: true, lockSelf: ['role', 'status'], filters: [stF, { name: 'role', label: 'Roles', options: ['admin', 'teacher', 'student'] }],
    sub: 'All accounts. Students and teachers are created from their own pages.', searchHint: 'Search by name or email…',
    deleteHint: 'Only the login account is removed.', deleteBlocked: (r, me) => r._id === me._id ? 'You can’t delete your own account' : r.role !== 'admin' ? 'Delete students and teachers from their own pages' : null,
    columns: [{ label: 'User', render: person }, { label: 'Role', render: r => <Badge v={r.role} /> }, st],
    fields: [{ name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'role', label: 'Role', options: ['admin', 'teacher', 'student'], required: true, warn: 'Changing a role changes what this person can access. Student and teacher accounts also have a matching profile, which is not changed.' }, stFld] },
}
export const Page = ({ k, rowFilter }) => <ResourcePage key={k} cfg={configs[k]} rowFilter={rowFilter} />
