const adminOrTeacherAuth = (req, res, next) => {

    if (
        req.user.role === "admin" ||
        req.user.role === "teacher"
    ) {
        return next()
    }

    res.status(403).send({
        error: "Access denied"
    })
}

module.exports = adminOrTeacherAuth