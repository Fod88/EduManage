const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB connected successfully")
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error.message)
    })
