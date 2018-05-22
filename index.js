'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/client'));

const update_period = 250;
const timeout = 10000;
const players = {};
const sculp_edit_states = {};

function onConnection(socket){
    io.emit('usr_connect', socket.id );
    console.log(socket.id + " has connected");
    let interv = setInterval( ((socket) => {send_player_updates(socket);}).bind(this, socket), 250);
    socket.on('client_update_player', (player) => recieve_player_update(player));
    socket.on('disconnect', (interv) => {
	if (interv) clearInterval(interv);
	console.log(socket.id + " has disconnected");
	delete players[socket.id];
	socket.broadcast.emit('usr_disconnect', socket.id);
    });
}

io.on('connection', onConnection);

function recieve_player_update(player) {
	if (!(player.ID in players)) {
		players[player.ID] = {
			ID : player.ID,
			quat : player.quat, 
			position : player.position, 
	       		color : player.color,
			//last_update : Date.now()
			};
	} else {
		const p = players[player.ID];
		p.quat = player.quat;
		p.position = player.position;
		p.color = player.color;
		//p.last_update = Date.now();
	}
}

function send_player_updates(socket) {
	// volitile means its not super important each message makes it
	socket.volatile.emit('server_player_updates', players);
}

// when a player compiles/saves a shader broadcast to others to refetch it from DB
function tell_players_to_update_shader() {
	
}

http.listen(port, () => console.log('listening on port ' + port));
