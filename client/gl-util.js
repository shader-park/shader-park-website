export function shader(gl, vs_source, fs_source, attributes, uniforms) {
	function load_shader(type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log('shader error: ' + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	const vs = load_shader(gl.VERTEX_SHADER, vs_source);
	const fs = load_shader(gl.FRAGMENT_SHADER, fs_source);

	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	if(!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.log('shader link error: ' + gl.getProgramInfoLog(prog));
		return null;
	}

	var sh = { program: prog, attribs: {}, uniforms: {} };

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


