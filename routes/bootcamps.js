const express = require("express")
const courseRouter = require("./courses")
const reviewRouter = require('./reviews');
const router = express.Router()


const {getAllBootcamp, getSingleBootcamp, updateBootcamp, createBootcamp, deleteBootcamp, bootcampPhotoUpload} = require("../controllers/bootcamps")

const { protect, authorize } = require("../middleware/auth")
router.use("/:bootcampId/courses", courseRouter)
router.use('/:bootcampId/reviews', reviewRouter);

router.route("/")
    .get(getAllBootcamp)
    .post(protect, authorize("admin", "publisher"), createBootcamp)


router.route("/:id")
    .get(getSingleBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, deleteBootcamp)

router.route("/:id/photo")
    .put(protect, bootcampPhotoUpload)

module.exports = router