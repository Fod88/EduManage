const express = require("express")

const {
    createClass,
    getClasses,
    getClassById,
    updateClass,
    deleteClass
} = require("../controllers/classController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const adminOrTeacherAuth = require("../middleware/adminOrTeacherAuth")
const router = express.Router()


// CREATE CLASS - ADMIN ONLY

router.post("/", auth, adminAuth, createClass)


// GET CLASSES - ADMIN + TEACHER

router.get("/", auth , getClasses)


// GET CLASS BY ID - ADMIN + TEACHER

router.get("/:id", auth, adminOrTeacherAuth , getClassById)


// UPDATE CLASS BY ID - ADMIN ONLY

router.patch("/:id", auth, adminAuth, updateClass)


// DELETE CLASS BY ID - ADMIN ONLY

router.delete("/:id", auth, adminAuth, deleteClass)


module.exports = router