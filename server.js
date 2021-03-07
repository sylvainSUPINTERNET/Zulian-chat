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
        console.log("RCEIVED JOIN : ", userDetailsAndRoom);

        const { roomName, userName } = userDetailsAndRoom;

        socket.join(roomName);
        console.log("JOIN OK");
        io.in(roomName).emit(`welcome-user`, `Hello ${userName} !`);
        console.log("EMIT EVENT OK");
        console.log("Current socket rooms : ", socket.rooms);
    })

    // By default, user joins a room ( allow you to send a personnal message on this one)
    console.log("New users");
    console.log(rooms);

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