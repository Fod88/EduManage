
const mongoose = require("mongoose")
const validator = require("validator")
const Student = require("../models/Student")
const User = require("../models/User")
const Class = require("../models/Class")
const Attendance = require("../models/Attendance")


// CREATE NEW STUDENT

const createStudent = async (req ,res) => {
    let session;
    try{
        const allowedFields = ["studentId","name" , "email" , "password" , "phone" , "parentPhone" , "birthDate", "address" , "classId"]

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

        const {studentId , name , email , password , phone , parentPhone , birthDate , address , classId} = req.body
        
        if (
            typeof studentId !== "string" ||
            studentId.trim() === ""
        ) {
            return res.status(400).send({
                error: "Student Id is required"
            })
        }

        if(! name){
            return res.status(400).send({error : "name is required"})
        }

        if(! email){
            return res.status(400).send({error : "email is required"})
        }

        if(! validator.isEmail(email)){
            return res.status(400).send({error : "Invalid email address"})
        }

        if(! password){
            return res.status(400).send({error : "password is required"})
        }

        if(! classId){
            return res.status(400).send({error : "Class Id is required"})
        }
        if(! mongoose.isValidObjectId(classId)){
            return res.status(400).send({error : "Invalid Class Id"})
        }

        const class_ = await Class.findById(classId)
        if(! class_){
            return res.status(404).send({error : "Class Not Found"})
        }


        const user = await User.findOne({email})
        if(user){
            return res.status(409).send({error : "The email address has already been used"})
        }

        session = await mongoose.startSession()

        let studentData;

        await session.withTransaction(async () => {
            const new_user = new User({name , email , password , role : "student"})
            await new_user.save({session})

            const new_student = new Student({studentId ,userId : new_user._id , phone , parentPhone , birthDate , address , classId})
            await new_student.save({session})

            studentData = new_student

        })

        
        await studentData.populate("userId" , "-password")
        res.status(201).send(studentData)

    }

    catch(error){
        if(error.code === 11000){
            return res.status(409).send(
                {
                    error : "This value already exists"
                }
            )
        }
        res.status(500).send({error : error.message})
    }
    finally {
        if (session) {
            await session.endSession()
        }
    }
}


// GET ALL STUDENTS
// SEARCH + FILTER

const getStudents = async (req, res) => {
    try {

        const { search, status, classId } = req.query

        const filter = {}

        // Filter by status
        if (status) {
            const allowedStatus = ["active", "inactive"]

            if (!allowedStatus.includes(status)) {
                return res.status(400).send({
                    error: "Invalid status value"
                })
            }

            filter.status = status
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


        // Search
        if (search) {

            const searchRegex = new RegExp(search, "i")

            const users = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex }
                ]
            }).select("_id")

            const userIds = users.map(user => user._id)

            filter.$or = [
                { studentId: searchRegex },
                { userId: { $in: userIds } }
            ]
        }


        const students = await Student.find(filter)
            .populate("userId", "-password")
            .populate("classId")

        res.status(200).send(students)
    }

    catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
}

// GET STUDENT BY ID 

const getStudentById = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Student Id"})
        }

        const student = await Student.findById(_id).populate("userId" , "-password").populate("classId")
        if(! student){
            return res.status(404).send({error : "Student Not Found"})
        }

        res.status(200).send(student)

    }

    catch (error){

        res.status(500).send({error : error.message})
    }

}

// GET STUDENT PROFILE
const getMyStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({
            userId: req.user._id
        })
        .populate({
            path: "userId",
            select: "-password"
        })
        .populate("classId")

        if (!student) {
            return res.status(404).send({
                error: "Student profile not found"
            })
        }

        res.status(200).send(student)
    }

    catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
}

// UPDATE STUDENT BY ID

const updateStudent = async (req , res) => {

    let session;
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Student Id"})
        }


        const allowedUpdates = [
            "phone",
            "parentPhone",
            "birthDate",
            "address",
            "classId",
            "status"
        ]

        if(!req.body || Object.keys(req.body).length === 0){
            return res.status(400).send({
                error: "Request body is required"
            })            
        }

        const fields = Object.keys(req.body)

        const isValid  = fields.every((field) => {
            return allowedUpdates.includes(field)
        })

        if(! isValid){
            return res.status(400).send({error : "Invalid updated Fields"})
        }

        const status = req.body.status
            
        if(status){
            const allowedValue = ["active" , "inactive"]
            if(! allowedValue.includes(status)){
                return res.status(400).send({error : "Invalid status value"})
            }
                
        }

        if (req.body.classId) {
            if (!mongoose.isValidObjectId(req.body.classId)) {
                return res.status(400).send({ error: "Invalid Class Id" })
            }

            const classExists = await Class.findById(req.body.classId)

            if (!classExists) {
                return res.status(404).send({ error: "Class Not Found" })
            }
        }

        session = await mongoose.startSession()

        let updatedStudent;
        await session.withTransaction(async ()=> {

            const student = await Student.findById(_id).session(session)

            if(! student){
                const error = new Error("Student Not Found")
                error.statusCode = 404
                throw error                
            }

            
            fields.forEach((field) => {
                student [field] = req.body [field]
            })

            await student.save({session})

            await student.populate("userId" , "-password")
            await student.populate("classId")

            updatedStudent = student
            
        })

        res.status(200).send(updatedStudent)

    }

    catch(error){
        if(error.code === 11000){
            return res.status(409).send(
                {
                    error : "This value already exists"
                }
            )
        }

        if(error.statusCode === 404){
            return res.status(404).send({error : error.message})
        }

        res.status(500).send({error : error.message})
    }
    finally {
        if (session) {
            await session.endSession()
        }
    }
}

// DELETE STUDENT BY ID 

const deleteStudent = async (req , res) => {
    let session
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Student Id"})
        }


        session = await mongoose.startSession()

            await session.withTransaction(async () => {
            const student = await Student.findById(_id ).session(session)
            if(! student){
                const error = new Error("Student Not Found")
                error.statusCode = 404
                throw error     
            }

            const attendance = await Attendance.findOne({studentId : student._id}).session(session);
            if(attendance){
                const error = new Error("The Student has records at Attendance")
                error.statusCode = 409
                throw error
                
            }

            const user = await User.findByIdAndDelete(student.userId , {session})
            
            if(! user){
                const error = new Error("User not found")
                error.statusCode = 404
                throw error
            }

            await student.deleteOne({session})

        })

        

        res.status(200).send({message : "Deleted sucessfully"})

    }

    catch (error){

        if(error.statusCode === 409){
            return res.status(409).send({error : error.message})
        }

        if(error.statusCode === 404){
            return res.status(404).send({error : error.message})
        }
        res.status(500).send({error : error.message})
    }
    finally {
        if (session) {
            await session.endSession()
        }
    }

}

module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyStudentProfile
}