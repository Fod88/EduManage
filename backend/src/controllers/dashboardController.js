const User = require("../models/User")
const Student = require("../models/Student")
const Teacher = require("../models/Teacher")
const Class = require("../models/Class")
const Attendance = require("../models/Attendance")
const TeachingAssignment = require("../models/TeachingAssignment")

// ADMIN DASHBOARD

const getAdminDashboard = async (req, res) => {
    try {

        const [
            totalStudents,
            activeStudents,
            totalTeachers,
            activeTeachers,
            totalClasses,
            totalAttendance,
            presentAttendance,
            absentAttendance,
            lateAttendance
        ] = await Promise.all([

            Student.countDocuments(),

            Student.countDocuments({
                status: "active"
            }),

            Teacher.countDocuments(),

            Teacher.countDocuments({
                status: "active"
            }),

            Class.countDocuments(),

            Attendance.countDocuments({
                date: getEgyptDayStart()
            }),

            Attendance.countDocuments({
                date: getEgyptDayStart(),
                status: "present"
            }),

            Attendance.countDocuments({
                date: getEgyptDayStart(),
                status: "absent"
            }),

            Attendance.countDocuments({
                date: getEgyptDayStart(),
                status: "late"
            })
        ])


        res.status(200).send({
            students: {
                total: totalStudents,
                active: activeStudents
            },

            teachers: {
                total: totalTeachers,
                active: activeTeachers
            },

            classes: {
                total: totalClasses
            },

            attendance: {
                total: totalAttendance,
                present: presentAttendance,
                absent: absentAttendance,
                late: lateAttendance,
                rate: totalAttendance === 0
                    ? 0
                    : Number(((presentAttendance / totalAttendance) * 100).toFixed(2))
            }
        })
    }

    catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
}


// GET TODAY START IN EGYPT

const getEgyptDayStart = () => {

    const egyptDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date())

    return new Date(`${egyptDate}T00:00:00+03:00`)
}


const getTeacherDashboard = async (req, res) => {
    try {

        const teacher = await Teacher.findOne({
            userId: req.user._id
        })

        if (!teacher) {
            return res.status(404).send({
                error: "Teacher profile not found"
            })
        }

        const assignments = await TeachingAssignment.find({
            teacherId: teacher._id,
            status: "active"
        })
        .populate("classId")
        .populate("subjectId")

        const classIds = [
            ...new Set(
                assignments.map(assignment =>
                    assignment.classId._id.toString()
                )
            )
        ]

        const totalClasses = classIds.length

        const totalStudents = await Student.countDocuments({
            classId: {
                $in: classIds
            },
            status: "active"
        })

        const [
            totalAttendance,
            presentAttendance,
            absentAttendance,
            lateAttendance
        ] = await Promise.all([

            Attendance.countDocuments({
                recordedBy: teacher._id,
                date: getEgyptDayStart()
            }),

            Attendance.countDocuments({
                recordedBy: teacher._id,
                date: getEgyptDayStart(),
                status: "present"
            }),

            Attendance.countDocuments({
                recordedBy: teacher._id,
                date: getEgyptDayStart(),
                status: "absent"
            }),

            Attendance.countDocuments({
                recordedBy: teacher._id,
                date: getEgyptDayStart(),
                status: "late"
            })
        ])

        res.status(200).send({
            teacher: {
                id: teacher._id,
                userId: teacher.userId
            },

            classes: {
                total: totalClasses,
                assignments
            },

            students: {
                total: totalStudents
            },

            attendance: {
                total: totalAttendance,
                present: presentAttendance,
                absent: absentAttendance,
                late: lateAttendance,
                rate: totalAttendance === 0
                    ? 0
                    : Number(((presentAttendance / totalAttendance) * 100).toFixed(2))
            }
        })
    }

    catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
}


module.exports = {
    getAdminDashboard,
    getTeacherDashboard
}