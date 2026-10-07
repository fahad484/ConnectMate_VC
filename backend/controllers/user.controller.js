const User =require("../models/users.model.js");
const { StatusCodes } = require("http-status-codes");
const bcrypt= require("bcrypt");
const crypto = require("crypto");

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