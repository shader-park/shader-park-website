import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { Sculpture } from './sculpture.js';

var scene, camera, controls, renderer;

function init() {
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.z = 8;
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );

	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.zoomSpeed = 0.5;
	controls.rotateSpeed = 0.5;
	// controls.minDistance = 60;

	scene.add( create_room() );

	let sculp = new Sculpture("test_obj", 0, 0, 1.0);
	scene.add( sculp.mesh );

	let pointLight = new THREE.PointLight(0xdddddd, 0.5);
	scene.add(pointLight);
	pointLight.position.z = 12;
	let hemisphereLight = new THREE.HemisphereLight(0x8899cc, 0x334455);
	scene.add(hemisphereLight);
}

function render() {
	
	requestAnimationFrame( render );
	controls.update();
	let group = scene.children[0];
	//group.rotation.x += 0.003;
	//*
	for (var i = 0; i < group.children.length; i++ ) {
		group.children[i].rotation.x += 0.01;
	}
	//*/
	renderer.render(scene, camera);
};

init();
render();


/* create background scene */
function create_room() {
	// create grid of cubes
	let gridDimension = 5;
	let halfgrid = Math.floor(gridDimension / 2);
	let geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5);
	let boxes = new THREE.Group();
	// Create Objects in a loop
	for (var i = 0; i < gridDimension; i++ ) {
		for (var j = 0; j < gridDimension; j++) {
			for (var k = 0; k < gridDimension; k++) {
				var material = new THREE.MeshStandardMaterial( { 
					color: new THREE.Color( Math.random(), Math.random(), Math.random()) } );
				var box = new THREE.Mesh( geometry, material );
				box.position.x = (i-halfgrid);
				box.position.y = (j-halfgrid);
				box.position.z = (k-halfgrid);
				boxes.add( box );
			}
		}
	}
	return boxes;
}
