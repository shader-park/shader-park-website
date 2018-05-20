import * as THREE from './three.module.js';
import { Sculpture } from './sculpture.js';
import { collides_grid, get_normal } from './collider.js';
import { Player } from './player.js';
import { Editor } from './editor.js';

var scene, sculps, player, grid, point_lights, room, highlight_box,
    camera, renderer, start_time, editor, mouse, raycaster,
    current_sel;


function init() {
	
	grid = { x: 3, z: 3, spacing: 4.0, size: 1.0, ceiling: 2.0 };

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.03, 80 );
	renderer = new THREE.WebGLRenderer({antialias:false});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );
	mouse = new THREE.Vector2();
	raycaster = new THREE.Raycaster();
	current_sel = null;
	editor = new Editor(renderer);
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('click', onMouseClick, false);
	document.addEventListener('mousemove', onMouseMove, false);
	document.addEventListener('keydown', keypress.bind(null,true));
	document.addEventListener('keyup', keypress.bind(null,false));

	player = new Player();
	player.transform.position.z -= grid.spacing/2;
	player.transform.add( camera );
	scene.add(player.transform);
	
	let room_geo = new THREE.BoxBufferGeometry( 
		grid.x*grid.spacing, 
		grid.ceiling, 
		grid.z*grid.spacing );

	let room_mat = new THREE.MeshStandardMaterial( { 
		color: new THREE.Color( 0.6, 0.6, 0.6),
		roughness: 0.82,
		metalness: 0.01,
       		side: THREE.BackSide } );
	
	room = new THREE.Mesh( room_geo, room_mat );
	scene.add( room );

	highlight_box = create_hl_box(grid);
	scene.add( highlight_box );

	sculps = create_sculps(grid, grid.spacing, grid.size);
	scene.add( sculps );

	// setup lights
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
	let meshes = sculps.children;
	for (let s in meshes) {
		let sc = meshes[s];
		sc.sculpRef.update_uniforms( {
			sculpture_center: { value: sc.position },
			time: { value: t*0.004 }
		} );
	}

	if (!editor.visible) {
		raycaster.setFromCamera(mouse, camera);
		let intersects = raycaster.intersectObjects( sculps.children );
		if (intersects.length > 0) {
			let i = intersects[0];
			highlight_box.position.x = i.object.position.x;
			highlight_box.position.z = i.object.position.z;
			highlight_box.visible = true;
			current_sel = i.object.sculpRef;
		} else {
			highlight_box.visible = false;
			current_sel = null;
		}
	}

	renderer.render(scene, camera);
};

init();
render();

function keypress(down, e) {
	if(e.target.nodeName === "BODY") {
		if(e.key === 'e' && !editor.visible) {
			let meshes = sculps.children;
			for (let s in meshes) {
				let sc = meshes[s];
				if (sc.position.distanceToSquared(player.transform.position) < 4.0) {
					editor.show(sc.sculpRef);
					break;
				}
			}
		}
		player.key_event(down, e);
	}
}

// Raycast to sculptures
function onMouseMove(event) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onMouseClick(event) {
	if (current_sel !== null && !editor.visible) {
		editor.show(current_sel);
		current_sel = null;
	}
}

function onWindowResize() {
	console.log("changing window");
    	camera.aspect = window.innerWidth / window.innerHeight;
    	camera.updateProjectionMatrix();
    	renderer.setSize( window.innerWidth, window.innerHeight );
}

function create_hl_box(grid) {
	let edges = new THREE.Group();
	let hl_geo = new THREE.BoxBufferGeometry( grid.size/32, grid.size, grid.size/32 );
	let hl_mat = new THREE.MeshStandardMaterial( { color: 0xffffff } );
	let a = new THREE.Mesh( hl_geo, hl_mat );
	let b = new THREE.Mesh( hl_geo, hl_mat );
	let c = new THREE.Mesh( hl_geo, hl_mat );
	let d = new THREE.Mesh( hl_geo, hl_mat );
	let offset = 0.5*grid.size;
	a.position.x -= offset;
	a.position.z -= offset;
	b.position.x -= offset;
	b.position.z += offset;
	c.position.x += offset;
	c.position.z -= offset;
	d.position.x += offset;
	d.position.z += offset;
	edges.add( a );
	edges.add( b );
	edges.add( c );
	edges.add( d );
	edges.position.y -= grid.size*1.05;
	return edges;
}

/* create background scene */
function create_sculps(grid) {
	// create grid of cubes
	let half_grid_x = Math.floor(grid.x / 2);
	let half_grid_z = Math.floor(grid.z / 2);
	let geometry = 
		new THREE.BoxBufferGeometry( grid.size, grid.size, grid.size);
	let sculptures = new THREE.Group();
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
			sculp.mesh.position.x =  grid.spacing*(i-half_grid_x);
			sculp.mesh.position.z =  grid.spacing*(j-half_grid_z);
			box.position.y = -grid.ceiling/2;
			sculp.mesh.add( box );
			sculptures.add( sculp.mesh );
		}
	}
	return sculptures;
}
