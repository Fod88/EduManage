
const mongoose = require("mongoose")

const teachingAssignmentsSchema = mongoose.Schema({
    teacherId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "Teacher"
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

    status : {
        type : String,
        enum : ['active' , 'inactive'],
        default : 'active'
    }

} , {timestamps : true})


teachingAssignmentsSchema.index(
    {
        teacherId : 1,
        subjectId : 1,
        classId : 1
    },

    {
        unique : true
    }
)

const TeachingAssignment = mongoose.model("TeachingAssignment" , teachingAssignmentsSchema)

module.exports = TeachingAssignment