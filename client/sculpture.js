export class Sculpture {
	constructor(gl, id, mesh) {
		this.id = id;
		this.shader = null;
		this.position = null;
		this.aabb = null;
		this.mesh = mesh;
		this.refresh(gl);
	}

	refresh(gl) {
	}

	render(gl, t, dt, applyUniforms) {
		if(this.shader == null) {
			// unloaded
		} else if(this.shader.error) {
			// in an error state
		}
		else {
			gl.useProgram(this.shader.program);
			this.mesh.bind(this.shader);
			applyUniforms(this.shader);
			var T = mat4.create();
			mat4.fromTranslation(T, this.position);
			var ext = vec3.create();
			vec3.subtract(ext, this.aabb.max, this.aabb.min);
			mat4.scale(T,T,ext);
			gl.uniformMatrix4fv(this.shader.uniforms.W, false, T);
			this.mesh.draw();
		}
	}
}
