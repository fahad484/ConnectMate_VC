const User =require("../models/users.model.js");
const { StatusCodes } = require("http-status-codes");
const bcrypt= require("bcrypt");
const crypto = require("crypto");

const Meeting = require("../models/meeting.model.js");

module.exports.login = async(req,res)=>{
    let {username ,password} = req.body;
    if(!username || !password){
       return res.status(400).json({message:"please provide valid credentials"});
    }

    try {
            const user = await User.findOne({username});
            if(!user){
                return res.status(StatusCodes.CONFLICT).json({message:"user not found"});
            }

            const isMatch =await bcrypt.compare( password , user.password );
            if(!isMatch){
                return res.status(StatusCodes.UNAUTHORIZED).json({message: "Invalid password"});
            }

            let token =await crypto.randomBytes(20).toString("hex");
                    
            user.token = token;
            await user.save();
            return res.status(StatusCodes.OK).json({token: token});

    } catch (error) {

        return res.status(500).json({message:`something went wrong:${error}`});
    }
}

module.exports.register =async(req,res) =>{
    let { name, username ,password } = req.body;

    // console.log("StatusCodes:", StatusCodes);
    // console.log("CREATED:", StatusCodes.CREATED);
    // console.log("OK:", StatusCodes.OK);
    // console.log("NOT_FOUND:", StatusCodes.NOT_FOUND);
    // console.log("CONFLICT:", StatusCodes.CONFLICT);
    // console.log("INTERNAL_SERVER_ERROR:", StatusCodes.INTERNAL_SERVER_ERROR);

    try {
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(StatusCodes.CONFLICT).json({message:"you already exists"})
        }

        const hashPassword =await bcrypt.hash(password,11);

        const user = new User({
            name:name,
            username:username,
            password:hashPassword,
        });

         await user.save();
        
        return res.status(StatusCodes.CREATED).json({message:"user registered successfully!"});

    } catch (error) {
        // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:`something went wrong :${error}`});
        res.status(500).json({message:`something went wrong :${error}`});
    }
}
module.exports.getUserHistory = async(req,res) =>{
    const {token} = req.query;

    try{
        const user =await User.findOne({token:token});
        const meetings = await Meeting.find({user_id:user.username});
        res.json(meetings);
    }catch(e){
        res.json({message:`something went wrong ${e}`})
    }
} 

// module.exports.addToHistory =async(req,res) =>{
//     const {token,meeting_code} =req.body; 

//     try{
//         const user = await User.findOne({token:token});

//         const newMeeting = new Meeting({
//             user_id: user.username ,
//             meetingCode : meeting_code
//         })
//         await newMeeting.save();

//         res.status(StatusCodes.CREATED).json({message:"Added code to history"})
//     }catch(e){
//         res.json({message:`something went wrong ${e}`})
//     }
// }
module.exports.addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        if (!token || !meeting_code) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Token and meeting code are required"
            });
        }

        const user = await User.findOne({ token });

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid token or user not found"
            });
        }

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        await newMeeting.save();

        return res.status(StatusCodes.CREATED).json({
            message: "Added code to history"
        });

    } catch (error) {
        console.error("addToHistory error:", error);

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Something went wrong"
        });
    }
};