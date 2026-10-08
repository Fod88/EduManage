const adminAuth =  (req , res , next) => {
    if(req.user.role === "admin"){
        return next() 
    }

    res.status(403).send({error : "Access denied"})
}

module.exports = adminAuth