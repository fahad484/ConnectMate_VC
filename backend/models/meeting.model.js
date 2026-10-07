
const MeetingSchema = require("../schemas/meeting.schema.js");

const { model } =require("mongoose");

const Meeting = new model("Meeting",MeetingSchema);

module.exports = Meeting ;