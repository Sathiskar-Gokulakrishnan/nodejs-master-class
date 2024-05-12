const errorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {
    let error = {...err}
    console.log(err.message.red)

    error.message = err.message

    console.log(err.name)
    console.log(err)

    // Mongoose bad object
    if (err.name === "CastError"){
        const message = `Bootcamp not found with id ${err.value}`
        error = new errorResponse(message, 404) 
    }

    //Mongoose dublicate error
    if (err.code === 11000) {
        const message = "Dublicate value entered"
        error = new errorResponse(message, 400) 
    }

    //Mongoose validation error
    if (err.code === "ValidationError") {
        const message = Object.values(err.error).map((val) => val.message)
        error = new errorResponse(message, 400) 
    }

    res.status(err.status || 500).json({
        success : false,
        error : error.message || "server error"
    })
}

module.exports = errorHandler