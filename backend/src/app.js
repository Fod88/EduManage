const express = require('express');
const cors = require('cors');
require('dotenv').config();
require("./config/db")
const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://edu-manage-p2vp-tawny.vercel.app"
    ]
}))
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'EduManage API is running',
  });
});

// Class Router
const classRouter = require("./routers/classRoutes")
app.use('/classes' , classRouter)

// Subject Router
const subjectRouter = require("./routers/subjectRoutes")
app.use('/subjects' , subjectRouter)

// Teacher Router
const teacherRouter = require("./routers/teacherRoutes")
app.use('/teachers' , teacherRouter)

// Student Router
const studentRouter = require("./routers/studentRoutes")
app.use('/students' , studentRouter)

// Attendance Router
const attendanceRouter = require("./routers/attendanceRoutes")
app.use('/attendance' , attendanceRouter)

// User Router
const userRouter = require("./routers/userRoutes")
app.use('/users' , userRouter)

// Teaching Assignment Router
const teachingAssignmentRouter = require("./routers/teachingAssignmentRoutes")
app.use('/teachingAssignments' , teachingAssignmentRouter)

// ADMINE DASHBOARD 
const dashboardRouter = require("./routers/dashboardRoutes")
app.use("/dashboard", dashboardRouter)

const PORT = process.env.PORT || 3000;

module.exports = app
