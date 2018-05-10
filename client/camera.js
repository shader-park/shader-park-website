export class Camera {
	constructor(position, target, speed) {
		this.position = position;
		this.look = vec3.create();
		vec3.subtract(this.look, target, this.position);
		vec3.normalize(this.look, this.look);
		this.up = [0.0, 0.0, 1.0];
		this.right = vec3.create();
		vec3.cross(this.right, this.look, this.up);
		this.speed = speed;
		this.inp = [0.0, 0.0, 0.0];
		this.ina = [0.0, 0.0];
		document.addEventListener('keydown', (e) => this.on_keypress(e, true));
		document.addEventListener('keyup', (e) => this.on_keypress(e, false));
		document.addEventListener('mousemove', (e) => this.on_mousemove(e));
	}

	on_keypress(e, down) {
		switch(e.keyCode) {
			case 65:
				this.inp[0] = down ? -1.0 : 0.0;
				break;
			case 68:
				this.inp[0] = down ? 1.0 : 0.0;
				break;
			case 87:
				this.inp[1] = down ? 1.0 : 0.0;
				break;
			case 83:
				this.inp[1] = down ? -1.0 : 0.0;
				break;
			case 81:
				this.inp[2] = down ? 1.0 : 0.0;
				break;
			case 69:
				this.inp[2] = down ? -1.0 : 0.0;
				break;
		}
	}

	on_mousemove(e) {
		
	}

	projection_matrix(P, gl) {
		mat4.perspective(P, Math.PI/4, gl.canvas.clientWidth/gl.canvas.clientHeight, 0.01, 100.0);
	}

	view_matrix(V) {
		var targ = vec3.create();
		vec3.add(targ, this.position, this.look);
		mat4.lookAt(V, this.position, targ, this.up);
	}

	update(dt) {
		var v = vec3.create();
		vec3.scaleAndAdd(v, v, this.right, this.inp[0]);
		vec3.scaleAndAdd(v, v, this.look, this.inp[1]);
		vec3.scaleAndAdd(v, v, this.up, this.inp[2]);
		vec3.scaleAndAdd(this.position, this.position, v, dt*this.speed);
	}
}
