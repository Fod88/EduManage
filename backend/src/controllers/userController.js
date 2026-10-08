
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")


// GET ALL USERS
const getUsers = async (req ,res) => {
    try{
        const users = await User.find({}).select("-password")
        res.status(200).send(users)
    }

    catch (error){
        return res.status(500).send({error : error.message})
    }
}


// GET USER BY ID

const getUserById = async (req ,res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid User Id"})
        }
        
        const user = await User.findById(_id).select("-password")

        if(! user){
            return res.status(404).send({error : "User Not Found"})
        }

        res.status(200).send(user)
    }

    catch (error){
        return res.status(500).send({error : error.message})
    }
}

// GET MY ACCOUNT
const getMyAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")

        if (!user) {
            return res.status(404).send({
                error: "User Not Found"
            })
        }

        res.status(200).send(user)
    }
    catch (error) {
        res.status(500).send({
            error: error.message
        })
    }
}

// UPDATE MY ACCOUNT
const updateMyAccount = async (req, res) => {
    try {
        const allowedFields = ["name", "email", "password", "currentPassword"]

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).send({
                error: "Request body is required"
            })
        }

        const fields = Object.keys(req.body)

        const isValid = fields.every((field) => {
            return allowedFields.includes(field)
        })

        if (!isValid) {
            return res.status(400).send({
                error: "Invalid Fields"
            })
        }

        const { name, email, password, currentPassword } = req.body

        if (email && !validator.isEmail(email)) {
            return res.status(400).send({
                error: "Invalid email format"
            })
        }

        if (password && !currentPassword) {
            return res.status(400).send({
                error: "Current password is required"
            })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(404).send({
                error: "User Not Found"
            })
        }

        // Check email uniqueness
        if (email && email !== user.email) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: user._id }
            })

            if (existingUser) {
                return res.status(409).send({
                    error: "This email is already in use"
                })
            }
        }

        // Verify current password before changing password
        if (password) {
            const isValidPassword = await bcrypt.compare(
                currentPassword,
                user.password
            )

            if (!isValidPassword) {
                return res.status(401).send({
                    error: "Current password is incorrect"
                })
            }

            user.password = password
        }

        if (name) {
            user.name = name
        }

        if (email) {
            user.email = email
        }

        await user.save()

        user.password = undefined

        res.status(200).send(user)
    }

    catch (error) {
        if (error.code === 11000) {
            return res.status(409).send({
                error: "This email is already in use"
            })
        }

        return res.status(500).send({
            error: error.message
        })
    }
}

// UPDATE USER BY ID

const updateUser = async (req ,res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid User Id"})
        }

        const allowedFields = ["name" , "email" ,"status" , "role"]

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

        const {name , email , status , role} = req.body

        if(email){
            if(!validator.isEmail(email)){
                return res.status(400).send("Invalid format Email")
            }

            const user = await User.findOne({email , _id :{ $ne : _id}})
            if(user){
                const error = new Error("This email is already in use")
                error.statusCode = 409
                throw error
            }
        }

        if(status){
            const allowedValue = ["active" , "inactive"]
            if(! allowedValue.includes(status)){
                return res.status(400).send({error : "Invalid status value"})
            }
                
        }

        if(role){
            const allowedValue = ["admin" , "teacher" , "student"]
            if(! allowedValue.includes(role)){
                return res.status(400).send({error : "Invalid role value"})
            }
                
        }


        const user = await User.findByIdAndUpdate(_id , req.body , {new : true , runValidators : true}).select("-password")

        if(! user){
            return res.status(404).send({error : "User Not Found"})
        }

        res.status(200).send(user)
    }
    catch (error){
        if(error.statusCode === 409){
            return res.status(409).send({error : error.message})
        }

        if(error.code === 11000){
            return res.status(409).send({error : "This email is already in use"})
        }

        return res.status(500).send({error : error.message})
    }
}

// DELETE USER BY ID 

const deleteUser = async (req , res) => {
    try{
        const _id = req.params.id
        if(! mongoose.isValidObjectId(_id)){
            return res.status(400).send({error : "Invalid User Id"})
        }

        const user = await User.findByIdAndDelete(_id)
        if(! user){
            return res.status(404).send({error : "User Not Found"})
        }


        res.status(200).send({message : "Deleted sucessfully"})

    }

    catch (error){

        res.status(500).send({error : error.message})
    }


}

// TO LOGIN
const login = async (req , res) => {
    try{
        const allowedFields = ["email" , "password"]

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

        const {email , password} = req.body

        if(! email){
            return res.status(400).send({error : "email is required"})
        }

        if(! password){
            return res.status(400).send({error : "password is required"})
        }

        if(! validator.isEmail(email)){
            return res.status(400).send({error : "Invalid email format "})
        }

        const user = await User.findOne({email})

        if(! user){
            return res.status(401).send({error : "Unable to login"})
        }

        if(user.status === "inactive"){
            return res.status(403).send({error : "Unable to login"})
        }

        const isValidPassword = await bcrypt.compare(password , user.password)
        if(! isValidPassword){
            return res.status(401).send({error : "Unable to login"})
        }

        if(!process.env.JWT_SECRET){
            return res.status(500).send({error : "JWT secret is not configured"})
        }
        const token = jwt.sign({_id : user._id.toString() , role : user.role} , process.env.JWT_SECRET)

        user.password = undefined
        return res.status(200).send({user , token})

    }

    catch (error){

        res.status(500).send({error : error.message})
    }
}

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    login,
    updateMyAccount,
    getMyAccount
}