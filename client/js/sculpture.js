import * as THREE from './three.module.js';

export class Sculpture {
	constructor(name, x, y, scale, user_shader = Sculpture.default_frag_source) {
		this.name = name;
		this.x = x;
		this.y = y;
		//this.id = generateID();
		this.scale = scale;
		this.user_shader_source = user_shader;
		//user_shader === undefined ? 
			//Sculpture.default_frag_source : user_shader;
		this.geometry = new THREE.BoxBufferGeometry(1,1,1);
		this.mesh = new THREE.Mesh(this.geometry, this.generate_material());
	}

	static get vertex_source() {
		return `
			varying vec2 vUv;
			varying vec3 pos;
			void main()
			{
				vUv = uv;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				pos = mvPosition.xyz;
				gl_Position = projectionMatrix * mvPosition;
			}
			`;
	}

	static get default_frag_source() {
		return `
			uniform float time;
			uniform vec3 sculpture_center;
			varying vec2 vUv;
			varying vec3 pos;

			void main() {
				vec2 position = - 1.0 + 2.0 * vUv;
				float red = abs( sin( position.x * position.y + time / 5.0 ) );
				float green = abs( sin( position.x * position.y + time / 4.0 ) );
				float blue = abs( sin( position.x * position.y + time / 3.0 ) );
				gl_FragColor = vec4( red, green, blue, 1.0 );
				gl_FragDepthEXT = 0.75;
			}
			`;			
	}

	generate_material() {
		let m = new THREE.ShaderMaterial( {
			uniforms: { time: { value: 1.0 } },
			vertexShader: Sculpture.vertex_source,
			fragmentShader: this.user_shader_source
			} );
		m.extensions.fragDepth = true;
		return m;
	}

	refresh_material() {
		this.mesh.material = this.generate_material();
	}

	update_uniforms( uniforms ) {
		for (let u in uniforms) {
			this.mesh.material.uniforms[u] = uniforms[u];
		}
	}

	set_shader_source(source) {
		this.user_shader_source = source;
		this.refresh_material();
		// save source to db
	}

	get_shader_error() {
		return "test error message";
	}

}
