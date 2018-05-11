import * as glmatrix from './gl-matrix.js';
import * as glu from './gl-util.js';
import {Camera} from './camera.js';

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

var scene;

var last_t = 0;
function render(t) {
	t *= 0.001;
	const dt = t-last_t;
	last_t = t;

	scene.rot += dt*0.2;
	scene.cam.update(dt);

	gl.clearColor(0.0, 0.0, 0.3, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	const T = mat4.create(), P = mat4.create(), V = mat4.create();

	scene.cam.projection_matrix(P, gl);
	scene.cam.view_matrix(V);

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

window.init = function() {
	const canvas = document.querySelector("#cv");
	gl = canvas.getContext("webgl2");
	if (!gl) {
		alert('WebGL is borked');
	}

	scene = {
		shader: glu.shader(gl, vs_source, fs_source, ["position"], ["W", "VP"]),
		qshader: glu.shader(gl, vs_source, depth_mod_fs_source, ["position"], ["W", "VP", "time"]),
		cube: glu.mesh(gl, cube_positions, cube_indices),
		quad: glu.mesh(gl, [
			1.0, 1.0, 0.0,
			1.0, -1.0, 0.0,
			-1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0], [0, 1, 2, 2, 3, 0]),
		rot: 0,
		cam: new Camera([0, -20.0, 0], [0.0, 0.2, 0.0], 9.0)
	};


	render(0);
}
