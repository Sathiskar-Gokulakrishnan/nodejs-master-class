const express = require("express")
const dotenv = require("dotenv")

const app = express()

dotenv.config("./config/config.env")


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`server runs on port ${PORT}`)
})