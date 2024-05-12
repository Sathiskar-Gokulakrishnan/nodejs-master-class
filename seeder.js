const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Bootcamp = require("./models/Bootcamp")
const Course = require("./models/Course")
const User = require("./models/User")
const colors = require("colors")
const Review = require("./models/Review")

dotenv.config({ path : "./config/config.env"})

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI,{
    });

    console.log("Mongo DB connected successfully", conn.connection.host)
}

connectDB();


const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
)

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
)

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
)


const importData = async () => {

    try {
        await Bootcamp.create(bootcamps)
        await Course.create(courses)
        await User.create(users)
        await Review.create(reviews)
        console.log(`imported successfully...`.green.inverse)
        process.exit(1)
    } catch (error) {
        console.log(`error while import data...`.red.inverse, error)
    }

}

const deleteData = async () => {
    try {
        await Bootcamp.deleteMany()
        await Course.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log(`deleted successfully...`.green.inverse)
        process.exit(1)
    } catch (error) {
        console.log(`error while delete data...`.red.inverse)
    }
}

if (process.argv[2] == "-i") {
    importData()
} else if(process.argv[2] == "-d") {
    deleteData()
}