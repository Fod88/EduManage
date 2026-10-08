
const mongoose = require("mongoose")
const TeachingAssignment = require("../models/TeachingAssignment")
const Teacher = require("../models/Teacher")
const Class = require("../models/Class")
const Subject = require("../models/Subject")

// CREATE NEW TEACHING ASSIGNMENT
const createTeachingAssignment = async (req , res) => {
    try{
        const allowedFields = ["teacherId" , "classId" , "subjectId"]

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

        const {teacherId , classId , subjectId} = req.body

        if(! teacherId){
            return res.status(400).send({error : "teacher id is required"})
        }
        if(! mongoose.isValidObjectId(teacherId)){
            return res.status(400).send({error : "Invalid teacher Id"})
        }

        if(! classId){
            return res.status(400).send({error : "class id is required"})
        }
        if(! mongoose.isValidObjectId(classId)){
            return res.status(400).send({error : "Invalid class Id"})
        }

        if(! subjectId){
            return res.status(400).send({error : "subject id is required"})
        }
        if(! mongoose.isValidObjectId(subjectId)){
            return res.status(400).send({error : "Invalid subject Id"})
        }

        const teacher = await Teacher.findById(teacherId)
        if(! teacher){
            return res.status(404).send({error : "Teacher Not Found"})
        }

        const class_ = await Class.findById(classId)
        if(! class_){
            return res.status(404).send({error : "Class Not Found"})
        }

        const subject = await Subject.findById(subjectId)
        if(! subject){
            return res.status(404).send({error : "Subject Not Found"})
        }

        const assignment = await TeachingAssignment.findOne({teacherId , classId , subjectId})
        if(assignment){
            return res.status(409).send({error : "Assignment already exists"})
        }

        const newAssignment = new TeachingAssignment({
            teacherId,
            classId,
            subjectId
        })

        await newAssignment.save()

        await newAssignment.populate([
            {
                path: "teacherId",
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
            }
        ])

        return res.status(201).send(newAssignment)

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


//  GET ALL TEACHING ASSIGNMENTS

const getTeachingAssignments = async (req , res) => {
    try{
        const assignments = await TeachingAssignment.find({}).populate(
            {
                path : "teacherId",
                populate : {
                    path : "userId",
                    select : "-password"
                }
            }
        )
        .populate("classId")
        .populate("subjectId")

        res.status(200).send(assignments)
    }

    catch (error){
        
        res.status(500).send({error : error.message})
    }
}


// GET TEACHING ASSIGNMENT BY ID

const getTeachingAssignmentById = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Teaching Assignment Id"})
        }

        const assignment = await TeachingAssignment.findById(_id).populate(
            {
                path : "teacherId",
                populate : {
                    path : "userId",
                    select : "-password"
                }
            }
        )
        .populate("classId")
        .populate("subjectId")

        if(! assignment){
            return res.status(404).send({error : "Assignment Not Found"})
        }

        res.status(200).send(assignment)

    }

    catch (error){

        res.status(500).send({error : error.message})
    }

}

// UPDATE TEACHING ASSIGNMENT BY ID

const updateTeachingAssignment = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Teaching Assignment Id"})
        }

        const allowedFields = ["teacherId" , "classId" , "subjectId", "status"]

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

        const {teacherId , classId , subjectId , status} = req.body
        
        if(teacherId){
            if(! mongoose.isValidObjectId(teacherId)){
                return res.status(400).send({error : "Invalid teacher Id"})
            }

            const teacher = await Teacher.findById(teacherId)
            if(! teacher){
                return res.status(404).send({error : "Teacher Not Found"})
            }
        }

        if(classId){
            if(! mongoose.isValidObjectId(classId)){
                return res.status(400).send({error : "Invalid class Id"})
            }

            const class_ = await Class.findById(classId)
            if(! class_){
                return res.status(404).send({error : "Class Not Found"})
            }
        }

        if(subjectId){
            if(! mongoose.isValidObjectId(subjectId)){
                return res.status(400).send({error : "Invalid subject Id"})
            }

            const subject = await Subject.findById(subjectId)
            if(! subject){
                return res.status(404).send({error : "Subject Not Found"})
            }

        }

        if(status){
            const allowedValue = ["active" , "inactive"]
            if(! allowedValue.includes(status)){
                return res.status(400).send({error : "Invalid status value"})
            }
                
        }



        const assignment = await TeachingAssignment.findByIdAndUpdate(_id , req.body , {new : true , runValidators : true}).populate(
            {
                path : "teacherId",
                populate : {
                    path : "userId",
                    select : "-password"
                }
            }
        )
        .populate("classId")
        .populate("subjectId")


        if(! assignment){
            return res.status(404).send({error : "Teaching Assignment Not Found"})
        }

        res.status(200).send(assignment)

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

const deleteTeachingAssignment = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Teaching Assignment Id"})
        }

        const assignment = await TeachingAssignment.findByIdAndDelete(_id)
        if(! assignment){
            return res.status(404).send({error : "Teaching Assignment Not Found"})
        }


        res.status(200).send({message : "Deleted sucessfully"})

    }

    catch (error){

        res.status(500).send({error : error.message})
    }


}

module.exports = {
    createTeachingAssignment,
    getTeachingAssignments,
    getTeachingAssignmentById,
    updateTeachingAssignment,
    deleteTeachingAssignment
}