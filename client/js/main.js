import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { Sculpture } from './sculpture.js';
import { Player } from './player.js';

var scene, sculp, player, grid, boxes, room, camera, controls, renderer;

function init() {
	
	grid = { x: 4, z: 4 };
	let grid_size = 2.0;
	let box_size = 1.0;
	let ceiling_height = 2.0;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.03, 80 );
	camera.position.z = 4;
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );

	//controls = new OrbitControls( camera, renderer.domElement );
	//controls.enableDamping = true;
	//controls.dampingFactor = 0.25;
	//controls.zoomSpeed = 0.5;
	//controls.rotateSpeed = 0.5;
	// controls.minDistance = 60;
	player = new Player();
	document.addEventListener('keydown', player.key_event.bind(player, true));
	document.addEventListener('keyup', player.key_event.bind(player, false));

	let roomGeo = new THREE.BoxBufferGeometry( grid.x*grid_size, ceiling_height, grid.z*grid_size );
	let roomMat = new THREE.MeshStandardMaterial( { 
		color: new THREE.Color( 0.9, 0.9, 0.9),
       		side: THREE.BackSide } );
	room = new THREE.Mesh( roomGeo, roomMat );
	scene.add( room );

	scene.add( create_boxes(grid, grid_size, box_size) );

	sculp = new Sculpture("test_obj", 0, 0, 1.0);
	scene.add( sculp.mesh );

	let pointLight = new THREE.PointLight(0xdddddd, 0.5);
	scene.add(pointLight);
	pointLight.position.z = 12;
	let hemisphereLight = new THREE.HemisphereLight(0x8899cc, 0x334455);
	scene.add(hemisphereLight);
}

function render() {
	
	requestAnimationFrame( render );
	let t = Date.now();
	//controls.update();
	let group = scene.children[0];
	group.position.x += 0.0003*Math.sin(0.001*t);
	group.position.y += 0.00037*Math.cos(0.0014*t);
	//*
	for (var i = 0; i < group.children.length; i++ ) {
		group.children[i].rotation.x += 0.01;
	}
	//*/
	
	sculp.mesh.position.x = Math.sin(t*0.0005)+Math.cos(t*0.0005+3.0);
	sculp.mesh.position.y = Math.sin(t*0.0005);
	sculp.mesh.position.z = Math.cos(t*0.0005);
	sculp.update_uniforms( {
		sculpture_center: {value:sculp.mesh.position}
	} );

	renderer.render(scene, camera);
};

init();
render();


/* create background scene */
function create_boxes(grid, grid_size, box_size) {
	// create grid of cubes
	//let gridDimension = 5;
	let half_grid_x = Math.floor(grid.x / 2);
	let half_grid_z = Math.floor(grid.z / 2);
	let geometry = new THREE.BoxBufferGeometry( box_size, box_size, box_size);
	let boxes = new THREE.Group();
	// Create Objects in a loop
	for (let i = 0; i < half_grid_x; i++ ) {
		for (let j = 0; j < half_grid_z; j++) {
			//for (var k = 0; k < gridDimension; k++) {
				let material = new THREE.MeshStandardMaterial( { 
					color: new THREE.Color( Math.random(), Math.random(), Math.random()) } );
				let box = new THREE.Mesh( geometry, material );
				box.position.x = grid_size*(i-half_grid_x);
				box.position.y = 0.0;//0.4*(j-halfgrid);
				box.position.z = grid_size*(j-half_grid_z);
				boxes.add( box );
			//}
		}
	}
	return boxes;
}
