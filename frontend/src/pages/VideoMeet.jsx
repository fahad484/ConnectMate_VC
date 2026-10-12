import React,{useEffect, useRef, useState} from 'react'
import TextField from '@mui/material/TextField';
import { useParams, useLocation } from "react-router-dom";
import Button from '@mui/material/Button';

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import {useNavigate} from "react-router-dom"
import { io } from "socket.io-client";

// module method of importing styles
//in module way the styles doesn't override
import styles from "../styles/VideoMeet.module.css";
import IconButton from '@mui/material/IconButton';

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import Badge from '@mui/material/Badge';

import server from '../environment';

var connections ={};

const server_url = server;

const PeerConfigurations={
  "iceServers":[
    {"urls":"stun:stun.l.google.com:19302"}
  ]
}

const VideoMeet = () => {
  var socketRef  = useRef();
  

  let socketIdRef = useRef();

  let localVideoRef = useRef(null);

  let [videoAvailable,setVideoAvailable] = useState(true);

  let [audioAvailable ,setAudioAvailable] = useState(true);

  let [ video ,setVideo] = useState([]); 

  let [ audio ,setAudio] = useState();

  let [ screen ,setScreen] = useState();

  const pendingCandidates ={};

  const [expandedVideo, setExpandedVideo] = useState(null);

  const [showModal ,setShowModal] = useState(false);

  let [screenAvailable ,setScreenavailable] =useState();

  let [messages ,setMessages] = useState([]);

  let [message , setMessage] = useState("");

  let [newMessages ,setNewMessages] = useState(0);

  let [askForUsername , setAskForNewUsername] =useState(true);

  let [username ,setUsername] =useState("");

  const videoRef =useRef([]);

  let [videos ,setVideos ] = useState([]);

  const [screenShare, setScreenShare] = useState(null);
  const [sharingScreen, setSharingScreen] = useState(false);

  const screenStreamRef = useRef(null);

  const {url : meetingCode} =useParams();
  
  let routeTo = useNavigate();
  //todo
  const isChrome = () =>
    /Chrome/.test(navigator.userAgent) &&
    !/Edg|OPR/.test(navigator.userAgent);

  isChrome();
    
  const getPermissions = async()=>{
    try {
      //video permission
      const videoPermission = await navigator.mediaDevices.getUserMedia({video:true});

      if(videoPermission){
        setVideoAvailable(true);
      }else{
        setVideoAvailable(false);
      }
      //audio permission
      const audioPermission = await navigator.mediaDevices.getUserMedia({audio:true});

      if(audioPermission){
        setAudioAvailable(true);
      }else{
        setAudioAvailable(false);
      }
      //screen sharing (asks for permission by default)
      if(navigator.mediaDevices.getDisplayMedia){
        setScreenavailable(true);
      }else{
        setScreenavailable(false);
      }
      if(videoAvailable || audioAvailable){

        const userMediaStream = await navigator.mediaDevices.getUserMedia({video:videoAvailable , audio:audioAvailable});

        if(userMediaStream){
          window.localStream =userMediaStream;
          if(localVideoRef.current){
            localVideoRef.current.srcObject = userMediaStream;
          }
          console.log("Local stream:", userMediaStream);
          console.log("Video tracks:", userMediaStream.getVideoTracks());
          console.log("Audio tracks:", userMediaStream.getAudioTracks());
        }
      }

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    getPermissions();
  },[]);

  const getUserMediaSuccess =(stream)=>{
      try {
        window.localStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.log(error);
      }

      window.localStream = stream;
      localVideoRef.current.srcObject = stream;

      for(let id in connections){
        if(id === socketIdRef.current) continue;

        connections[id].addStream(window.localStream);

        connections[id].createOffer().then((description)=>{
            connections[id].setLocalDescription(description)
            .then(()=>{
              socketRef.current.emit("signal",id , JSON.stringify({"sdp":connections[id].localDescription}))
            })
            .catch(e=>console.log(e));
        })
      }
      stream.getTracks().forEach(track=> track.onended =()=>{
        setVideo(false);
        setAudio(false);

        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach( track => track.stop());
        } catch (error) {
          console.log(error);
        }
        //todo blacksilence

        let blackSilence =(...args)=> new MediaStream([black(...args),silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        for(let id in connections){
          connections[id].addStream(window.localStream);
          connections[id].createOffer().then((description)=>{
            connections[id].setLocalDescription(description)
            .then(()=>{
              socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].LocalDescription}));
            })
            .catch (e=> console.log(e));
          })
        }
      })
  }

  let silence =()=>{
    let ctx =new AudioContext();
    let oscillator =  ctx.createOscillator();

    let dst = oscillator.connect((ctx.createMediaStreamDestination()));

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0],{enabled:false});
  }

  let black =({width= 640 ,height=480} ={})=>{
    let canvas = Object.assign(document.createElement("canvas"),{width,height});

    canvas.getContext('2d').fillRect(0,0,width,height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0],{enabled:false});
  }

  let getUserMedia =()=>{
    if((video && videoAvailable)||(audio && audioAvailable)){
      navigator.mediaDevices.getUserMedia({video:video ,audio:audio})
      .then(getUserMediaSuccess) // todo getusermedia success
      .then((stream)=>{})
      .catch(e=> console.log(e));
    }else{
      try{
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track=> track.stop())
      }catch(error){
        console.log(error);
      }
    }
  }

  useEffect(()=>{
    if(audio !== undefined && video!== undefined){
      getUserMedia();
    }
  },[audio,video]);

  let gotMessageFromServer = (fromId ,message)=>{
    var signal =JSON.parse(message);

    if(fromId !== socketIdRef.current){
      if(signal.sdp){
        //sdp -> session description
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(()=>{
            if(signal.sdp.type === "offer"){

              connections[fromId].createAnswer().then((description)=>{
                connections[fromId].setLocalDescription(description)
                .then(()=>{
                  socketRef.current.emit("signal",fromId,JSON.stringify({"sdp":connections[fromId].localDescription}));
                })
                .catch(e=>console.log(e));

              }).catch(e=>console.log(e));
            }
        })
        .catch(e=>console.log(e));
      }
      if(signal.ice){
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e=>console.log(e));
      }
    }
  }
  
