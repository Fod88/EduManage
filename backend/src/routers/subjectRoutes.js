const express = require("express")

const {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const adminOrTeacherAuth = require("../middleware/adminOrTeacherAuth")


const router = express.Router()


// CREATE SUBJECT - ADMIN ONLY

router.post("/", auth, adminAuth, createSubject)


// GET ALL SUBJECTS - ADMIN + TEACHER

router.get("/", auth , getSubjects)


// GET SUBJECT BY ID - ADMIN + TEACHER

router.get("/:id", auth, adminOrTeacherAuth , getSubjectById)


// UPDATE SUBJECT BY ID - ADMIN ONLY

router.patch("/:id", auth, adminAuth, updateSubject)


// DELETE SUBJECT BY ID - ADMIN ONLY

router.delete("/:id", auth, adminAuth, deleteSubject)


module.exports = router