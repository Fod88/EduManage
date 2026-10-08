
const mongoose = require("mongoose")
const Attendance = require("../models/Attendance")
const Student = require("../models/Student")
const Class = require("../models/Class")
const Subject = require("../models/Subject")
const Teacher = require("../models/Teacher")
const TeachingAssignment = require("../models/TeachingAssignment")

function getEgyptDayStart() {
    const now = new Date()

    const egyptDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now)

    return new Date(`${egyptDate}T00:00:00+03:00`)
}

// CRETE NEW ATTENDANCE 

const createAttendance = async (req ,res) => {
    try{
        const allowedFields = ["studentId", "classId", "subjectId" , "status"]

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({
                error: "Request body is required"
            })
        }
        const fields = Object.keys(req.body)

        const isValid = fields.every((field) => {
            return allowedFields.includes(field)
        })

        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const {studentId , classId , subjectId , status} = req.body

        if(! studentId){
            return res.status(400).send({error : "Student Id is required"})
        }

        if(! classId){
            return res.status(400).send({error : "Class Id is required"})
        }

        if(! subjectId){
            return res.status(400).send({error : "Subject Id is required"})
        }

        if(! status){
            return res.status(400).send({error : "Status is required"})
        }
        
        // verify Student Id

        if(! mongoose.isValidObjectId(studentId)){
            return res.status(400).send({error : "Invalid Student Id"})
        }

        const student = await Student.findById(studentId)
        if(! student){
            return res.status(404).send({error : "Student Not Found"}) 
        }
        
        // verify Class Id

        if(! mongoose.isValidObjectId(classId)){
            return res.status(400).send({error : "Invalid Class Id"})
        }

        const class_ = await Class.findById(classId)
        if(! class_){
            return res.status(404).send({error : "Class Not Found"}) 
        }

        // verify Subject Id

        if(! mongoose.isValidObjectId(subjectId)){
            return res.status(400).send({error : "Invalid Subject Id"})
        }

        const subject = await Subject.findById(subjectId)
        if(! subject){
            return res.status(404).send({error : "Subject Not Found"}) 
        }

        if(student.classId.toString() !== classId){
            return res.status(400).send({error : "The student does not belong to this class"})
        }

        const teacher = await Teacher.findOne({ userId: req.user._id })

        if(!teacher){
            return res.status(403).send({error : "Teacher profile not found"})
        }

        const record = await TeachingAssignment.findOne({
            teacherId: teacher._id,
            classId,
            subjectId,
            status: "active"
        })

        if(!record){
            return res.status(403).send({
                error : "You are not assigned to this class and subject"
            })
        }


        const allowedStatus = ["present" , "absent" , "late"]
        if(! allowedStatus.includes(status)){
            return res.status(400).send({error : "Invalid Status Value"})
        }
        const date = getEgyptDayStart()

        const existingAttendance = await Attendance.findOne({studentId , classId , subjectId , date})
        if(existingAttendance){
            return res.status(409).send({
                error: "Attendance already exists for this student, subject, class and date"
            })
        }

        const attendance = new Attendance({
            studentId,
            classId,
            subjectId,
            date,
            status,
            recordedBy: teacher._id
        })

        await attendance.save()

        await attendance.populate([
            {
                path: "studentId",
                populate: {
                    path: "userId",
                    select: "-password"
                }
            },
            {
                path: "classId"
            },
            {
                path: "subjectId"
            },
            {
                path: "recordedBy",
                populate: {
                    path: "userId",
                    select: "-password"
                }
            }
        ])

        res.status(201).send(attendance)


    }
    catch (error){

        if(error.code === 11000){
            return res.status(409).send(
                {
                    error : "This value already exists"
                }
            )
        }

        res.status(500).send({error : error.message})
    }
}

// GET ALL ATTENDANCES + SEARCH & FILTER

