function load_shader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
}

export function shader(gl, vs_source, fs_source, attributes, uniforms) {
	const vs = load_shader(gl, gl.VERTEX_SHADER, vs_source);
	const fs = load_shader(gl, gl.FRAGMENT_SHADER, fs_source);

	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	var sh = {
		program: prog, attribs: {}, uniforms: {},
		check: function() {
			var errors = {};
			if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
				errors.vs = gl.getShaderInfoLog(vs);
				console.log('vertex shader error: ' + errors.vs);
				gl.deleteShader(vs);
			}
			if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
				errors.fs = gl.getShaderInfoLog(fs);
				console.log('fragment shader error: ' + errors.fs);
				gl.deleteShader(fs);
			}
			if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
				errors.prog = gl.getProgramInfoLog(prog);
				console.log('shader link error: ' + errors.prog);
			}
			return errors;
		}
	};

	for(var i = 0; i < attributes.length; ++i) {
		sh.attribs[attributes[i]] = gl.getAttribLocation(prog, attributes[i]);
	}
	
	for(var i = 0; i < uniforms.length; ++i) {
		sh.uniforms[uniforms[i]] = gl.getUniformLocation(prog, uniforms[i]);
	}

	return sh;
}


export function mesh(gl, positions, indices) {
	const posbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posbuf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	const idxbuf = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxbuf);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	// buffer objects stored in closures
	return {
		bind: function(shader) {
			gl.bindBuffer(gl.ARRAY_BUFFER, posbuf);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxbuf);
			gl.vertexAttribPointer(shader.attribs.position, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(shader.attribs.position);
		},
		draw: function() {
			gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		}
	};
}


export const cube_positions = [
	// Front face
	-0.5, -0.5,  0.5,
	0.5, -0.5,  0.5,
	0.5,  0.5,  0.5,
	-0.5,  0.5,  0.5,

	// Back face
	-0.5, -0.5, -0.5,
	-0.5,  0.5, -0.5,
	0.5,  0.5, -0.5,
	0.5, -0.5, -0.5,

	// Top face
	-0.5,  0.5, -0.5,
	-0.5,  0.5,  0.5,
	0.5,  0.5,  0.5,
	0.5,  0.5, -0.5,

	// Bottom face
	-0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, -0.5,  0.5,
	-0.5, -0.5,  0.5,

	// Right face
	0.5, -0.5, -0.5,
	0.5,  0.5, -0.5,
	0.5,  0.5,  0.5,
	0.5, -0.5,  0.5,

	// Left face
	-0.5, -0.5, -0.5,
	-0.5, -0.5,  0.5,
	-0.5,  0.5,  0.5,
	-0.5,  0.5, -0.5,
];
export const cube_indices = [
	0,  1,  2,      0,  2,  3,    // front
	4,  5,  6,      4,  6,  7,    // back
	8,  9,  10,     8,  10, 11,   // top
	12, 13, 14,     12, 14, 15,   // bottom
	16, 17, 18,     16, 18, 19,   // right
	20, 21, 22,     20, 22, 23,   // left
];

