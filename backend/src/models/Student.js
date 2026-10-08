
const mongoose = require("mongoose")

const studentSchema = mongoose.Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        unique : true,
        ref : "User"
    },

    studentId : {
        type : String,
        required : true,
        unique : true,
    },

    phone : {
        type : String,
        trim : true,
    },

    parentPhone : {
        type : String,
        trim : true,
    },

    birthDate : {
        type : String,
    },

    address : {
        type : String
    },

    classId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Class"
    },

    status : {
        type : String,
        enum : ['active' , 'inactive'],
        default : 'active'
    }

} , {timestamps : true})

const Student = mongoose.model("Student" , studentSchema)

module.exports = Student