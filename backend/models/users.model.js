const Userschema =require("../schemas/users.schema.js");

const {model} =require("mongoose");

const User = new model("User",Userschema);

module.exports = User;