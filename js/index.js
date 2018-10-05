import firebase from 'firebase/app';
import io from 'socket.io-client';
import * as THREE from 'three';
import * as OrbitControls from  './THREE_Helpers/OrbitControls.js'
import TWEEN from '@tweenjs/tween.js';
import Vue from 'vue';
import VModal from 'vue-js-modal'
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';

import App from './App.vue';
import {dbConfig} from './dbConfig.js';
import {Player} from './player.js';
import {routes} from './router/routes';
import {store} from './store/store';


firebase.initializeApp(dbConfig);
Vue.use(VueRouter);

Vue.use(VModal, {dialog: true});
Vue.use(Vuelidate);
// Vue.use(window['vue-js-modal'].default, { dialog: true });
Vue.config.devtools = true;
Vue.config.productionTip = false;
window.db = firebase.database();

const router = new VueRouter({routes: routes, mode: 'history'});

router.beforeEach((to, from, next) => {
	const currentUser = firebase.auth().currentUser;
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
	if (requiresAuth && !currentUser) {
		next('/sign-in');
	} else if (requiresAuth && currentUser) {
		next();
	} else {
		next();
	}
});

firebase.auth().onAuthStateChanged(function(user) {
	new Vue({el: '#app', store: store, router: router, render: h => h(App)});
});

const scene = store.state.scene;
scene.background = new THREE.Color(0.98, 0.98, 0.98);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0001, 180);
camera.position.z = 2;

// var camera = new THREE.OrthographicCamera(
//   window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000);
window.camera = camera;
const socket = io();
store.state.socket = socket;

let player;

// setInterval(sendPlayerPosToServer, 250);
// used to update positions of players in the same room
let localPlayers = {};
let remotePlayers = {};

function sendPlayerPosToServer() {
	if (store.state.currentRoom) {
		const pt = player.transform;
		//TODO only call this if the pos Moved
		socket.emit('clientTellServerUpdatePlayerPosition', {
			id: player.id,
			room: store.state.currentRoom,
			quat: pt.quaternion,
			position: pt.position,
			color: player.color
		});
	}
}

socket.on('serverTellPlayersUpdate', playersInRoom => {
	console.log(playersInRoom);
	remotePlayers = playersInRoom;
});

// socket.on('userConnect', (id) => {
// 	player = new Player(id);
// 	player.transform.add(camera);
// 	player.transform.position.z = 2;
// 	window.player = player;

// 	scene.add(player.transform);
// 	player.id = id;
// 	console.log(id + ' has connected');
// });

socket.on('userDisconnect', (id) => {
	console.log(id + ' has disconnected');
	if(id in localPlayers) {
		const l = localPlayers[id];
		if (l !== undefined) {
			scene.remove(l.mesh);
			delete localPlayers[id];
		}
	}
  
});

function updateRemotePlayers() {
	for (let id in remotePlayers) {
		// skip creating a mesh for our own player
		if (player.id && id === player.id) continue;

		const pr = remotePlayers[id];
		if (!(id in localPlayers)) {
			localPlayers[id] = {
				id: id,
				color: pr.color,
				mesh: Player.createPlayerMesh(pr.color)
			};
			localPlayers[id].mesh.position.set(pr.position.x, pr.position.y, pr.position.z);
			scene.add(localPlayers[id].mesh);
		}
		const pm = localPlayers[id].mesh;
		// use interpolation here rather than just updating
		const t = 0.03;
		pm.position.lerp(pr.position, t);
		const q = new THREE.Quaternion(pr.quat._x, pr.quat._y, pr.quat._z, pr.quat._w);
		pm.quaternion.slerp(q, t);
		// pm.setRotationFromQuaternion(q);
	}
}

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
console.log(controls);
console.log('ORBITcontrols');
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.zoomSpeed = 0.5;
controls.rotateSpeed = 0.5;
controls.keys = {
  LEFT: 65,
  UP: 87,
  RIGHT: 68,
  BOTTOM: 83
};
window.controls = controls;

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF);
const startTime = Date.now();
scene.add(hemisphereLight);

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('keydown', keyPress.bind(null, true));
document.addEventListener('keyup', keyPress.bind(null, false));
const canvas = document.querySelector('canvas');
canvas.setAttribute('tabindex', '0');
canvas.addEventListener('click', (event) => {
	console.log(event.target);
	event.target.focus();
});
	

render();

