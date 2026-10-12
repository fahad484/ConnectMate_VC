import React,{useState} from 'react'
import "../App.css"
import {Link , useNavigate} from "react-router-dom"

const LandingPage = ()=> {

      const [meetingCode, setMeetingCode] = useState("");
      const navigate = useNavigate();

      const handleGuestJoin = () => {
      const code = meetingCode.trim();

        if (!code) {
          alert("Please enter a meeting code");
          return;
        }

        navigate(`/${encodeURIComponent(code)}`);
      };

  return (
    <div className="landingPageContainer">
      <nav className="container-nav">
        <div className="nav-header">ConnectMate</div>
        <div className="nav-options">
          <Link to={"/guest"}>Join as Guest</Link>
          <Link to={"/register"}>Register</Link>
          <Link to={"/login"} className="buttonstyle">
            Login
          </Link>
        </div>
      </nav>
      <div className="container-main">
        <div className="content">
          <h2>
            <span style={{ color: "orange" }}>Connect</span> with your Loved
            Ones
          </h2>
          <p>Start real-time conversations with people miles away</p>
          <Link to={"/auth"} style={{ textDecoration: "none", color: "white" }}>
            <button className="buttonstyle ">Get Started</button>
          </Link>

          {/* Guest meeting code input */}
          {/* <div style={{ marginTop: "50px",marginBottom:"0" }}>
            <hr/>
            <p>-- OR JOIN AS <span style={{color:"orange",fontWeight:"bold"}}>GUEST</span> </p>
            <input
              type="text"
              placeholder="Enter meeting code"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              style={{padding:".65rem 2rem .65rem 2rem",marginRight:"1rem", border:"none",borderRadius:".7rem"}}
            />

            <button className="buttonstyle"style={{backgroundColor:"blue"}} onClick={handleGuestJoin}>
              Join as guest
            </button>
          </div> */}

        </div>
        <div>
          <img src="/mobile.png" alt="heroimg" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;