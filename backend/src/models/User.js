
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


const userSchema = mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },

    email : {
        type : String,
        lowercase : true,
        trim : true,
        unique : true,
        required : true 
    },

    password : {
        type : String,
        minlength : 8,
        required : true

    },

    role : {
        type : String,
        enum : ["admin" , "teacher" , "student"],
        default : "student"
    },

    status : {
        type : String,
        enum : ["active" , "inactive"],
        default : "active"
    }

} , {timestamps : true})


userSchema.pre("save" , async function(){
    if(this.isModified("password")){
        const hashedPassword = await bcrypt.hash(this.password , 10)
        this.password = hashedPassword
    }
})

const User = mongoose.model("User" , userSchema)

module.exports = User