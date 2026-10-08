
const User = require("../models/User")
const Teacher = require("../models/Teacher")
const TeachingAssignment = require("../models/TeachingAssignment")
const mongoose = require("mongoose")
const validator = require("validator")



// CREATE NEW TEACHER

const createTeacher = async (req ,res) => {
    let session;
    try{
        const allowedFields = ["name" , "email" , "password" , "phone"]

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

        const {name , email , password , phone} = req.body
        
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

        const user = await User.findOne({email})
        if(user){
            return res.status(409).send({error : "The email address has already been used"})
        }

        session = await mongoose.startSession()

        let teacherData;

        await session.withTransaction(async () => {
            const new_user = new User({name , email , password , role : "teacher"})
            await new_user.save({session})

            const new_teacher = new Teacher({userId : new_user._id , phone})
            await new_teacher.save({session})

            teacherData = new_teacher

        })

        
        await teacherData.populate("userId" , "-password")
        res.status(201).send(teacherData)

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


// GET ALL TEACHERS

const getTeachers = async (req , res) => {
    try{
        const teachers = await Teacher.find({}).populate("userId" , "-password")
        res.status(200).send(teachers)
    }

    catch (error){
        
        res.status(500).send({error : error.message})
    }
}


// GET TEACHER BY ID 

const getTeacherById = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Teacher Id"})
        }

        const teacher = await Teacher.findById(_id).populate("userId" , "-password")
        if(! teacher){
            return res.status(404).send({error : "Teacher Not Found"})
        }

        res.status(200).send(teacher)

    }

    catch (error){

        res.status(500).send({error : error.message})
    }

}

// GET TEACHER PROFILE
const getMyTeacherProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({
            userId: req.user._id
        })
        .populate({
            path: "userId",
            select: "-password"
        })

        if (!teacher) {
            return res.status(404).send({
                error: "Teacher profile not found"
            })
        }

        res.status(200).send(teacher)
    }

    catch (error) {
        return res.status(500).send({
            error: error.message
        })
    }
}

// UPDATE STUDENT BY ID

const updateTeacher = async (req , res) => {

    let session;
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Teacher Id"})
        }


        const allowedUpdates = ["status" , "phone"]
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

        session = await mongoose.startSession()

        let updatedTeacher;
        await session.withTransaction(async ()=> {

            const teacher = await Teacher.findById(_id).session(session)

            if(! teacher){
                const error = new Error("Teacher Not Found")
                error.statusCode = 404
                throw error                
            }

            if(status){
                const userUpdated = await User.findById(teacher.userId).session(session)
                if(! userUpdated){
                    const error = new Error("User Not Found")
                    error.statusCode = 404
                    throw error
                }
                userUpdated.status = status

                await userUpdated.save({session})
            }
            
            fields.forEach((field) => {
                teacher [field] = req.body [field]
            })

            await teacher.save({session})

            await teacher.populate("userId" , "-password")

            updatedTeacher = teacher
            
        })

        res.status(200).send(updatedTeacher)

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

// DELETE TEACHER BY ID 

const deleteTeacher = async (req , res) => {
    let session
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Teacher Id"})
        }


        session = await mongoose.startSession()

            await session.withTransaction(async () => {
            const teacher = await Teacher.findById(_id ).session(session)
            if(! teacher){
                const error = new Error("Teacher Not Found")
                error.statusCode = 404
                throw error     
            }

            const teacherAssign = await TeachingAssignment.findOne({teacherId : teacher._id}).session(session);
            if(teacherAssign){
                const error = new Error("The teacher has teaching commitments")
                error.statusCode = 409
                throw error
                
            }

            const user = await User.findByIdAndDelete(teacher.userId , {session})
            
            if(! user){
                const error = new Error("User not found")
                error.statusCode = 404
                throw error
            }

            await teacher.deleteOne({session})

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
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacherProfile
}