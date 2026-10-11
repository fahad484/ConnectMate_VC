const{ login, register,addToHistory ,getUserHistory } = require("../controllers/user.controller.js") ;

const router = require("express").Router();

router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)

module.exports = router;