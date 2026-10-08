
const Subject = require("../models/Subject")
const mongoose = require("mongoose")

// CREATE NEW SUBJECT
const createSubject = async (req , res) => {
    try{
        const allowedFields = ["name" , "code"]

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

        const {name , code} = req.body
        
        if(! name){
            return res.status(400).send({error : "name ,and code are required"})
        }

        if(! code){
            return res.status(400).send({error : "name ,and code are required"})
        }

        const subject = await Subject.findOne({code})
        if(subject){
            return res.status(409).send({error : "Subject have already Existed"})
        }

        const new_subject = await Subject.create({name , code})

        res.status(201).send(new_subject)

    }

    catch(error){
        if (error.code === 11000) {
            return res.status(409).send({
                error: "This value already exists"
            })
        }

        res.status(500).send({error : error.message})
    }
}


// GET ALL SUBJECTS

const getSubjects = async (req , res) => {
    try{
        const {status} = req.query
        if(status){
            const allowedValue = ["active" , "inactive"]
            if(! allowedValue.includes(status)){
                return res.status(400).send({error : "Invalid status value"})
            }
            const subjects = await Subject.find({status})
            return res.status(200).send(subjects)
        }
        const subjects = await Subject.find({})
        res.status(200).send(subjects)
        
    }

    catch (error){
        
        return res.status(500).send({error : error.message})
    }
}

// GET SUBJECT BY ID

const getSubjectById = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Subject Id"})
        }

        const subject = await Subject.findById(_id)

        if(! subject){
            return res.status(404).send({error : "Subject Not Found"}) 
        }

        res.status(200).send(subject)
        
    }

    catch (error){
        
        return res.status(500).send({error : error.message})
    }
}


// UPDATE SUBJECT BY ID

const updateSubject = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Subject Id"})
        }

        const subject = await Subject.findById(_id)

        if(! subject){
            return res.status(404).send({error : "Subject Not Found"}) 
        }

        const allowedFields = ["name" , "code" , "status"]
        const fields = Object.keys(req.body)

        if(fields.length === 0){
            return res.status(400).send({error : "not Exist updates Fields"})
        }

        const isValid = fields.every((field) => {
            return allowedFields.includes(field)
        })

        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const status = req.body.status
        if(status){
            if(! ["active" , "inactive"].includes(status)){
                return res.status(400).send({error : "Invalid status value"})
            }
        }


        const updatedSubject = await Subject.findByIdAndUpdate(_id , req.body , {
            new : true,
            runValidators : true
        })


        res.status(200).send(updatedSubject)
        
    }

    catch (error){
        if (error.code === 11000) {
            return res.status(409).send({
                error: "This value already exists"
            })
        }
        return res.status(500).send({error : error.message})
    }
}

// DELETE SUBJECT BY ID

const deleteSubject = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Subject Id"})
        }

        const subject = await Subject.findByIdAndDelete(_id)

        if(! subject){
            return res.status(404).send({error : "Subject Not Found"}) 
        }

        res.status(200).send(subject)
        
    }

    catch (error){
        
        return res.status(500).send({error : error.message})
    }
}

module.exports = {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject

}