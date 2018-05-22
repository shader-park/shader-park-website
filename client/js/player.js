import * as THREE from './three.module.js';

export class Player {

        constructor() {

		// Generate ID. This could be replaced with an actual login system
		this.ID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4) + 
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4) +
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4) +
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);

		this.color = { r : Math.random(), g : Math.random(), b : Math.random() };
		// initialize this to most recent position
		this.transform = new THREE.Object3D();
		this.velocity = new THREE.Vector3();
		this.rot_vel = 0.0;
		this.move_speed = 0.012;
		this.vel_damp = 0.85;
		this.look_speed = 0.012;
		this.rot_damp = 0.8;
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
		if (m.forward) this.velocity.sub( dir );
		if (m.backward) this.velocity.add( dir );
		if (m.left) this.rot_vel += this.look_speed;
		if (m.right) this.rot_vel -= this.look_speed;
		this.rot_vel *= this.rot_damp;
		t.rotation.y += this.rot_vel;
		this.velocity.multiplyScalar(this.vel_damp);
		t.position.add(this.velocity);
	}

	nudge(dir) {
		console.log(dir);
		this.velocity.add(dir);
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
