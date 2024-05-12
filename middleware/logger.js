
exports.logger = (req, res, next) => {
    console.log(`${req.method} ${req.url} ${req.portocol}`)
    console.log("my middle ware")
    next()
}