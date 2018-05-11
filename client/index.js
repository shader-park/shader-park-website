import * as glmatrix from './gl-matrix.js';
import * as glu from './gl-util.js';
import {Camera} from './camera.js';
import {Sculpture} from './sculpture.js';

const vs_source = `#version 300 es
	in lowp vec4 position;
	uniform mat4 W;
	uniform mat4 VP;
	out lowp vec4 pos;
	void main() { pos = W*position; gl_Position = VP*W*position; }
`;

const fs_source = `#version 300 es
	in lowp vec4 pos;
	out lowp vec4 color;
	void main() { color = floor(abs(sin(pos*vec4(8.0, 3.0, 20.0, 1.0)))+0.5); }
`;

///////////////////////////////////////////////////////////////

const depth_mod_fs_source = `#version 300 es
	precision highp float;
	in lowp vec4 pos;
	uniform float iTime;
	uniform mat4 VP;
	uniform vec3 cam_pos;
	out vec4 color;

float map(vec3 pos) {
	return length(pos) - 0.5;
}

vec3 norm(vec3 pos) {
	vec2 e = vec2(0.01, 0.0);
    return normalize(vec3(
        map(pos+e.xyy)-map(pos-e.xyy),
        map(pos+e.yxy)-map(pos-e.yxy),
        map(pos+e.yyx)-map(pos-e.yyx)));
}

float intersect(vec3 ro, vec3 rd) {
    float t = 0.;

    for(int i = 0; i < 128; ++i) {
        float h = map(ro+rd*t);
        if(h < 0.001 || t>100.) break;
        t += h;
    }
    return t;
}

vec3 shade(float t, vec3 p, vec3 rd) {
	return abs(p);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	vec2 iResolution = vec2(1000.0, 1000.0);
	vec2 uv = (fragCoord - iResolution.xy*.5)/iResolution.y;

	vec3 ro = cam_pos;
	vec3 rd = normalize(pos.xyz-cam_pos);
        
	float t = intersect(ro, rd);

    if(t < 100.) {
        vec3 p = ro + rd*t;
		fragColor = vec4(abs(p), 1.0);
    } else {
		discard;
	}
}

	void main() {
		mainImage(color, gl_FragCoord.xy);
	}
`;


var gl;

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
	
	gl.useProgram(scene.shader.program);
	scene.cube.bind(scene.shader);
	gl.uniformMatrix4fv(scene.shader.uniforms.VP, false, P);
	for(var x = -2; x < 2; ++x) {
		for(var z = -2; z < 2; ++z) {
			mat4.fromTranslation(T, [x*2, z*2, -2.0]);
			gl.uniformMatrix4fv(scene.shader.uniforms.W, false, T);
			scene.cube.draw();
		}
	}

	scene.s1.render(gl, t, dt, (shader) => {
		gl.uniform1f(shader.uniforms.iTime, t);
		gl.uniform3fv(shader.uniforms.cam_pos, scene.cam.position);
		gl.uniformMatrix4fv(shader.uniforms.VP, false, P);
	});

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
		qshader: glu.shader(gl, vs_source, depth_mod_fs_source, ["position"], ["W", "VP", "iTime", "cam_pos"]),
		cube: glu.mesh(gl, glu.cube_positions, glu.cube_indices),
		quad: glu.mesh(gl, [
			1.0, 1.0, 0.0,
			1.0, -1.0, 0.0,
			-1.0, -1.0, 0.0,
			-1.0, 1.0, 0.0], [0, 1, 2, 2, 3, 0]),
		rot: 0,
		cam: new Camera([0, -20.0, 0], [0.0, 0.2, 0.0], 9.0)
	};

	scene.qshader.check();

	scene.s1 = new Sculpture(gl, 'id', scene.cube);
	scene.s1.shader = scene.qshader;
	scene.s1.position = vec3.fromValues(0.0, 2.0, 0.0);
	scene.s1.aabb = { min: [-1.0,-1.0,-1.0], max: [1.0,1.0,1.0] };


	render(0);
}
