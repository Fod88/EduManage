const express = require("express")

const {
    createTeachingAssignment,
    getTeachingAssignments,
    getTeachingAssignmentById,
    updateTeachingAssignment,
    deleteTeachingAssignment
} = require("../controllers/teachingAssignmentController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()


// CREATE TEACHING ASSIGNMENT - ADMIN ONLY

router.post("/", auth, adminAuth, createTeachingAssignment)


// GET TEACHING ASSIGNMENTS - ADMIN + TEACHER

router.get("/", auth, getTeachingAssignments)


// GET TEACHING ASSIGNMENT BY ID - ADMIN + TEACHER

router.get("/:id", auth, getTeachingAssignmentById)


// UPDATE TEACHING ASSIGNMENT BY ID - ADMIN ONLY

router.patch("/:id", auth, adminAuth, updateTeachingAssignment)


// DELETE TEACHING ASSIGNMENT BY ID - ADMIN ONLY

router.delete("/:id", auth, adminAuth, deleteTeachingAssignment)


module.exports = router