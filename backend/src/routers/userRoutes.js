const express = require("express")

const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    login,
    updateMyAccount,
    getMyAccount

} = require("../controllers/userController")

const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")

const router = express.Router()


// LOGIN - PUBLIC

router.post("/login", login)

// UPDATE MY ACCOUNT
router.patch("/me", auth, updateMyAccount)

// GET MY ACCOUNT
router.get("/profile", auth, getMyAccount)

// GET USERS - ADMIN ONLY

router.get("/", auth, adminAuth, getUsers)


// GET USER BY ID - ADMIN ONLY

router.get("/:id", auth, adminAuth, getUserById)


// UPDATE USER BY ID - ADMIN ONLY

router.patch("/:id", auth, adminAuth, updateUser)


// DELETE USER BY ID - ADMIN ONLY

router.delete("/:id", auth, adminAuth, deleteUser)


module.exports = router