// const gotMessageFromServer = async (fromId, message) => {
//     try {
//         const signal = JSON.parse(message);

//         if (fromId === socketIdRef.current) return;

//         const peer = connections[fromId];

//         if (!peer) {
//             console.warn("Peer not found:", fromId);
//             return;
//         }

//         if (signal.sdp) {
//             await peer.setRemoteDescription(
//                 new RTCSessionDescription(signal.sdp)
//             );

//             if (signal.sdp.type === "offer") {
//                 const answer = await peer.createAnswer();

//                 await peer.setLocalDescription(answer);

//                 socketRef.current.emit(
//                     "signal",
//                     fromId,
//                     JSON.stringify({
//                         sdp: peer.localDescription
//                     })
//                 );
//             }

//             const queued = pendingCandidates[fromId] || [];

//             for (const candidate of queued) {
//                 await peer.addIceCandidate(
//                     new RTCIceCandidate(candidate)
//                 );
//             }

//             delete pendingCandidates[fromId];
//         }

//         if (signal.ice) {
//             if (peer.remoteDescription) {
//                 await peer.addIceCandidate(
//                     new RTCIceCandidate(signal.ice)
//                 );
//             } else {
//                 if (!pendingCandidates[fromId]) {
//                     pendingCandidates[fromId] = [];
//                 }