const getAttendances = async (req, res) => {
    try {
        const { date, status, classId, subjectId, studentId } = req.query

        const filter = {}

        // Filter by status
        if (status) {
            const allowedStatus = ["present", "absent", "late"]

            if (!allowedStatus.includes(status)) {
                return res.status(400).send({
                    error: "Invalid status value"
                })
            }

            filter.status = status
        }

        // Filter by date
        if (date) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).send({
                    error: "Invalid date format. Use YYYY-MM-DD"
                })
            }

            const startDate = new Date(`${date}T00:00:00+03:00`)
            const endDate = new Date(`${date}T23:59:59.999+03:00`)

            filter.date = {
                $gte: startDate,
                $lte: endDate
            }
        }

        // Filter by class
        if (classId) {
            if (!mongoose.isValidObjectId(classId)) {
                return res.status(400).send({
                    error: "Invalid Class Id"
                })
            }

            const classExists = await Class.findById(classId)

            if (!classExists) {
                return res.status(404).send({
                    error: "Class Not Found"
                })
            }

            filter.classId = classId
        }

        // Filter by subject
        if (subjectId) {
            if (!mongoose.isValidObjectId(subjectId)) {
                return res.status(400).send({
                    error: "Invalid Subject Id"
                })
            }

            const subjectExists = await Subject.findById(subjectId)

            if (!subjectExists) {
                return res.status(404).send({
                    error: "Subject Not Found"
                })
            }

            filter.subjectId = subjectId
        }

        // Filter by student
        if (studentId) {
            if (!mongoose.isValidObjectId(studentId)) {
                return res.status(400).send({
                    error: "Invalid Student Id"
                })
            }

            const studentExists = await Student.findById(studentId)

            if (!studentExists) {
                return res.status(404).send({
                    error: "Student Not Found"
                })
            }

            filter.studentId = studentId
        }

        const attendances = await Attendance.find(filter)
            .populate({
                path: "studentId",
                populate: {
                    path: "userId",
                    select: "-password"
                }
            })
            .populate("classId")
            .populate("subjectId")
            .populate({
                path: "recordedBy",
                populate: {
                    path: "userId",
                    select: "-password"
                }
            })

        res.status(200).send(attendances)
    }

    catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
}

// GET ATTENDANCE BY ID 

const getAttendanceById = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Attendance Id"})
        }

        const attendance = await Attendance.findById(_id).populate({
            path: "studentId",
            populate: {
                path: "userId",
                select: "-password"
            }
        })
        .populate("classId")
        .populate("subjectId")
                .populate({
            path: "recordedBy",
            populate: {
                path: "userId",
                select: "-password"
            }
        })

        if(! attendance){
            return res.status(404).send({error : "Attendance Not Found"})
        }

        res.status(200).send(attendance)

    }

    catch (error){

        res.status(500).send({error : error.message})
    }

}


// UPDATE ATTENDANCE BY ID

const updateAttendance = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Attendance Id"})
        }

        const allowedFields = ["status"]

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({
                error: "Request body is required"
            })
        }
        const fields = Object.keys(req.body)

        const isValid = fields.every((field) => {
            return allowedFields.includes(field)
        })

        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const status = req.body.status
        const allowedStatus = ["present" , "absent" , "late"]
        if(! allowedStatus.includes(status)){
            return res.status(400).send({error : "Invalid Status Value"})
        }

        const attendance = await Attendance.findById(_id)

        if(!attendance){
            return res.status(404).send({error : "Attendance Not Found"})
        }

        if(req.user.role !== "admin"){

            const teacher = await Teacher.findOne({
                userId: req.user._id
            })

            if(!teacher){
                return res.status(403).send({
                    error : "Teacher profile not found"
                })
            }

            const record = await TeachingAssignment.findOne({
                teacherId: teacher._id,
                classId: attendance.classId,
                subjectId: attendance.subjectId,
                status: "active"
            })

            if(!record){
                return res.status(403).send({
                    error : "You are not assigned to this class and subject"
                })
            }
        }

        attendance.status = req.body.status
        await attendance.save()

        await attendance.populate([
            {
                path: "studentId",
                populate: {
                    path: "userId",
                    select: "-password"
                }
            },
            {
                path: "classId"
            },
            {
                path: "subjectId"
            },
            {
                path: "recordedBy",
                populate: {
                    path: "userId",
                    select: "-password"
                }
            }
        ])

        res.status(200).send(attendance)

    }

    catch (error){

        res.status(500).send({error : error.message})
    }

} 


// DELETE ATTENDANCE BY ID 

const deleteAttendance = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Attendance Id"})
        }

        const attendance = await Attendance.findById(_id)

        if(!attendance){
            return res.status(404).send({error : "Attendance Not Found"})
        }

        if(req.user.role !== "admin"){

            const teacher = await Teacher.findOne({
                userId: req.user._id
            })

            if(!teacher){
                return res.status(403).send({
                    error : "Teacher profile not found"
                })
            }

            const record = await TeachingAssignment.findOne({
                teacherId: teacher._id,
                classId: attendance.classId,
                subjectId: attendance.subjectId,
                status: "active"
            })

            if(!record){
                return res.status(403).send({
                    error : "You are not assigned to this class and subject"
                })
            }
        }
        
        await attendance.deleteOne()
        res.status(200).send({message : "Deleted successfully"})

    }

    catch (error){

        res.status(500).send({error : error.message})
    }


}


module.exports = {
    createAttendance,
    getAttendances,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
}