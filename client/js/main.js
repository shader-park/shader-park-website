import * as THREE from './three.module.js';
import { Sculpture } from './sculpture.js';
import { collides_grid, get_normal } from './collider.js';
import { Player } from './player.js';

var scene, sculps, player, grid, point_lights, room, camera, controls, renderer, start_time;

function init() {
	
	grid = { x: 3, z: 3, spacing: 4.0, size: 1.0, ceiling: 2.0 };

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
		grid.ceiling, 
		grid.z*grid.spacing );

	let roomMat = new THREE.MeshStandardMaterial( { 
		color: new THREE.Color( 0.9, 0.9, 0.9),
		roughness: 0.82,
		metalness: 0.01,
       		side: THREE.BackSide } );
	
	room = new THREE.Mesh( roomGeo, roomMat );
	scene.add( room );

	sculps = create_sculps(grid, grid.spacing, grid.size);
	//sculps.position.y -= ceiling_height/2;
	scene.add( sculps );

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
	start_time = Date.now();

	var edit_div = document.getElementById('editor');
	var cm = CodeMirror(edit_div, {
		value: "int main() { }",
		mode: "text/x-csrc",
		lineNumbers: true
	});
	edit_div.style.visibility = "hidden";
	document.addEventListener('keydown', (e) => {
		console.log(e);
		if(e.key == 'e') {
			edit_div.style.visibility = (edit_div.style.visibility == 'hidden') ? 'visible' : 'hidden';
		}
	});
}

function render() {
	
	requestAnimationFrame( render );
	let t = Date.now()-start_time;

	player.update();
	/*
	if (collides_grid( player.transform.position, grid)) {
		player.nudge( get_normal(player.transform.position, grid).multiplyScalar(0.02) );
	}
	*/

	// update all sculpture uniforms
	let meshes = sculps.children[0].children;
	for (let s in meshes) {
		let sc = meshes[s];
		sc.sculpRef.update_uniforms( {
			sculpture_center: { value: sc.position },
			time: { value: t*0.004 }
		} );
	}

	renderer.render(scene, camera);
};

init();
render();


/* create background scene */
function create_sculps(grid) {
	// create grid of cubes
	let half_grid_x = Math.floor(grid.x / 2);
	let half_grid_z = Math.floor(grid.z / 2);
	let geometry = 
		new THREE.BoxBufferGeometry( grid.size, grid.size, grid.size);
	let all = new THREE.Group();
	let sculptures = new THREE.Group();
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
			let sculp = new Sculpture("test_obj", 0, 0, 1.0);
			sculp.mesh.sculpRef = sculp;
			box.position.x =  grid.spacing*(i-half_grid_x);
			box.position.y = -grid.ceiling/2;
			box.position.z =  grid.spacing*(j-half_grid_z);
			sculp.mesh.position.x = box.position.x;
			sculp.mesh.position.z = box.position.z;
			sculptures.add( sculp.mesh );
			boxes.add( box );
		}
	}
	all.add(sculptures);
	all.add(boxes);
	return all;
}
