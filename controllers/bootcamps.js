const Bootcamp = require("../models/Bootcamp")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/async")
const path = require('path');

// @desc getAllBootcamps function used to get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getAllBootcamp = asyncHandler (async (req, res, next) => {

    let query;

    //copy request query
    const reqQuery = {...req.query}

    const removeFields = ["select", "sort","limit","page"]
    removeFields.forEach(param => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)

    queryStr = queryStr.replace(/\b(lt|lte|in|gt|gte)\b/g, match => `$${match}`)

    query = Bootcamp.find(JSON.parse(queryStr))

    if (req.query.select) {
        const feilds = req.query.select.split(",").join(" ")
        console.log("Feilds => ", feilds)
        query = query.select(feilds)
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ")
        console.log("sortBy => ", sortBy)
        query = query.sort(sortBy)
    } else {
        query = query.sort("-createdAt")
    }

    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 1
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()


    query = query.skip(startIndex).limit(limit)

    let pagination = {    
    }

    if (endIndex < total ) {
        pagination.next = {
            page : page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev =  {
            page : page - 1,
            limit
        }
    }
   

    const bootcamps = await query


    //const bootcamps = await query

    //console.log("Bootcamps => ", JSON.stringify(bootcamps))

    res.status(200).json({
        "success" : true,
        "pagination"  : pagination,
        "data" : bootcamps
    })
})

// @desc getSingleBootcamp function used to get all bootcamps
// @route GET /api/v1/bootcamps
// @access Public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
        const bootcamps = await Bootcamp.findById(req.params.id)

        if (!bootcamps) {
            return  next(new ErrorResponse(`Bootcamp not found or id ${req.params.id}`, 400))
        }
        res.status(200).json({
            "success" : true,
            "data" : bootcamps
        })
})


// @desc createBootcamps function used to create new bootcamp
// @route POST /api/v1/bootcamps
// @access Public
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id

  const publishedBootcamps = await Bootcamp.findOne({user: req.body.user})

  if (publishedBootcamps && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Bootcamp already published by ${req.user.id}`, 400))
  }

  const bootcamp = await Bootcamp.create(req.body)


  res.status(200).json({
      "success" : true,
      "msg" : "create bootcamps",
      "data" : bootcamp
  })
})

// @desc updateBootcamps function used to update existing new bootcamp
// @route PUT /api/v1/bootcamps/:id
// @access Public
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamps) {
        return  next(new ErrorResponse(`Bootcamp not found or id ${req.params.id}`, 400))
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this bootcamp`,
          401
        )
      );
    }
    
    // update slug while updating name
    if (Object.keys(req.body).includes("name")) {
      req.body.slug = slugify(req.body.name, { lower: true });
    }
  
    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
        "success" : true,
        "data" : {}
    })
})


// @desc deleteBootcamp function used to delete existing new bootcamp
// @route DELETE /api/v1/bootcamps/:id
// @access public
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return  next(new ErrorResponse(`Bootcamp not found or id ${req.params.id}`, 400))
    }

    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this bootcamp`,
          401
        )
      );
    }

    await bootcamp.deleteOne();
    res.status(200).json({
        "success" : true,
        "data" : {}
    })
})

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
  
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is bootcamp owner
    // if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return next(
    //     new ErrorResponse(
    //       `User ${req.user.id} is not authorized to update this bootcamp`,
    //       401
    //     )
    //   );
    // }
  
    if (!req.files) {
      return next(new ErrorResponse(`Please upload a file`, 400));
    }
  
    const file = req.files.file;
  
    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }
  
    // Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
          400
        )
      );
    }
  
    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
  
      await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
  
      res.status(200).json({
        success: true,
        data: file.name
      });
    });
  });