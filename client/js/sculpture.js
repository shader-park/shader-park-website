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

	// move these long static strings to a different file?
	static get vertex_source() {
		return `
			varying vec2 vUv;
			varying vec4 pos;
			void main()
			{
				vUv = uv;
				//pos = position;
				vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
				pos = mvPosition;
				gl_Position = projectionMatrix * mvPosition;
			}
			`;
	}

	static get default_frag_source() {
		return `
			uniform mat4 projectionMatrix;
			uniform float time;
			uniform vec3 camera_pos;
			uniform vec3 sculpture_center;
			uniform float box_size;
			varying vec2 vUv;
			varying vec4 pos;

			float sdSphere(vec3 p, float r) {
				return length(p)-r;
			}

			float map(vec3 p) {
				//p -= sculpture_center;
				float d;
				d = sdSphere(p, 1.0);
				return d;
			}

			float intersect(vec3 p, vec3 dir) {
				float d;
				for (int i=0; i<96; i++) {
					d = map(p);
					if (d < 0.001 || d > 3.0*box_size) break;
					p += dir*d*0.97;
				}
				return d;
			}

			vec3 calc_norm(vec3 pos) {
				vec2 e = vec2(0.01, 0.0);
			    return normalize(vec3(
				map(pos+e.xyy)-map(pos-e.xyy),
				map(pos+e.yxy)-map(pos-e.yxy),
				map(pos+e.yyx)-map(pos-e.yyx)));
			}

			void main() {

				vec3 ray_pos = pos.xyz-sculpture_center;
				vec3 ray_dir = normalize(pos.xyz - camera_pos);
				float dist = intersect(ray_pos, ray_dir);
				if (dist < box_size*2.0) {
					vec3 intersect_pos = ray_pos + dist*ray_dir;
					//vec2 position = - 1.0 + 2.0 * vUv;
					float red = abs( sin( intersect_pos.x * intersect_pos.y + time / 5.0 ) );
					float green = abs( sin( intersect_pos.y * intersect_pos.z + time / 4.0 ) );
					float blue = abs( sin( intersect_pos.z * intersect_pos.x + time / 3.0 ) );
					gl_FragColor = vec4( red, green, blue, 1.0 );
					vec4 sp = projectionMatrix*vec4(intersect_pos,1.0);
					gl_FragDepthEXT = (sp.z/sp.w)*0.5+0.5;//0.1;//length(intersect_pos+pos-camera_pos);
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
