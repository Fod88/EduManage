const express = require("express")

const {
    createTeacher,
    getTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher,
    getMyTeacherProfile
} = require("../controllers/teacherController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()


// Teacher's own profile
router.get("/me", auth, getMyTeacherProfile)


// Admin only
router.get("/", auth, adminAuth, getTeachers)
router.get("/:id", auth, adminAuth, getTeacherById)

router.post("/", auth, adminAuth, createTeacher)

router.patch("/:id", auth, adminAuth, updateTeacher)

router.delete("/:id", auth, adminAuth, deleteTeacher)


module.exports = router