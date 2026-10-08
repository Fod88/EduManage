const express = require("express")

const {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getMyStudentProfile
} = require("../controllers/studentController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const adminOrTeacherAuth = require("../middleware/adminOrTeacherAuth")

const router = express.Router()


// Student's own profile
router.get("/me", auth, getMyStudentProfile)


// Admin + Teacher
router.get("/", auth, adminOrTeacherAuth, getStudents)
router.get("/:id", auth, adminOrTeacherAuth, getStudentById)


// Admin only
router.post("/", auth, adminAuth, createStudent)
router.patch("/:id", auth, adminAuth, updateStudent)
router.delete("/:id", auth, adminAuth, deleteStudent)


module.exports = router