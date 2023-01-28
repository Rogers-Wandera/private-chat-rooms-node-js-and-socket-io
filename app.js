const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const { v4:uuid } = require("uuid")
const io = require("socket.io")(server, {cors: {origin:"*"}});

const PORT = process.env.PORT || 5000

app.get("/", (req,res) => {
    res.status(200).sendFile(path.join(__dirname,"public","index.html"))
})
let rooms = [];
let messages = [];
io.on("connection", (socket) => {

    socket.on("room",function(room) {
        let roomExist = rooms.find((rm) => rm.roomName === room);
        if(roomExist) {
            socket.emit("roomExists", `room ${room} already exists`)
        } else {
            rooms.push({roomId: uuid(), roomName: room});
            socket.emit("roomCreated", `room ${room} has been created successful`)
        }
    })

    socket.emit("availableRooms", rooms);

    socket.on("joinRoom", (room) => {
        let roomExist = rooms.find((rm) => rm.roomId === room.id);
        const roomName = roomExist.roomName;
        if(roomExist){
            socket.join(roomExist);
            io.sockets.in(roomExist).emit("message", `welcome to our room ${roomName}`)
           socket.on("msgText", (data) => {
            messages.push(data)
            io.sockets.in(roomExist).emit("msgContent", messages)
           })
           socket.on("typing", (data) => {
            console.log(data)
            socket.broadcast.emit("isTyping", data)
           })
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})