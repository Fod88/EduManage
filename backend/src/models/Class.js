
const mongoose = require("mongoose")

const classSchema = mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },

    grade : {
        type : String,
        trim : true,
        required : true
    },
    status : {
        type : String,
        enum : ["active" , "inactive"],
        default : "active"
    }
} , {timestamps : true})

classSchema.index(
    {
        name : 1,
        grade : 1
    },

    {
        unique : true
    }
)

const Class = mongoose.model("Class" , classSchema)

module.exports = Class