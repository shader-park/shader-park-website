'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/client'));

function onConnection(socket){
    socket.broadcast.emit('usr_connect', "here's a message" );
    //socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
}

io.on('connection', onConnection);

function recieve_player_update(player) {
	// set last update-time to now
	// update that players state
}

function send_player_updates() {
	// check if any players have timed out, and broadcast message stating which
}

// when a player compiles/saves a shader others will be told to refetch it from DB
function tell_players_to_update_shader() {
	
}

http.listen(port, () => console.log('listening on port ' + port));
