const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const {logger} = require("./middleware/logger")
const bootcamp = require("./routes/bootcamps")
const course = require("./routes/courses")
const auth = require('./routes/auth');
const users = require('./routes/users');
const errorHandler = require("./middleware/error")
const connectDB = require("./config/db")
const bodyParser = require("body-parser")
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const reviews = require('./routes/reviews');
const expressMongoSanitize = require('express-mongo-sanitize')

const helmet = require("helmet")
const xssClean = require("xss-clean")
const rateLimit = require("express-rate-limit")
const hpp = require("hpp")
const cors = require("cors")

const colors = require("colors")

dotenv.config({ path : "./config/config.env"})

// connect mongo db
connectDB();

const app = express()
const PORT = process.env.PORT || 3000


// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100
  });
  app.use(limiter);
  
  // Prevent http param pollution
  app.use(hpp());
  app.use(cors());

app.use(expressMongoSanitize())
app.use(helmet())
app.use(xssClean())
// File uploading
app.use(fileupload());
app.use(cookieParser());
app.use(bodyParser.json())
//app.use(logger)
if (process.env.NODE_ENV === 'development') {
app.use(morgan("dev"))
} else {
    app.use(morgan("prod"))
}

app.use("/api/v1/auth", auth)
app.use("/api/v1/bootcamp",bootcamp)
app.use("/api/v1/course",course)
app.use('/api/v1/users', users);
app.use("/api/v1/reviews", reviews)


app.use(errorHandler)

const server = app.listen(PORT, () => {
    console.log(`server runs on port ${PORT}`.green.bold)
})

process.on("unhandledRejection", (err, promise) => {
    console.log(`error ${err.message}`)
    server.close(() => process.exit(1))
})