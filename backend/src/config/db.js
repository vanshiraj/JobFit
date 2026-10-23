const mongoose = require('mongoose');

async function connectDB(retries = 5, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected to MongoDB successfully");
            return;
        } catch (error) {
            console.error(`MongoDB connection error (attempt ${attempt}/${retries}):`, error.message);
            if (attempt === retries) {
                console.error("All MongoDB connection attempts exhausted.");
            } else {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }
}

module.exports = connectDB;