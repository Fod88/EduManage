
const mongoose = require("mongoose")


const subjectSchema = mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },

    code : {
        type : String,
        trim : true,
        required : true,
        unique : true
    },
    status : {
        type : String,
        enum : ["active" , "inactive"],
        default : "active"
    }
} , {timestamps : true})


const Subject = mongoose.model("Subject" , subjectSchema)

module.exports = Subject