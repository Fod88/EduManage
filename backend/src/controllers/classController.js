
const { default: mongoose } = require("mongoose")
const Class = require("../models/Class")


// CREATE NEW CLASS
const createClass = async (req , res) => {
    try{
        const allowedFields = ["name" , "grade"]
        const fields = Object.keys(req.body)

        const isValid = fields.every((field) => {
            return allowedFields.includes(field)
        })

        if(! isValid){
            return res.status(400).send({error : "Invalid Fields"})
        }

        const {name , grade} = req.body
        
        if(! name){
            return res.status(400).send({error : "name ,and grade are required"})
        }

        if(! grade){
            return res.status(400).send({error : "name ,and grade are required"})
        }

        const class_ = await Class.findOne({name , grade})
        if(class_){
            return res.status(409).send({error : "Class have already Existed"})
        }

        const new_class = await Class.create({name , grade})

        res.status(201).send(new_class)

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


// GET ALL CALSSES

const getClasses = async (req , res) => {
    try{
        
        const classes = await Class.find({})
        res.status(200).send(classes)
        
    }

    catch (error){
        
        return res.status(500).send({error : error.message})
    }
}


// GET ALL CALSS BY ID

const getClassById = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Class Id"})
        }

        const class_ = await Class.findById(_id)

        if(! class_){
            return res.status(404).send({error : "Class Not Found"}) 
        }

        res.status(200).send(class_)
        
    }

    catch (error){
        
        return res.status(500).send({error : error.message})
    }
}


// UPDATE CALSS BY ID

const updateClass = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Class Id"})
        }

        const class_ = await Class.findById(_id)

        if(! class_){
            return res.status(404).send({error : "Class Not Found"}) 
        }

        const allowedFields = ["name" , "grade"]
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


        const updatedClass = await Class.findByIdAndUpdate(_id , req.body , {
            new : true,
            runValidators : true
        })


        res.status(200).send(updatedClass)
        
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


// DELETE CALSS BY ID

const deleteClass = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid Class Id"})
        }

        const class_ = await Class.findByIdAndDelete(_id)

        if(! class_){
            return res.status(404).send({error : "Class Not Found"}) 
        }

        res.status(200).send(class_)
        
    }

    catch (error){
        
        return res.status(500).send({error : error.message})
    }
}


module.exports = {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass
}


