import React, { useState ,useContext} from 'react'
import WithAuth from '../util/WithAuth'
import { useNavigate } from 'react-router-dom'
import Styles from "../styles/HomeComponent.module.css"
import TextField from '@mui/material/TextField';
import { AuthContext } from '../context/AuthContext';
import Button from '@mui/material/Button';
import RestoreIcon from '@mui/icons-material/Restore';


const HomeComponent = () => {

  let navigate = useNavigate();
  const [meetingCode ,setMeetingCode] =useState("");
  
  const {addToUserHistory} =useContext(AuthContext);

  let handleJoinVideoCall =async()=>{
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`)
  }
  return (
    <>
      <div className={Styles.navBar}>

        <div style={{display:'flex',alignItems:"center"}}>
          

          <h2>Connect Mate</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          
          <div style={{display:"flex",justifyContent:"center",alignItems:"center"}} onClick={()=>{
                navigate("/history")}}>
            <iconButton  >
                <RestoreIcon/>
            </iconButton>
            <p style={{margin:"0",paddingBottom:".345rem"}}>history</p>
          </div>
            
            <Button onClick={()=>{
              localStorage.removeItem("token");
              navigate("/auth");
            }}>
              Logout
            </Button>
        </div>
      </div>
      <div className={Styles.meetContainer}>
              <div className={Styles.leftPanel}>
                <div>
                  <h2>
                      Provide Quality Video Call Just For Everyone For Free
                  </h2>
                  <div style={{display:"flex",gap:"10px" ,marginTop:".75rem"}}>
                      <TextField onChange={e=> setMeetingCode(e.target.value)} id="outlined-basic" label="meeting code" variant="outlined" />
                      <Button onClick={handleJoinVideoCall}>join Call</Button>
                  </div>
                </div>
              </div>
              <div className={Styles.rightPanel}>
               
                <img srcSet='/logo3.png' a alt="image"  />
              </div>
      </div>
    </>
  )
}

export default WithAuth(HomeComponent)
