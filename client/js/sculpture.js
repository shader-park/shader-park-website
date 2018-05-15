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
		this.geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
		this.mesh = new THREE.Mesh(this.geometry, this.generate_material());
	}

	// move these long static strings to a different file?
	static get vertex_source() {
		return `
			varying vec2 vUv;
			varying vec4 worldPos;
			void main()
			{
				vUv = uv;
				//pos = position;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				worldPos = modelMatrix*vec4(position,1.0);//mvPosition;
				gl_Position = projectionMatrix * mvPosition;
			}
			`;
	}

	static get default_frag_source() {
		return `

		uniform mat4 projectionMatrix;
		uniform float time;
		uniform vec3 sculpture_center;
		uniform float box_size;
		varying vec2 vUv;
		varying vec4 worldPos;


		float map(vec3 pos) {
			//return length(pos)-0.2+
			//	(sin(pos.x*10.0)+sin(pos.y*10.0)+sin(pos.z*10.0))*0.1;
			return max(min(length(pos.xz)-0.2, min(length(pos.xy)-0.2, length(pos.zy)-0.2)), length(pos)-0.3);
		}


		float intersect(vec3 ro, vec3 rd) {
			float t = 0.;
			for(int i = 0; i < 128; ++i) {
				float h = map((ro+rd*t) - sculpture_center);
				if(h < 0.001 || t>1.) break;
				t += h*0.2;
			}
			return t;
		}

		void main() {
			vec3 ro = worldPos.xyz;
			vec3 rd = normalize(worldPos.xyz-cameraPosition);

			float t = intersect(ro, rd);
			if(t < 1.) {
				vec3 p = (ro + rd*t);
				vec4 sp = projectionMatrix*viewMatrix*vec4(p,1.0);
				gl_FragColor = vec4(sin(p.xyz*8.0)*0.5 + 0.5, 1.0);
				gl_FragDepthEXT = (sp.z/sp.w) * 0.5 + 0.5;
			} else {
				discard;
			}
		}

		`;			
	}

	generate_material() {
		let m = new THREE.ShaderMaterial( {
			uniforms: { 
				time: { value: 1.0 },
				camera_pos: { value: new THREE.Vector3() },
				sculpture_center: { value: new THREE.Vector3() },
				box_size : { value: 1.0 }
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

	update_uniforms( uniforms ) {
		for (let u in uniforms) {
			this.mesh.material.uniforms[u] = uniforms[u];
		}
	//	this.mesh.material.uniforms.sculpture_center.value = this.mesh.position;
		// update sculpture_center	
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
