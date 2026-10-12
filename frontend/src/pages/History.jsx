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
  const [selectedMeeting, setSelectedMeeting] = useState(null);

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
      {meetings.length>0? meetings.map((element,idx) => {
        return (
          <React.Fragment key={element._id}>
            <Card variant="outlined">
              <CardContent>
                <Typography
                  gutterBottom
                  sx={{ color: "text.secondary", fontSize: 14 }}
                >
                  code: {element.meetingcode}
                  {/* { console.log(element.meetingcode)} */}
                </Typography>
                {/* <Typography variant="h5" component="div">
                  be{bull}nev{bull}o{bull}lent
                </Typography> */}
                <Typography sx={{ color: "text.secondary", mb: 1.5 }}>
                  Date : {formatDate(element.date)}
                </Typography>
                {/* <Typography variant="body2">
                  well meaning and kindly.
                  <br />
                  {'"a benevolent smile"'}
                </Typography> */}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => setSelectedMeeting(element)}
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
            {/* {selectedMeeting && ( */}
            {selectedMeeting?._id === element._id && (
              <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                <CardContent>
                  <Typography variant="h6">Meeting Details</Typography>

                  <Typography>Code: {selectedMeeting.meetingcode}</Typography>

                  <Typography>
                    Date: {formatDate(selectedMeeting.date)}
                  </Typography>

                  <Typography>
                    Duration: {Math.floor((selectedMeeting.duration || 0) / 60)}{" "}
                    minutes
                  </Typography>

                  {/* <Button onClick={() => setSelectedMeeting(null)}>
                    Close
                  </Button> */}
                  <Button
                    size="small"
                    onClick={() =>
                      setSelectedMeeting(
                        selectedMeeting?._id === element._id ? null : element,
                      )
                    }
                  >
                    {selectedMeeting?._id === element._id
                      ? "Show Less"
                      : "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </React.Fragment>
        );
      }):<p style={{textAlign:"center",fontSize:"1.5rem"}}>No History yet!</p>}
    </div>
  );
};

export default History;
