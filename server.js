'use strict';

const express = require('express');
const app = express();
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const fs = require('fs');

const port = process.env.PORT || 3000;

class PlayerRoomPositions {

    constructor() {
        this.players = {};
        this.rooms = {};
        // this.playersToUpdateThisInterval = {};
    }

    updatePlayer(player) {
        // make sure players room exists
        if (!(player.room in this.rooms)) {
            this.rooms[player.room] = {};
        }

        //make sure room exists in this interval's update
        // if(!this.playersToUpdateThisInterval[player.room]) {
        //     this.playersToUpdateThisInterval[player.room] = new Set();
        // }
        // this.playersToUpdateThisInterval[player.room].add(player.id);
        this.rooms[player.room][player.id] = player;
        
        this.players[player.id] = player;
    }

    // resetPlayersToUpdateThisInterval() {
    //     this.playersToUpdateThisInterval = {};
    // }

    removePlayerFromRoom(player) {
        if (player in this.players) {
            delete this.rooms[this.players.room][player.id];
            delete this.players[player.id];
        }
    }
}

const playerRoomPositions = new PlayerRoomPositions();

app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./index.html'));
});

app.get('/*', (req, res) => {
    res.sendFile(path.resolve('./index.html'));
})

io.on('connection', onServerConnection);

function onServerConnection(socket) {
    io.emit('userConnect', socket.id );
    console.log(socket.id + ' has connected');

    socket.on('clientTellServerUpdatePlayerPosition', (player) => playerRoomPositions.updatePlayer(player));

    let interval = setInterval((socket => sendPlayerPositionsToClients(socket)).bind(this, socket), 250);
    socket.on('joinRoom', (roomName) => socket.join(roomName));
    socket.on('leaveRoom', (roomName) => {
        playerRoomPositions.removePlayerFromRoom(roomName, socket.id);
        socket.leave(roomName);
    });
    
    socket.on('disconnect', (interval) => {
        if (interval) {
            clearInterval(interval);
        }
        if(socket.id in playerRoomPositions.players) {
            const player = playerRoomPositions.players[socket.id];
            playerRoomPositions.removePlayerFromRoom(player.roomName, socket.id);
        }
        // playerRoomPositions.rooms = {};
        // playerRoomPositions.players = {};
        console.log(socket.id + " has disconnected");
        socket.broadcast.emit('userDisconnect', socket.id);
    });
}

function sendPlayerPositionsToClients(socket) {
    Object.keys(playerRoomPositions.rooms).forEach(roomName => {
        socket.to(roomName).volatile.emit('serverTellPlayersUpdate', playerRoomPositions.rooms[roomName]);
    });
}

// function send_player_updates(socket) {
// 	// volitile means its not super important each message makes it
// 	socket.volatile.emit('server_player_updates', players);
// }

http.listen(port, () => console.log('listening on port ' + port));
