const express = require("express")
const router = express.Router()


const {register,login, getMe, logout,forgotPassword, resetPassword,   updateDetails, updatePassword, confirmEmail} = require("../controllers/auth")

const { protect, authorize } = require("../middleware/auth")

router.route("/register").post(register)

router.route("/login").post(login)

router.route("/logout").post(logout)

router.route("/forgotPassword").post(forgotPassword);

router.get('/confirmemail', confirmEmail);

router.put('/updatedetails', protect, updateDetails);

router.put('/updatepassword', protect, updatePassword);

router.put('/resetpassword/:resettoken', resetPassword);

router.route("/me").get(getMe)

module.exports = router
