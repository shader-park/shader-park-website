import * as THREE from './three.module.js';
import { Sculpture } from './sculpture.js';
import { collides_grid, get_normal } from './collider.js';
import { Player } from './player.js';

var scene, sculp, player, grid, boxes, point_lights, room, camera, controls, renderer;

function init() {
	
	grid = { x: 3, z: 3, spacing: 4.0, size: 1.0 };
	let ceiling_height = 2.0;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.03, 80 );
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );

	player = new Player();
	document.addEventListener('keydown', player.key_event.bind(player, true));
	document.addEventListener('keyup', player.key_event.bind(player, false));
	player.transform.position.z -= grid.spacing/2;
	player.transform.add( camera );
	scene.add(player.transform);
	
	let roomGeo = new THREE.BoxBufferGeometry( 
		grid.x*grid.spacing, 
		ceiling_height, 
		grid.z*grid.spacing );

	let roomMat = new THREE.MeshStandardMaterial( { 
		color: new THREE.Color( 0.9, 0.9, 0.9),
		roughness: 0.82,
		metalness: 0.01,
       		side: THREE.BackSide } );
	
	room = new THREE.Mesh( roomGeo, roomMat );
	scene.add( room );

	boxes = create_boxes(grid, grid.spacing, grid.size);
	boxes.position.y -= ceiling_height/2;
	scene.add( boxes );

	sculp = new Sculpture("test_obj", 0, 0, 1.0);
	scene.add( sculp.mesh );

	point_lights = new THREE.Group();
	let l_count = 4;
	for (let i=0; i<4; i++) {
		let pl = new THREE.PointLight(0xdddddd, 0.4);
		let ang = i*2.0*Math.PI/l_count;
		pl.position.x = Math.sin(ang)*grid.spacing/2;
		pl.position.z = Math.cos(ang)*grid.spacing/2;
		point_lights.add(pl);
	}
	scene.add(point_lights);
	point_lights.position.y = 1;
	let hemisphereLight = new THREE.HemisphereLight(0x8899cc, 0x334455);
	scene.add(hemisphereLight);
}

function render() {
	
	requestAnimationFrame( render );
	let t = Date.now();
	//controls.update();
	player.update();
	/*
	if (collides_grid( player.transform.position, grid)) {
		player.nudge( get_normal(player.transform.position, grid).multiplyScalar(0.02) );
	}
	*/
	//let group = scene.children[0];
	//group.position.x += 0.0003*Math.sin(0.001*t);
	//group.position.y += 0.00037*Math.cos(0.0014*t);
	/*
	for (var i = 0; i < group.children.length; i++ ) {
		group.children[i].rotation.x += 0.01;
	}
	/*/
	/*
	sculp.mesh.position.x = Math.sin(t*0.0005)+Math.cos(t*0.0005+3.0);
	sculp.mesh.position.y = Math.sin(t*0.0005);
	sculp.mesh.position.z = Math.cos(t*0.0005);
	*/
	sculp.update_uniforms( {
		sculpture_center: {value:sculp.mesh.position}
	} );

	renderer.render(scene, camera);
};

init();
render();


/* create background scene */
function create_boxes(grid) {
	// create grid of cubes
	let half_grid_x = Math.floor(grid.x / 2);
	let half_grid_z = Math.floor(grid.z / 2);
	let geometry = 
		new THREE.BoxBufferGeometry( grid.size, grid.size, grid.size);
	let boxes = new THREE.Group();
	// Create Objects in a loop
	for (let i = 0; i < grid.x; i++ ) {
		for (let j = 0; j < grid.z; j++) {
				let material = new THREE.MeshStandardMaterial( { 
					color: new THREE.Color( 
						Math.random(), 
						Math.random(), 
						Math.random()),
			       		roughness: 0.82,
					metalness: 0.01	} );
				let box = new THREE.Mesh( geometry, material );
				box.position.x = grid.spacing*(i-half_grid_x);
				box.position.y = 0.0;
				box.position.z = grid.spacing*(j-half_grid_z);
				boxes.add( box );
		}
	}
	return boxes;
}
