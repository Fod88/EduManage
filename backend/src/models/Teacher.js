
const mongoose = require("mongoose")

const teacherSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        unique : true,
        ref : "User"
    },

    phone : {
        type : String,
        trim : true,
    },

    status : {
        type : String,
        enum : ['active' , 'inactive'],
        default : 'active'
    }

} , {timestamps : true})

const Teacher = mongoose.model("Teacher" , teacherSchema)

module.exports = Teacher