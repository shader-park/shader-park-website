import { Sculpture } from './sculpture.js';
import * as THREE from './three.module.js';

export function create_hl_box(grid) {
	const edges = new THREE.Group();
	const hl_geo = new THREE.BoxBufferGeometry( grid.size/32, grid.size, grid.size/32 );
	const hl_mat = new THREE.MeshStandardMaterial( { color: 0xffffff } );
	const a = new THREE.Mesh( hl_geo, hl_mat );
	const b = new THREE.Mesh( hl_geo, hl_mat );
	const c = new THREE.Mesh( hl_geo, hl_mat );
	const d = new THREE.Mesh( hl_geo, hl_mat );
	const offset = 0.5*grid.size;
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
export function create_sculps(grid, existing_sculps) {
	// create grid of cubes
	const half_grid_x = Math.floor(grid.x / 2);
	const half_grid_z = Math.floor(grid.z / 2);
	const geometry = 
		new THREE.BoxBufferGeometry( grid.size, grid.size, grid.size);
	const sculptures = new THREE.Group();
	let loaded_count = 0;
	// Create Objects in a loop
	for (let i = 0; i < grid.x; i++ ) {
		for (let j = 0; j < grid.z; j++) {
			const material = new THREE.MeshStandardMaterial( { 
				color: new THREE.Color( 
					0.2,//Math.random(), 
					0.2,//Math.random(), 
					0.2),//Math.random()),
				roughness: 0.92,
				metalness: 0.03	} );
			const box = new THREE.Mesh( geometry, material );
			const sculp_ID = (i+","+j);
			let existing = existing_sculps.filter( s => s._id === sculp_ID);
			const exists = existing.length === 1;
			if (exists) {
				existing = existing[0];
				loaded_count++;
			}
			const sculp = new Sculpture(
					sculp_ID,
					exists ? existing.name : 'Fresh',
					exists ? existing.author : 'Naturally Occurring', 
					i, j,
					(sculpt) => {
						socket.emit(
						'update_sculpt_in_db',
						sculpt.get_info());
					},
					exists ? existing.source : undefined );
			sculp.mesh.sculpRef = sculp;
			sculp.mesh.position.x =  grid.spacing*(i-half_grid_x);
			sculp.mesh.position.z =  grid.spacing*(j-half_grid_z);
			box.position.y = -grid.ceiling/2;
			sculp.mesh.add( box );
			sculptures.add( sculp.mesh );
		}
	}
	console.log("loaded " + loaded_count + " shaders")
	return sculptures;
}

	/*
	const floor_geo = new THREE.PlaneBufferGeometry(
			grid.x*(grid.spacing+grid.size), 
			grid.z*(grid.spacing+grid.size));

	const floor_mat = new THREE.MeshStandardMaterial({
		roughness: 0.8,
		//shininess: 20,
		color: 0xffffff,
		metalness: 0.2,
		bumpScale: 0.05,
		side: THREE.BackSide
		});

	const tex_loader = new THREE.TextureLoader();
	const load_tex_into_mat = (loader, mat, url, maptype) => {
		loader.load( url, ( map ) => {
			map.wrapS = THREE.RepeatWrapping;
			map.wrapT = THREE.RepeatWrapping;
			map.anisotropy = 4;
			map.repeat.set( 64, 24 );
			mat[maptype] = map;
			mat.needsUpdate = true;
		} );
	};
	
	/*
	load_tex_into_mat(tex_loader, floor_mat, 'textures/wood/Wood_floor_004_COLOR.jpg', 'map');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/wood/Wood_floor_004_DISP.jpg', 'displacementMap');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/wood/Wood_floor_004_NRM.jpg', 'normalMap');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/wood/Wood_floor_004_OCC.jpg', 'aoMap');
	//load_tex_into_mat(tex_loader, floor_mat, 'textures/wood/Wood_floor_004_SPEC.jpg', 'specularMap');
	* /
	load_tex_into_mat(tex_loader, floor_mat, 'textures/brick/Brick_Wall_012_COLOR.jpg', 'map');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/brick/Brick_Wall_012_DISP.png', 'bumpMap');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/brick/Brick_Wall_012_NORM.jpg', 'normalMap');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/brick/Brick_Wall_012_OCC.jpg', 'aoMap');
	load_tex_into_mat(tex_loader, floor_mat, 'textures/brick/Brick_Wall_012_ROUGH.jpg', 'roughnessMap');


	const floor = new THREE.Mesh( floor_geo, floor_mat );
	floor.position.y -= grid.ceiling*0.49;
	floor.rotation.x = Math.PI/2.0;
	scene.add(floor);
	//*/


