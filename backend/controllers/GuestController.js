// module.exports.validateMeeting = (req, res) => {
//   try {
//     const meetingCode = req.params.code?.trim();

//     if (!meetingCode) {
//       return res.status(400).json({
//         valid: false,
//         message: "Meeting code is required",
//       });
//     }

//     const io = req.app.get("io");

//     if (!io) {
//       return res.status(500).json({
//         valid: false,
//         message: "Meeting service is unavailable",
//       });
//     }

//     const roomExists = io.sockets.adapter.rooms.has(meetingCode);

//     if (!roomExists) {
//       return res.status(404).json({
//         valid: false,
//         message: "Meeting does not exist or is no longer active",
//       });
//     }

//     return res.status(200).json({
//       valid: true,
//       meetingCode,
//       message: "Meeting is available",
//     });
//   } catch (error) {
//     console.error("Meeting validation error:", error);

//     return res.status(500).json({
//       valid: false,
//       message: "Unable to validate meeting",
//     });
//   }
// };



module.exports.validateMeeting = (req, res) => {
    try {
        const meetingCode = req.params.code?.trim();

        if (!meetingCode) {
            return res.status(400).json({
                valid: false,
                message: "Meeting code is required",
            });
        }

        const io = req.app.get("io");

        if (!io) {
            return res.status(500).json({
                valid: false,
                message: "Meeting service is unavailable",
            });
        }

        const room = io.sockets.adapter.rooms.get(meetingCode);

        // Check that the room exists and has connected sockets
        const roomIsActive = room && room.size > 0;

        if (!roomIsActive) {
            console.log("Meeting room not found:", meetingCode);
            console.log(
                "Available rooms:",
                [...io.sockets.adapter.rooms.keys()]
            );

            return res.status(404).json({
                valid: false,
                message: "Meeting does not exist or is no longer active",
            });
        }

        return res.status(200).json({
            valid: true,
            meetingCode,
            message: "Meeting is available",
        });

    } catch (error) {
        console.error("Meeting validation error:", error);

        return res.status(500).json({
            valid: false,
            message: "Unable to validate meeting",
        });
    }
};
