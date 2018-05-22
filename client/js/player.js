import * as THREE from './three.module.js';

export class Player {

        constructor(id) {

		// Generate ID. This could be replaced with an actual login system
		// scratch that. This with now be recieved from server
		this.ID = id;
		/*
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4) + 
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4) +
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4) +
			  Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
		*/
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
		const m = this.movement;
		const t = this.transform;
		const dir = new THREE.Vector3();
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
		const m = this.movement;
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
	
	// creates a goofy looking player mesh
	static create_player_mesh(color) {
	    const mat = new THREE.MeshStandardMaterial(
		{color: new THREE.Color(color.r, color.g, color.b)});
	    const geo = new THREE.SphereGeometry(0.2, 50, 50);
	    const m = new THREE.Mesh(geo,mat)

	    const eyeMat = new THREE.MeshStandardMaterial({color:0xffffff});
	    const eyeGeo = new THREE.SphereGeometry(0.1, 32, 32);
	    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
	    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
	    const pupilMat = new THREE.MeshStandardMaterial({color:0x000000});
	    const pupilGeo = new THREE.SphereGeometry(0.05, 16, 16);
	    const lPupil = new THREE.Mesh(pupilGeo, pupilMat);
	    const rPupil = new THREE.Mesh(pupilGeo, pupilMat);
	    lPupil.position.z -= 0.055;
	    rPupil.position.z -= 0.055;
	    lEye.add(lPupil);
	    rEye.add(rPupil);

	    lEye.position.y += 0.1;
	    lEye.position.x += 0.12;
	    lEye.position.z -= 0.085;

	    rEye.position.y += 0.1;
	    rEye.position.x -= 0.12;
	    rEye.position.z -= 0.085;
	    m.add(lEye);
	    m.add(rEye);

	    return m;
	}

}
