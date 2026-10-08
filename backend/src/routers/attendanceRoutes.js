const express = require("express")

const {
    createAttendance,
    getAttendances,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
} = require("../controllers/attendanceController")

const auth = require("../middleware/auth")

const router = express.Router()


// CREATE ATTENDANCE - TEACHER

router.post("/", auth, createAttendance)


// GET ATTENDANCES - ADMIN + TEACHER

router.get("/", auth, getAttendances)


// GET ATTENDANCE BY ID - ADMIN + TEACHER

router.get("/:id", auth, getAttendanceById)


// UPDATE ATTENDANCE - ADMIN + TEACHER

router.patch("/:id", auth, updateAttendance)


// DELETE ATTENDANCE - ADMIN + TEACHER

router.delete("/:id", auth, deleteAttendance)


module.exports = router