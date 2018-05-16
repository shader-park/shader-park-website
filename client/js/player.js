import * as THREE from './three.module.js';

export class Player {

        constructor() {

		// initialize this to most recent position
		this.transform = new THREE.Object3D();
		//this.position = new THREE.Vector3();
		//this.rotation_y = 0;
		//this.rotation_x = 0;
		this.move_speed = 0.06;
		this.look_speed = 0.04;
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
		let t = this.transform;
		let dir = new THREE.Vector3();
		t.getWorldDirection(dir);
		dir.multiplyScalar(this.move_speed);
		if (m.forward) t.position.sub( dir );
		if (m.backward) t.position.add( dir );
		if (m.left) t.rotation.y += this.look_speed;
		if (m.right) t.rotation.y -= this.look_speed;
	}

	key_event(mode, e) {
		let m = this.movement;
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
