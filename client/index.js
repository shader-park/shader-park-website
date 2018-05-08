

const vs_source = `#version 300 es
	in lowp vec4 position;
	uniform mat4 W;
	uniform mat4 VP;
	out lowp vec4 pos;
	void main() { pos = position; gl_Position = VP*W*position; }
`;

const fs_source = `#version 300 es
	in lowp vec4 pos;
	out lowp vec4 color;
	void main() { color = floor(abs(sin(pos*vec4(8.0, 3.0, 20.0, 1.0)))+0.5); }
`;

const depth_mod_fs_source = `#version 300 es
	in lowp vec4 pos;
	uniform lowp float time;
	out lowp vec4 color;
	void main() {
		color = (abs(sin(pos*vec4(8.0, 3.0, 20.0, 1.0)+time))).grba;
		gl_FragDepth = abs(sin(length(pos.xy)+time));
	}
`;



var gl;

function create_shader(vs_source, fs_source, attributes, uniforms) {
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

const cube_positions = [
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
const cube_indices = [
	0,  1,  2,      0,  2,  3,    // front
	4,  5,  6,      4,  6,  7,    // back
	8,  9,  10,     8,  10, 11,   // top
	12, 13, 14,     12, 14, 15,   // bottom
	16, 17, 18,     16, 18, 19,   // right
	20, 21, 22,     20, 22, 23,   // left
];


function create_mesh(positions, indices) {
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

var scene;

function on_keypress(e, down) {
	switch(e.keyCode) {
		case 37:
			scene.cam.v[0] = down ? -8.1 : 0.0;
			break;
		case 39:
			scene.cam.v[0] = down ? 8.1 : 0.0;
			break;
		case 38:
			scene.cam.v[1] = down ? 8.1 : 0.0;
			break;
		case 40:
			scene.cam.v[1] = down ? -8.1 : 0.0;
			break;
	}
}

var last_t = 0;
function render(t) {
	t *= 0.001;
	const dt = t-last_t;
	last_t = t;

	scene.rot += dt*0.2;
	vec3.scaleAndAdd(scene.cam.p, scene.cam.p, scene.cam.v, dt);

	gl.clearColor(0.0, 0.0, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	const T = mat4.create(), P = mat4.create(), V = mat4.create();

	mat4.perspective(P,
                   Math.PI / 4,
                   gl.canvas.clientWidth/gl.canvas.clientHeight,
                   0.1, 100.0);
	mat4.lookAt(V, scene.cam.p, [0,0.2,0], [0,0,1]);

	mat4.mul(P, P, V);
	mat4.identity(T);
	
	gl.useProgram(scene.qshader.program);
	scene.quad.bind(scene.qshader);
	gl.uniformMatrix4fv(scene.qshader.uniforms.VP, false, P);
	gl.uniformMatrix4fv(scene.qshader.uniforms.W, false, T);
	gl.uniform1f(scene.qshader.uniforms.time, t);
	scene.quad.draw();

	

	gl.useProgram(scene.shader.program);
	scene.cube.bind(scene.shader);
	gl.uniformMatrix4fv(scene.shader.uniforms.VP, false, P);
	for(var x = -2; x < 2; ++x) {
		for(var y = -2; y < 2; ++y) {
			for(var z = -2; z < 2; ++z) {
				mat4.fromTranslation(T, [x*2, y*2, z*2]);
				gl.uniformMatrix4fv(scene.shader.uniforms.W, false, T);
				scene.cube.draw();
			}
		}
	}

	requestAnimationFrame(render);
}

function init() {
	const canvas = document.querySelector("#cv");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert('WebGL is borked');
	}

	scene = {
		shader: create_shader(vs_source, fs_source, ["position"], ["W", "VP"]),
		qshader: create_shader(vs_source, depth_mod_fs_source, ["position"], ["W", "VP", "time"]),
		cube: create_mesh(cube_positions, cube_indices),
		quad: create_mesh([
			1.0, 1.0, 0.0,
			1.0, -1.0, 0.0,
			-1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0], [0, 1, 2, 2, 3, 0]),
		rot: 0,
		cam: { v: [0.0, 0.0, 0.0], p: [0.0, -20.0, 0.0]  }
	};

	document.addEventListener('keydown', (e) => on_keypress(e, true));
	document.addEventListener('keyup', (e) => on_keypress(e, false));

	render(0);
}
