const Course = require("../models/Course")
const errorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");


// @desc getCourses function used to get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler( async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = Course.find({bootcamp : req.params.bootcampId})
    } else {
        query = Course.find().populate({
            path : "bootcamp",
            select : "name description"}
        )
    }

    let courses = await query
    res.status(200).send({
        success : true,
        courses : courses
    })

})


// @desc getCourse function used to get single courses
// @route GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler( async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        "path" : "bootcamp",
        "select" : "name description"
    })

    if (!course) {
        return next(new errorResponse(`course not found for requested id ${req.params.id}`))
    }
    res.status(200).send({
        success : true,
        course : course
    })
})


// @desc createCourse function used t add get all course to bootcamp
// @route POST /api/v1/course
// @route POST /api/v1/:bootcampId/course
// @access Private
exports.createCourse = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new errorResponse(`Bootcamp not found for the id ${req.params.bootcampId}`))
    }
 
    const course = await Course.create(req.body)
    res.status(200).send({
        success : true,
        courses : course
    })

})


// @desc updateCourse function used to update a course details
// @route PUT /api/v1/course
// @route POST /api/v1/course/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!course) {
        return  next(new errorResponse(`Course not found or id ${req.params.id}`, 400))
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
            401
          )
        );
      }
    
    const course = await Course.create(req.body);

    res.status(200).json({
        "success" : true,
        "data" : {}
    })
})

// @desc updateCourse function used to update a course details
// @route PUT /api/v1/course
// @route POST /api/v1/course/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

    res.status(200).json({
        "success" : true,
        "data" : {}
    })
})


// @desc deleteCourse function used to delete existing course
// @route DELETE /api/v1/course/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }


    await course.deleteOne();
    res.status(200).json({
        "success" : true,
        "data" : {}
    })
})
