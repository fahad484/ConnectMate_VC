import React, { useContext, useEffect, useState } from "react";
import {AuthContext }from "../context/AuthContext";
import { useNavigate } from "react-router-dom";



// import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home"

const History = () => {
  const {getHistoryOfUser} = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        //implement snackbar
      }
    };
    fetchHistory();
  }, []);

//   const bull = (
//   <Box
//     component="span"
//     sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
//   >
//     •
//   </Box>
// );
let formatDate = (dateString)=>{
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2,"0");
    const month =(date.getMonth()+1).toString().padStart(2,"0" );
    const year =date.getFullYear();

    return `${day}/${month}/${year}`
}

  return (
    <div>
        <IconButton onClick={()=>{
            routeTo("/home");
          }}>
                <HomeIcon style={{fontSize:"2.5rem"}}/>
        </IconButton>

        {/* e is element and idx is index */}
      {meetings.length>0? meetings.map((e,idx) => {
        return (
          <>
          
            <Card key={idx} variant="outlined">
              <CardContent>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 14 }}
                >
                  code: {e.meetingCode}
                </Typography>
                {/* <Typography variant="h5" component="div">
                  be{bull}nev{bull}o{bull}lent
                </Typography> */}
                <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                  Date : {formatDate(e.date)}
                </Typography>
                {/* <Typography variant="body2">
                  well meaning and kindly.
                  <br />
                  {'"a benevolent smile"'}
                </Typography> */}
              </CardContent>
              <CardActions>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </>
        );
      }):<p style={{textAlign:"center",fontSize:"1.5rem"}}>No History yet!</p>}
    </div>
  );
};

export default History;
