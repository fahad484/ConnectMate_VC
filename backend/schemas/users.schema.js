const {Schema} =require("mongoose");

const Userschema = new Schema({
    name:{
        type: String,
        required:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    token:{
        type:String,
    }
});

module.exports = Userschema;