//                 pendingCandidates[fromId].push(signal.ice);
//             }
//         }
//     } catch (error) {
//         console.error("WebRTC signaling error:", error);
//     }
// };


  let addMessage = (data,sender,socketIdSender)=>{
    setMessages((prevMessages)=>[
          ...prevMessages,
      {sender:sender,data:data}
    ]);
    if(socketIdSender !== socketIdRef.current){
      setNewMessages((prevMessages)=> prevMessages+1);
    }
  }

  // let connectToSocketServer =()=>{

  //   socketRef.current = io.connect(server_url,{secure:false})
  //   socketRef.current.on('signal',gotMessageFromServer);

  //   socketRef.current.on("connect",()=>{
  //     socketRef.current.emit("join-call",window.location.href);
  //     socketIdRef.current =socketRef.current.id;
  //     socketRef.current.on("chat-message",addMessage);
      
  //     socketRef.current.on("user-left",(id)=>{
  //       // setVideo((videos)=>videos.filter((video)=>video.socketId !== id));
  //       setVideos((prevVideos)=>
  //       Array.isArray(prevVideos)?prevVideos.filter((video)=>video.socketId != id):[]
  //       );
  //       delete connections[id];
  //     })

  //     socketRef.current.on("user-joined",(id , clients)=>{
  //       clients.forEach((socketListId)=>{

  //         connections[socketListId] = new RTCPeerConnection(PeerConfigurations);
          
  //         // ice is a protocol name (interactive connectivity establishment)->ice
  //         connections[socketListId].onicecandidate = (event)=>{
  //            if(event.candidate !== null){
  //             socketRef.current.emit("signal",socketListId,JSON.stringify({'ice':event.candidate}));
  //            }
  //         }
  //         connections[socketListId].onaddstream = (event)=>{

  //           let videoExists = videoRef.current.find(video=> video.socketId ===socketListId);

  //           if(videoExists){
  //             setVideo(videos=>{
  //               const updatedVideos =videos.map(video=>
  //                 video.socketId === socketListId ? {...video, stream:event.stream} : video 
  //               );
  //               videoRef.current = updatedVideos;
  //               return updatedVideos;
  //             })
  //           }else{

  //             let newVideo = {
  //               socketId :socketListId,
  //               stream :event.stream,
  //               autoPlay :true,
  //               playsinline:true
  //             }
  //             setVideos(videos=>{
  //               const updatedVideos =[...videos,newVideo];
  //               videoRef.current = updatedVideos;
  //               return updatedVideos; 
  //             })
  //           }
  //         }

  //         if(window.localStream !== undefined && window.localStream !== null){ 
  //           connections[socketListId].addStream(window.localStream);
  //         } else{
  //           //todo
  //             // let blackSilence;

  //             let blackSilence =(...args)=> new MediaStream([black(...args),silence()]);
  //             window.localStream = blackSilence();
  //             connections[socketListId].addStream(window.localStream);
  //         }
  //       })

  //     if(id === socketIdRef.current){
  //       for( let id2 in connections){
  //         if(id2 === socketIdRef.current) continue

  //         try {
  //           connections[id2].addStream(window.localStream)
  //         } catch (error) {
  //          console.log(error);
  //         }
  //         connections[id2].createOffer()
  //         .then((description)=>{
  //           connections[id2].setLocalDescription(description)
  //         }) 
  //         .then(()=>{
  //               socketRef.current.emit("signal",id2,JSON.stringify({"sdp":connections[id2].LocalDescription}));
  //         })
  //         .catch(e=> console.log(e));
          
          
  //       }
  //     }

  //       })
  //     })
  // }
 
