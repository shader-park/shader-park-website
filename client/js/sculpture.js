import * as THREE from './three.module.js';

export class Sculpture {

	constructor(name, x, y, scale, user_shader = Sculpture.default_frag_source) {
		this.name = name;
		this.coord = [ x, y ];
		//this.id = generateID();
		this.scale = scale;
		this.user_shader_source = user_shader;
		this.geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
		this.mesh = new THREE.Mesh(this.geometry, this.generate_material());
	}

	// move these long static strings to a different file?
	static get vertex_source() {
		return `
			varying vec4 worldPos;
			void main()
			{
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				worldPos = modelMatrix*vec4(position,1.0);

				gl_Position = projectionMatrix * mvPosition;
			}
			`;
	}

	static get default_frag_header() {
return `uniform mat4 projectionMatrix;
uniform float time;
uniform vec3 sculptureCenter;
varying vec4 worldPos;


`;
	}

	static get default_frag_source() {
		return Sculpture.default_frag_header +
`float map(vec3 p) {
	return length(p+0.2*sin(10.0*p+time*4.0+worldPos.x+0.1*worldPos.z))-0.3;
}

float intersect(vec3 ro, vec3 rd) {
	float t = 0.;
	for(int i = 0; i < 128; ++i) {
		float h = map((ro+rd*t) - sculptureCenter);
		if(h < 0.001 || t>1.) break;
		t += h*0.9;
	}
	return t;
}

vec3 shade(vec3 p) {
	return sin(p.xyz*8.0)*0.5 + 0.5;
}

void main() {
	vec3 ro = worldPos.xyz;
	vec3 rd = normalize(worldPos.xyz-cameraPosition);

	float t = intersect(ro, rd);
	if(t < 1.) {
		vec3 p = (ro + rd*t);
		vec4 sp = projectionMatrix*viewMatrix*vec4(p,1.0);
		gl_FragColor = vec4(shade(p), 1.0);
		gl_FragDepthEXT = (sp.z/sp.w) * 0.5 + 0.5;
	} else {
		discard;
	}
}`;
	}

	generate_material() {
		let m = new THREE.ShaderMaterial( {
			uniforms: { 
				time: { value: 0.0 },
				sculptureCenter: { value: new THREE.Vector3() },
			},
			vertexShader: Sculpture.vertex_source,
			fragmentShader: this.user_shader_source
			} );
		m.extensions.fragDepth = true;
		return m;
	}

	// Do this async somehow?
	refresh_material() {
		this.mesh.material = this.generate_material();
	}

	update(time) {
		this.mesh.material.uniforms['time'].value = time;
		this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
	}

	set_shader_source(source) {
		this.user_shader_source = source;
		this.refresh_material();
		// save source to db
	}

	get_shader_errors(renderer) {
		let gl = renderer.context;
		let s = gl.createShader(gl.FRAGMENT_SHADER);
		const prefix = `
		#extension GL_EXT_frag_depth : enable
		precision highp float;
		precision highp int;
		` ;
		gl.shaderSource(s, prefix+this.user_shader_source);
		gl.compileShader(s);
		let log = gl.getShaderInfoLog(s);
		gl.deleteShader(s);
		if(log.length == 0) { return []; }
		let re = /ERROR:\s(\d+):(\d+):\s'(.*)'\s:\s(.*)/g;
		let errors = [];
		var res;
		while(res = re.exec(log)) {
			errors.push({ line: parseInt(res[2])-7/*number of lines in prefix*/, item: res[3], message: res[4] });
		}
		return errors;
	}

}
