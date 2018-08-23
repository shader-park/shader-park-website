import * as THREE from 'three';

import {defaultVertexSource, defaultFragSource} from './default-shader.js'

export class Sculpture {
    constructor(fragmentShader = defaultFragSource) {
      this.vertexShader = defaultVertexSource;
      this.fragmentShader = fragmentShader;
      this.geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
      this.mesh = new THREE.Mesh(
          this.geometry,
          this.generateMaterial(defaultVertexSource, fragmentShader));
    }

    generateMaterial(vertexShader, fragmentShader) {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: {value: 0.0},
                sculptureCenter: {value: new THREE.Vector3()},
            },
            vertexShader,
            fragmentShader
        });
        material.extensions.fragDepth = true;
        return material;
    }

    refreshMaterial() {
        this.mesh.material = this.generateMaterial(this.vertexShader, this.fragmentShader);
    }

    render(time) {
        this.mesh.material.uniforms['time'].value = time;
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
    }

    getShaderErrors(renderer) {
        let gl = renderer.context;
        let s = gl.createShader(gl.FRAGMENT_SHADER);
        const prefix = `
		#extension GL_EXT_frag_depth : enable
		precision highp float;
		precision highp int;
		uniform vec3 cameraPosition;
		uniform mat4 viewMatrix;
		` ;
        gl.shaderSource(s, prefix + this.fragmentShader);
        gl.compileShader(s);
        let log = gl.getShaderInfoLog(s);
        gl.deleteShader(s);
        if (log.length == 0) { return []; }
        let re = /ERROR:\s(\d+):(\d+):\s'(.*)'\s:\s(.*)/g;
        let errors = [];
        var res;
        while (res = re.exec(log)) {
            errors.push({
                line: parseInt(res[2]) - 7/*number of lines in prefix*/,
                item: res[3], message: res[4]
            });
        }
        return errors;
    }

}

// class Pedestal {
//     constructor() {

//     }

// }