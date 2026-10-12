
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import { TextField } from "@mui/material";
import server from "../environment";

const JoinGuest = () => {
  const [username, setUsername] = useState("");
  const [meetingCode, setMeetingCode] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();

    const name = username.trim();
    const code = meetingCode.trim();

    if (!name || !code) {
      setError("Please enter both username and meeting code.");
      return;
    }

    try {
    
      setError("");

      const response = await axios.get(
        `${server}/api/meetings/${encodeURIComponent(code)}/validate`
      );

      if (response.data.valid) {
        navigate(`/${encodeURIComponent(code)}`, {
          state: {
            username: name,
            isGuest: true,
          },
        });
      } else {
        setError("Meeting does not exist or has already ended.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to validate the meeting. Please try again."
      );
    } 
  };

  return (
    <div className="guest-page">
      <div className="guest-card">
        <h2 style={{ textAlign: "center", marginTop: "1rem" }}>
          Join as <span>Guest</span>
        </h2>

        <p style={{ textAlign: "center" }}>
          Enter your name and the meeting code to continue.
        </p>

        <form style={{ margin: "1rem" }} onSubmit={handleJoin}>
          <div style={{ paddingLeft: "34rem", paddingBlock: "1rem" }}>
           

            <TextField
              id="username"
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              required
            />
          </div>
          <div style={{ paddingLeft: "34rem", paddingBlock: "1rem" }}>
            

            <TextField
              id="meetingCode"
              label="Meeting code"
              variant="outlined"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 40 } }}
              required
            />
            
          </div>

          <div style={{ paddingLeft: "34rem", paddingBlock: "1rem" }}>
            <button
              type="submit"
              className="buttonstyle"
              style={{ width: "220px", height: "45px" }}
            >
              Join Meeting
            </button>
            
          </div>
          {error && (
              <p role="alert" className="guest-error" style={{textAlign:"center"}}>
                {error}
              </p>
            )}
        </form>
      </div>
    </div>
  );
};

export default JoinGuest;
