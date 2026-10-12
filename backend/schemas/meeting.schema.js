const {Schema} =require("mongoose");

const MeetingSchema = new Schema({
    user_id:{
        type:String,
    },
    meetingcode:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
        required:true,
    },
     duration: {
        type: Number,
        default: 0
    },
});

module.exports =  MeetingSchema ;