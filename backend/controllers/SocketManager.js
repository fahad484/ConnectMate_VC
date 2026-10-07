const { Server } = require("socket.io");
const cors =require("cors");
let messages = {};
let connections = {};
let timeOnline = {};

const connectToSocket =(server)=>{
    // Create Socket.IO server
    const io = new Server(server,{
        cors:{
            origin:"*",
            methods :["GET","POST"],
            allowedHeaders : ['*'],
            credentials :true
        }
    });

    //check server connection
    io.on("connection",(socket)=>{

        //listen to client socket emit
        socket.on("join-call",(path)=>{

            if(connections[path] === undefined){
                connections[path] = [];
            }
            //user joined , and added socket.id
            connections[path].push(socket.id);

            //time duration of socket.id of user
            timeOnline[socket.id] = new Date();

            //number of  server sockets on a specific path
            for(let a = 0 ; a < connections[path].length ; a++){
                io.to(connections[path][a]).emit("user-joined",socket.id ,connections[path]);
                // to -> is used for room  selection and emmit is to send a message 
            }
            //or use 
            // connections[path].forEach(element => {
            //     io.to(element).emit("user-joined",socket.id,connections[path]);
            // });

            if(messages[path] !== undefined){
                for(let a = 0 ; a < messages[path].length ; a++){
                    //send message to specific client using its socket.id
                    io.to(socket.id).emit("chat-message", messages[path][a]["data"],messages[path][a]["sender"],messages[path]["socket-id-sender"]);
                }
            }
        })

        socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",socket.id,message);
        })

        //room message comes and to be send within the same room
        socket.on("chat-message",(data,sender)=>{

            const [matchingRoom ,found] = Object.entries(connections).reduce(([room ,isFound] ,[roomkey , roomValue])=>{
                if(!isFound && roomValue.includes(socket.id)){
                    return [roomkey ,true];
                }
                return [room , isFound];
            },["",false]);

            if(found === true){
                if(messages[matchingRoom] === undefined){
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({"sender":sender , "data":data ,"socket-id-sender":socket.id});
                console.log("message",matchingRoom,":",sender,data);

                connections[matchingRoom].forEach(element => {
                    io.to(element).emit("chat-message",data,sender,socket.id);
                })
            }
        })
        socket.on("disconnect",()=>{
            var diffTime = Math.abs(timeOnline[socket.id]-new Date());
                    var key;

                    //creating a deep-copy using JSON.parse(JSON.stringify())
                    for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                        for(let a =0 ; a< v.length ; a++){
                            if(v[a] === socket.id){
                                key = k;
                                
                                for(let a=0 ; a<connections[key].length ;a++){
                                    io.to(connections[key][a]).emit("user-left",socket.id);
                                }

                                var index = connections[key].indexOf(socket.id);
                                if (index !== -1) {
                                    connections[key].splice(index,1);
                                }
                                if(connections[key].length === 0){
                                    delete connections[key];
                                }
                            }
                        }
                    }
        })
                    
                
            
       
    });
    
    return io;
}

module.exports = connectToSocket;