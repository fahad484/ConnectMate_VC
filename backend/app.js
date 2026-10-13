require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const {Server} = require("socket.io");
const connectToSocket =require("./controllers/SocketManager.js");
const http = require("node:http");

const cors = require("cors");

const dns = require("node:dns");
const  userRoutes = require("./routes/users.routes.js");
const  meetingRoutes = require("./routes/guest.routes.js");

dns.setServers(["8.8.8.8"]);

const app = express();
// Create HTTP server using Express app
const server = http.createServer(app);
// Create Socket.IO server in connecToSocket(connecToSocket is user defined function)
const io = connectToSocket(server);

const PORT = process.env.PORT || 8080;
const MONGO_URL=process.env.MONGODB_URL;

// Make Socket.IO accessible to Express controllers
app.set("io", io);
//only selected link to access resource
// app.use(cors());

const allowedOrigins = [
    "http://localhost:3000",
    "https://connectmate-vc-1.onrender.com"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
}));




// body parsing with limit of 40kb
app.use(express.json({ limit : "40kb" }));
// urlencoded extended true with limit as 40kb 
app.use(express.urlencoded({ limit : "40kb" , extended : true }));

app.use("/api/v1/users",userRoutes);
app.use("/api/meetings",meetingRoutes);

main().then(()=> console.log("done!"))
 .catch((err)=> console.log(err));

async function main(){
    const connectionDB = await mongoose.connect(MONGO_URL);
    console.log(`db connected successfully!:${connectionDB.connection.host}`);
}

server.listen(PORT,()=>{
    console.log(`app is listening at PORT:${PORT}`);
});
// app.listen(PORT,()=>{
//     console.log(`app is listening at PORT:${PORT}`);
// });