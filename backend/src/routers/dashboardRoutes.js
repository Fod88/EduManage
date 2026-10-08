const express = require("express")

const {
    getAdminDashboard,
    getTeacherDashboard
} = require("../controllers/dashboardController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()


router.get("/admin", auth, adminAuth, getAdminDashboard)

router.get("/teacher", auth, getTeacherDashboard)

module.exports = router