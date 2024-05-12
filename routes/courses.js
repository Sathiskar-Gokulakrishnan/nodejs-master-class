const express = require("express")

const router = express.Router({mergeParams : true})


const {getCourses, getCourse, createCourse, updateCourse, deleteCourse} = require("../controllers/courses")
const { protect } = require("../middleware/auth")

router.route("/")
    .get(getCourses).post(protect, createCourse)

router.route("/:id")
    .get(getCourse).put(protect, updateCourse).delete(protect, deleteCourse)

module.exports = router