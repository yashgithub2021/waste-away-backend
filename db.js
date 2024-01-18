require('dotenv').config();
const mongoose = require('mongoose')
const db = process.env.DATABASE_URL
const url = 'mongodb://localhost:27017/Waste_Away'
const connectMongo = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected To MongoDB")
    } catch (error) {
        console.log("Error Connecting to MongoDB: ", error)
    }
}

module.exports = connectMongo