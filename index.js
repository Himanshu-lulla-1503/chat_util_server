const express = require('express');
const http = require('http');
const app = express();
const port = process.env.PORT||9000;
const server= http.createServer(app);
const io = require('socket.io')(server);

let roomsmessages={}
let socketInroom={}
let userjoinedrooms={}
io.on('connection',socket=>{
    socket.on('create room',(payload)=>{
        const id = payload.roomID;
        roomsmessages[id]=[];
        socketInroom[id]=[
            {
            id:socket.id,
            name:payload.name,
            roomName:payload.roomName,
            admin:true
        }]
        socket.join(id);
        if(userjoinedrooms[socket.id]){
            userjoinedrooms[socket.id].push({roomID:id,roomName:payload.roomName})
        }
        else{
            userjoinedrooms[socket.id]=[{roomID:id,roomName:payload.roomName}]
        }
        socket.emit('rooms',userjoinedrooms[socket.id]);
    })
    socket.on('join room',(payload)=>{
        console.log(payload);
        if(!socketInroom[payload.roomjoined]){
            socket.emit('no room',"No such room exists")
        }
        else{
            socket.join(payload.roomjoined);
            const roomtobejoined=socketInroom[payload.roomjoined][0].roomName;
            
            socketInroom[payload.roomjoined].push({
                id:socket.id,
                name:payload.name,
                roomName:roomtobejoined
            })
            if(userjoinedrooms[socket.id]){
                userjoinedrooms[socket.id].push({roomID:payload.roomjoined,roomName:roomtobejoined})
            }
            else{
                userjoinedrooms[socket.id]=[{roomID:payload.roomjoined,roomName:roomtobejoined}]
            }
            socket.emit('rooms',userjoinedrooms[socket.id]);

           
        }

    })
    socket.on('get room data',(id)=>{
        socket.emit('room data',socketInroom[id]);
        
    })


});
server.listen(port,()=>console.log(`listening on port ${port}`));