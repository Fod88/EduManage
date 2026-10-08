const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
    try {
        const authorization = req.header("Authorization")
        // console.log(authorization)

        if (!authorization) {
            return res.status(401).send({error : "Authentication required"})
        }

        const value = authorization.split(" ")

        if (value.length !== 2 || value[0] !== "Bearer" || !value[1]) {
            return res.status(401).send({error : "Invalid Authorization Value"})
        }

        const token = value[1]

        const decode = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        const user = await User.findOne({
            _id: decode._id,
        }).select("-password")

        // console.log(user)

        if (!user) {
            return res.status(401).send({error : "Authentication required"})
        }

        if(user.status === "inactive"){
            return res.status(403).send({error : "User account is inactive"})
        }

        req.user = user
        req.token = token

        next()
    }

    catch (e) {
        if (
            e.name === "JsonWebTokenError" ||
            e.name === "TokenExpiredError" ||
            e.name === "NotBeforeError"
        ) {
            return res.status(401).send({error : "Invalid or expired token"})
        }

        res.status(500).send(e.message)
    }
}

module.exports = auth