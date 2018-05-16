import * as THREE from './three.module.js';

export class Player {

        constructor() {

		// initialize this to most recent position
		this.tranform = new THREE.Object3D();
		//this.position = new THREE.Vector3();
		//this.rotation_y = 0;
		//this.rotation_x = 0;
		this.move_speed = 0.01;
		this.look_speed = 0.01;
		this.movement = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			up: false,
			down: false
		};
	}

	update() {
		let m = this.movement;
		
	}

	key_event(mode, e) {
		let m = this.movement;
		console.log(e);
		switch (e.key) {
			case 'w':
				m.forward = mode;
				break;
			case 's':
				m.backward = mode;
				break;
			case 'a':
				m.left = mode;
				break;
			case 'd':
				m.right = mode;
				break;
		}
	}


}
