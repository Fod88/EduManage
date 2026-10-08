
const mongoose = require("mongoose")

const attendanceSchema = mongoose.Schema({
    studentId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Student"
    },

    classId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Class"
    },

    subjectId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Subject"        
    },

    date : {
        type : Date,
        required : true
    },

    status : {
        type : String,
        enum : ["present" , "absent" , "late"],
        required : true
    },

    recordedBy : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Teacher"
    }

} , {timestamps : true})

attendanceSchema.index(
    {
        studentId : 1,
        subjectId : 1,
        classId : 1,
        date : 1
    },

    {
        unique : true
    }
)

attendanceSchema.index(
    {
        subjectId : 1,
        classId : 1,
        date : 1
    }
)

const Attendance = mongoose.model("Attendance" , attendanceSchema)

module.exports = Attendance