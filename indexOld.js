'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const nodeCleanup = require('node-cleanup');
const mongo_client = require('mongodb').MongoClient;
const port = process.env.PORT || 3000;
const update_period = 250;
const timeout = 10000;
const players = {};
const banned_players = new Set();
const sculp_edit_states = {};

app.use(express.static(__dirname + '/client'));

const login_file = 'dblogin.json';

let login = null;
if (fs.existsSync(login_file)) {
	// running locally
	const raw = fs.readFileSync(login_file);  
	login = JSON.parse(raw);  
} else {
	// running on heroku
	login = {
		url: process.env.URL,
		db_name: process.env.DB_NAME,
		collection_name: process.env.COL_NAME
	};
}

mongo_client.connect(login.url, on_db_connection);

let push_db = null;
let send_initial_sculps_from_db = null;

function on_db_connection(err, client) {
	if (err) throw err;
	console.log("Database connected");
	
	const db = client.db(login.db_name);
	db.listCollections().toArray(function(err, collections){
		console.log("Found collections: " );
		console.log(collections);		
	});

	push_db = (obj) => {
		db.collection(login.collection_name).save(obj, {w:1},
			(err, res) => {
			if (err) throw err;
			console.log("shader saved in DB");	
		});
	};

	send_initial_sculps_from_db = (query, some_socket) => {
		db.collection(login.collection_name).find(query).toArray( function(err, result) {
			if (err) throw err;
			some_socket.emit('initial_sculps', result);
		});
	};

	io.on('connection', on_server_connection);

	nodeCleanup( (exit, signal) => { 
		client.close();
		console.log('closed mongo connection');
	});
}

function on_server_connection(socket) {
    send_initial_sculps_from_db({}, socket);
    io.emit('usr_connect', socket.id );
    console.log(socket.id + " has connected");
    let interv = setInterval( ((socket) => {send_player_updates(socket);}).bind(this, socket), 250);
    socket.on('client_update_player', (player) => recieve_player_update(player));
    socket.on('update_sculpt_in_db', (sculpt_info) => {
	    push_db(sculpt_info);
	    socket.broadcast.emit('single_sculpt_update', sculpt_info);
    });
    socket.on('disconnect', (interv) => {
	if (interv) clearInterval(interv);
	console.log(socket.id + " has disconnected");
	banned_players.add(socket.id);
	delete players[socket.id];
	socket.broadcast.emit('usr_disconnect', socket.id);
    });
}

function recieve_player_update(player) {
	if (!(player.ID in players) && !banned_players.has(player.ID)) {
		players[player.ID] = {
			ID : player.ID,
			quat : player.quat, 
			position : player.position, 
	       		color : player.color,
			};
	} else {
		const p = players[player.ID];
		p.quat = player.quat;
		p.position = player.position;
		p.color = player.color;
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
