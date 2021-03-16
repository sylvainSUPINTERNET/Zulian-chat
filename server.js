'use strict';

const app = require('express')();
const http = require('http').Server(app);

// CORS only for DEV
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});
const cors = require('cors');
const bodyParser = require('body-parser');


// Configuration
const roomsDefinition = require('./config/roomsDefintion');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// FOR DEV ONLY
app.use(cors());


io.on('connection', async socket => {
    const { id, rooms } = socket;

    socket.on("join", userDetailsAndRoom => {
        if ( userDetailsAndRoom.isLoadingRooms === true ) {
            const {roomName, userName, userFirstname, userFullName, userUuid} = userDetailsAndRoom; // roomName = uuid
            console.log(`user ${userUuid} (${userFullName}) loading / connecting to his room : ${roomName}`);

            socket.join(roomName)
            io.in(roomName).emit(`${roomName}-connectedUser`, `${userFirstname} is connected !`);


            setInterval(() => {
                console.log("TEST SEND")
                io.in(roomName).emit(`${roomName}-connectedUser`,"test");
                console.log(io.sockets.adapter.rooms.get(roomName))

            },6000)

        } else {
            const { roomName, targetProfile, initiator } = userDetailsAndRoom;
            socket.join(roomName)
            io.in(roomName).emit("welcomeUser", `Invit conversation for ${targetProfile.user.uuid} by ${initiator.uuid}`);
        }
    });

    // By default, user joins a room ( allow you to send a personnal message on this one)
    socket.on('disconnecting', () => {
        console.log(socket.rooms); // the Set contains at least the socket ID
        console.log('disconnecting')
    });

    io.on('disconnect', reason => {
        console.log(socket.rooms.size)
        console.log('disconnected');
    })
});



http.listen(4001, () => {
    console.log('listening on *:4001');
});