function render(time) {
	requestAnimationFrame(render);
	const t = Date.now() - startTime;
	store.state.objectsToUpdate.forEach(sculpture => {
		sculpture.update(t);
	})

	const objectsToRaycast = store.state.objectsToRaycast;
	if (objectsToRaycast && store.state.selectedSculpture === null) {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(objectsToRaycast);
		if(intersects.length > 0) {
			canvas.style.cursor = 'pointer';
			store.state.intersectedObject = intersects[0].object;
		} else {
			canvas.style.cursor = 'auto';
			store.state.intersectedObject = null;
		}
	}
	TWEEN.update(time);
	if(player) player.update();
	// updateRemotePlayers();
	controls.update();
	renderer.render(scene, camera);	

}

function keyPress(down, e) {
	if (e.target.nodeName === 'BODY') {
		// player.keyEvent(down, e);
	}
}

// Raycast to sculptures
function onMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

let tempIntersectedObject;
function onMouseDown(event) {
	if(store.state.intersectedObject) {
        tempIntersectedObject = store.state.intersectedObject;
	} else {
		store.state.selectedObject = null;
	}
}

function onMouseUp(event) {
	if(store.state.selectedObject) return;
	if (store.state.intersectedObject && store.state.intersectedObject === tempIntersectedObject) {
		store.state.selectedObject = store.state.intersectedObject;
		canvas.style.cursor = 'auto';
		let endTargetPos = new THREE.Vector3();
		endTargetPos.getPositionFromMatrix(store.state.selectedObject.matrixWorld);
		// endTargetPos.x += 1;
		
		let camTarget = new THREE.Vector3().copy(controls.target);
		let tweenControlsTarget = new TWEEN.Tween(camTarget)
			.to(endTargetPos, 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(function () {
				controls.target.set(camTarget.x, camTarget.y, camTarget.z);
				console.log('tweaning target');
			});
		let camPos = new THREE.Vector3().copy(camera.position);
		let endCamPos = new THREE.Vector3().copy(endTargetPos);
		endCamPos.z += 2;
		let tweenCamera = new TWEEN.Tween(camPos)
			.to(endCamPos, 1000)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(function () {
				console.log('tweaning cama');
				camera.position.set(camPos.x, camPos.y, camPos.z);
			});
		tweenCamera.start();
		tweenControlsTarget.start();
		
		
	} else {
		store.state.selectedObject = null;
	}
	tempIntersectedObject = null;
}

function onMouseClick(event) {
	if (store.state.intersectedObject) {
		console.log('clicked on object');
		canvas.style.cursor = 'auto';
		store.state.selectedObject = store.state.intersectedObject;
		
	} else {
		store.state.selectedObject = null;
	}
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}


/*
var scene, sculps, player, grid, point_lights, room, highlight_box, camera,
	renderer, startTime, editor, mouse, raycaster, selectedSculpture, socket,
	players_remote, players_local;

const socket = io();
store.state.socket = socket;
socket.on('initial_sculps', (existing_sculps) => {
	//init(socket.id, existing_sculps);
});
socket.on('single_sculpt_update', (updated_sculpt_info) => {
	const sculpt_to_update = sculps.children.filter(s => s.sculpRef.ID === updated_sculpt_info._id)[0].sculpRef;
	sculpt_to_update.set_shader_source(
		updated_sculpt_info.source, 
		updated_sculpt_info.name,
		updated_sculpt_info.author);
	console.log('reloaded ' + updated_sculpt_info._id);
});
socket.on('usr_connect', (id) => {
	console.log(id + ' has connected');
});
socket.on('server_player_updates', (players_from_server) => {
	players_remote = players_from_server;
});
socket.on('usr_disconnect', (id) => {
	console.log(id + ' has disconnected');
	const l = players_local[id];
	if (l !== undefined) {
		scene.remove(l.mesh);
		delete players_local[id];
	}
});


	// const editor = new Editor(renderer);

	function init(socket_id, existing_sculps) {
		players_local = {};
		grid = {x: 27, z: 7, spacing: 4.0, size: 1.0, ceiling: 2.0};

		// scene = new THREE.Scene();
		scene = store.state.scene;
		scene.background = new THREE.Color(1, 1, 1);
		camera = new THREE.PerspectiveCamera(
				75, window.innerWidth / window.innerHeight, 0.03, 180);
		renderer = new THREE.WebGLRenderer({antialias: false});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setPixelRatio(window.devicePixelRatio);
		document.body.appendChild(renderer.domElement);
		mouse = new THREE.Vector2();
		raycaster = new THREE.Raycaster();
		selectedSculpture = null;
		editor = new Editor(renderer);

		const room_geo = new THREE.BoxBufferGeometry(
				grid.x * grid.spacing, grid.ceiling, grid.z * grid.spacing);

		const room_mat = new THREE.MeshBasicMaterial(
				{color: new THREE.Color(1.0, 1.0, 1.0), side: THREE.BackSide});

		room = new THREE.Mesh(room_geo, room_mat);
		// scene.add(room);

		highlight_box = create_hl_box(grid);
		scene.add(highlight_box);

		sculps = create_sculps(grid, existing_sculps, socket);

		scene.add(sculps);

		// setup lights
		point_lights = new THREE.Group();
		const l_count = 5;
		for (let i = 0; i < l_count; i++) {
			const pl = new THREE.PointLight(0xdddddd, 0.4);
			const ang = i * 2.0 * Math.PI / l_count;
			pl.position.x = 3.0 * Math.sin(ang) * grid.spacing / 2;
			pl.position.z = 3.0 * Math.cos(ang) * grid.spacing / 2;
			point_lights.add(pl);
		}
		// scene.add(point_lights);
		point_lights.position.y = 1;
		const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF);
		scene.add(hemisphereLight);

		window.addEventListener('resize', onWindowResize, false);
		window.addEventListener('click', onMouseClick, false);
		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('keydown', keypress.bind(null, true));
		document.addEventListener('keyup', keypress.bind(null, false));

		setup_player(socket_id);

		startTime = Date.now();
	}

	function setup_player(id) {
		player = new Player(id);
		player.transform.position.z -= grid.spacing / 2;
		player.transform.add(camera);
		scene.add(player.transform);
		setInterval(send_position_to_server, 250);
		render();
	}

	function send_position_to_server() {
		const pt = player.transform;
		socket.emit('client_update_player', {
			ID: player.ID,
			quat: pt.quaternion,
			position: pt.position,
			color: player.color
		});
	}

	function render() {
		requestAnimationFrame(render);
		const t = Date.now() - startTime;
		point_lights.position.copy(player.transform.position);
		player.update();
		// if (collides_grid( player.transform.position, grid)) {
		//                 player.nudge( get_normal(player.transform.position,
		// grid).multiplyScalar(0.02) );
		// }

		// incorporate data from server into the clients scene
		for (let id in players_remote) {
			// skip creating a mesh for our own player
			if (id === player.ID) continue;
		
			const pr = players_remote[id];
			if (!(id in players_local)) {
				players_local[id] = {
					ID: id,
					color: pr.color,
					mesh: Player.create_player_mesh(pr.color)
				};
				scene.add(players_local[id].mesh);
			}
			const pm = players_local[id].mesh;
			// use interpolation here rather than just updating
			const t = 0.03;
			pm.position.lerp(pr.position, t);
			const q =
					new THREE.Quaternion(pr.quat._x, pr.quat._y, pr.quat._z, pr.quat._w);
			pm.quaternion.slerp(q, t);
			// pm.setRotationFromQuaternion(q);
		}

		// update all sculpture uniforms
		const meshes = sculps.children;
		for (let s in meshes) {
			let sc = meshes[s];
			sc.sculpRef.update(t * 0.001);
		}

		if (!editor.visible) {
			raycaster.setFromCamera(mouse, camera);
			const intersects = raycaster.intersectObjects(sculps.children);
			if (intersects.length > 0) {
				const i = intersects[0];
				highlight_box.position.x = i.object.position.x;
				highlight_box.position.z = i.object.position.z;
				highlight_box.visible = true;
				selectedSculpture = i.object.sculpRef;
			} else {
				highlight_box.visible = false;
				selectedSculpture = null;
			}
		}

		renderer.render(scene, camera);
	};

	function keypress(down, e) {
		if (e.key === 'Escape' && editor.visible) {
			editor.close();
		}
		if (e.key === 'Enter' && e.altKey && editor.visible) {
			editor.compile();
		}
		if (e.target.nodeName === 'BODY') {
			if (e.key === 'e' && !editor.visible) {
				const meshes = sculps.children;
				for (let s in meshes) {
					const sc = meshes[s];
					if (sc.position.distanceToSquared(player.transform.position) <
							grid.spacing) {
						editor.show(sc.sculpRef);
						selectedSculpture = null;
						break;
					}
				}
			}
			player.key_event(down, e);
		}
	}
*/
