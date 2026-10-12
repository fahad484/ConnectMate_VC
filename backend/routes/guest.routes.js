const {  validateMeeting} =require("../controllers/GuestController.js");
const router = require("express").Router();

router.route("/:code/validate").get(validateMeeting)

module.exports = router ;