const connectToSocketServer = () => {
    socketRef.current = io(server_url);

    socketRef.current.on("connect", () => {
        socketIdRef.current = socketRef.current.id;

        console.log("Socket connected:", socketIdRef.current);
        console.log("Meeting code:", meetingCode);

        socketRef.current.emit("join-call", meetingCode);

        socketRef.current.on("chat-message", addMessage);

        socketRef.current.on("user-left", (id) => {
            if (connections[id]) {
                connections[id].close();
                delete connections[id];
            }

            setVideos((prev) =>
                prev.filter((video) => video.socketId !== id)
            );
        });

        socketRef.current.on("user-joined", (id, clients) => {
            clients.forEach((peerId) => {
                // Do not create a connection to yourself.
                if (peerId === socketIdRef.current) return;

                // Avoid creating duplicate peer connections.
                if (connections[peerId]) return;

                const peer = new RTCPeerConnection(PeerConfigurations);
                connections[peerId] = peer;

                // Send ICE candidates to the other participant.
                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socketRef.current.emit(
                            "signal",
                            peerId,
                            JSON.stringify({ ice: event.candidate })
                        );
                    }
                };

                // Receive remote video/audio.
                peer.ontrack = (event) => {
                    const stream = event.streams[0];
                    if (!stream) return;

                    setVideos((prev) => {
                        const exists = prev.some(
                            (video) => video.socketId === peerId
                        );

                        if (exists) {
                            return prev.map((video) =>
                                video.socketId === peerId
                                    ? { ...video, stream }
                                    : video
                            );
                        }

                        return [...prev, { socketId: peerId, stream }];
                    });
                };

                // Send our local camera/microphone tracks.
                const localStream = window.localStream;

                if (localStream) {
                    localStream.getTracks().forEach((track) => {
                        peer.addTrack(track, localStream);
                    });
                }

                // The participant who just joined initiates the offer.
                if (id === socketIdRef.current) {
                    peer.createOffer()
                        .then((offer) => peer.setLocalDescription(offer))
                        .then(() => {
                            socketRef.current.emit(
                                "signal",
                                peerId,
                                JSON.stringify({
                                    sdp: peer.localDescription
                                })
                            );
                        })
                        .catch(console.error);
                }
            });
        });

        socketRef.current.on("signal", gotMessageFromServer);
    });

    socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection failed:", error.message);
    });
};

  

  let getMedia =()=>{
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  }

  let connect =()=>{
    setAskForNewUsername(false);
    getMedia();
  }

  let handleVideo =()=>{
    setVideo(!video);
  }
  let handleAudio = () =>{
    setAudio(!audio);
  }

  let getDisplayMediaSuccess = async(stream) =>{
    try {
        window.localStream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.log(error);
    }
    window.localStream =stream;
    localVideoRef.current.srcObject =stream;

    screenStreamRef.current = stream;
    setScreen(true);

    // for(let id in connections){
    //   if( id === socketIdRef.current) continue;

    //   connections[id].addStream(window.localStream);
    //   connections[id].createOffer().then((description)=>{
    //     connections[id].setLocalDescription(description)
    //     .then(()=>{
    //       socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].LocalDescription}));
    //     })
    //     .catch(e=> console.log(e));
    //   })
    // }
    for (let id in connections) {
    const peer = connections[id];

    const screenTrack = stream.getVideoTracks()[0];

    const sender = peer
        .getSenders()
        .find(sender => sender.track?.kind === "video");

    if (sender && screenTrack) {
        await sender.replaceTrack(screenTrack);
    }
}
    stream.getTracks().forEach(track=> track.onended =()=>{
        setScreen(false);
        

        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach( track => track.stop())
        } catch (error) {
          console.log(error);
        }
        //todo blacksilence

        let blackSilence =(...args)=> new MediaStream([black(...args),silence()]);
        window.localStream = blackSilence();
        localVideoRef.current.srcObject = window.localStream;

        getUserMedia();
      })
  }

  let getDisplayMedia =()=>{
    if(screen){
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video:true,audio:true})
        .then(getDisplayMediaSuccess)
        .then((stream)=>{})
        .catch((e)=> console.log(e));
      }
    }
  }
  useEffect(()=>{
    if(screen !== undefined){
        getDisplayMedia();
    }
  },[screen])

  //screen share
  let handleScreen = () =>{
    setScreen(!screen);
  }
  //implement real time socket message
  let sendMessage =() =>{
    socketRef.current.emit("chat-message",message ,username);
    setMessage("");
  }

  let handleEndCall = ()=>{
    try{
      let tracks= localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }catch(e) {console.log(e)};

    routeTo("/home")
  }

  return (
    <div>
      {askForUsername ? (
        <div>
          <h2> ENTER INTO LOBBY</h2>
          <TextField
            id="outlined-basic"
            label="username"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video ref={localVideoRef} autoPlay muted playsInline></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetvideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length > 0 &&
                    messages.map((item, index) => {
                      return (
                        <div key={index} style={{ marginBottom: "20px" }}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    id="outlined-basic"
                    label="Enter your chat"
                    variant="outlined"
                  />
                </div>
                <Button variant="contained" onClick={sendMessage}>
                  send{" "}
                </Button>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainer}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}
            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                onClick={() => setShowModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {/* {videos.map((video)=>(
            <div  key={video.socketId}>
               
                <video data-socket={video.socketId} ref={ref =>{
                  if(ref && video.stream){
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay 
                ></video>
            </div>
          ))
        } */}

            {videos.map((video) => (
              <div
                key={video.socketId}
                style={{
                  position: "relative",
                  width: "180px",
                  height: "120px",
                  flexShrink: 0,
                }}
              >
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream && ref.srcObject !== video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: "10px",
                  }}
                />

                <button
                  onClick={async (e) => {
                    const videoElement =
                      e.currentTarget.parentElement.querySelector("video");

                    try {
                      if (document.fullscreenElement === videoElement) {
                        await document.exitFullscreen();
                        setExpandedVideo(null);
                      } else {
                        if (document.fullscreenElement) {
                          await document.exitFullscreen();
                        }

                        await videoElement.requestFullscreen();
                        setExpandedVideo(video.socketId);
                      }
                    } catch (error) {
                      console.error("Fullscreen error:", error);
                    }
                  }}
                  title="Toggle fullscreen"
                  style={{
                    position: "absolute",
                    right: "5px",
                    bottom: "5px",
                    zIndex: 5,
                    cursor: "pointer",
                    background: "rgba(0,0,0,0.7)",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "4px",
                  }}
                >
                  {expandedVideo === video.socketId ? (
                    <FullscreenExitIcon />
                  ) : (
                    <FullscreenIcon />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoMeet