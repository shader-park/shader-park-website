import * as THREE from 'three';

import {createPedestalEdges} from './create-pedestal-edges.js'
import { defaultFragSourceGLSL, defaultVertexSource, voxelVertexSource, fragFooter, voxelFooter, sculptureStarterCode} from './default-shader.js'

export class Sculpture {
    constructor(fragmentShader = defaultFragSourceGLSL, MSDFTexture) {
        this.MSDFTexture = MSDFTexture;
        this.vertexShader = defaultVertexSource;
        this.fragmentShader = fragmentShader;
        this.geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.generateMaterial(defaultVertexSource, fragmentShader));
        const pedestalGeom = new THREE.BoxBufferGeometry(1.0, 0.5, 1.0);
        this.opacity = 0.0;
        this.stepSize = 0.8;
        const pedestalMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.95, 0.95), transparent: true, opacity: this.opacity });
        this.pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
        this.sepBuffer = 0.05; // Small gap between sculpture and pedestal prevents z-fighting
        this.pedestal.position.set(0, -.75-this.sepBuffer, 0);
        this.mesh.add(this.pedestal);
        this.pedestalEdges = createPedestalEdges(1.0, 0.5);
        this.pedestalEdges.position.set(0, -.75-this.sepBuffer, 0);
        this.mesh.add(this.pedestalEdges);
        this.selected = false;
        this.setOpacity(0.0);
        // this.mesh.visible = true;
    }

    selectedSculpture(selected) {
        if(!this.pedestal.visible) {
            return;
        }
        this.mesh.remove(this.pedestalEdges);
        if (selected) {
            this.pedestalEdges = createPedestalEdges(1.0, 0.5, 0.015);
            this.pedestalEdges.position.set(0, -.75-this.sepBuffer, 0);
            this.mesh.add(this.pedestalEdges);
        } else {
            this.pedestalEdges = createPedestalEdges(1.0, 0.5);
			this.pedestalEdges.position.set(0, -.75-this.sepBuffer, 0);
            this.mesh.add(this.pedestalEdges);
        }
        this.selected = selected;
    }

    setOpacity(value) {
        this.opacity = value;
        this.mesh.visible = value !== 0.0;
        this.pedestal.material.opacity = this.opacity;
    }

    generateMaterial(vertexShader, fragmentShader) {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0.0},
          mouse: {value: new THREE.Vector3(0.5,0.5,0.5)},
          opacity: {value: 1.0},
          sculptureCenter: {value: new THREE.Vector3()},
          stepSize: { value: 0.8 },
          map: this.MSDFTexture || new THREE.Texture()
        },
        vertexShader,
        fragmentShader: sculptureStarterCode + fragmentShader + fragFooter,
        transparent: true,
	    side: THREE.BackSide
      });
      material.extensions.fragDepth = false;
      return material;
    }

    generateVoxelsMesh(vertexShader, fragmentShader) {
	const material = new THREE.ShaderMaterial({
	    uniforms: {
 	        time: {value: 0.0},
		mouse: {value: new THREE.Vector3(0.5,0.5,0.5)},
		sculptureCenter: {value: new THREE.Vector3()}
	    },
	    vertexShader,
	    fragmentShader: sculptureStarterCode + fragmentShader + voxelFooter
	});
	const geo = new THREE.BoxBufferGeometry(1.0,1.0,1.0);
	return new THREE.Mesh(geo,material);
    }

    setShaderSource(fragmentShader) {
        this.fragmentShader = fragmentShader;
    }

    refreshMaterial() {
        this.mesh.material = this.generateMaterial(this.vertexShader, this.fragmentShader);
    }

    update(time) {
        this.mesh.material.uniforms['time'].value = time * 0.001;
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
        this.mesh.material.uniforms['opacity'].value = this.opacity;
        this.mesh.material.uniforms['stepSize'].value = this.stepSize;
    }

    generateMesh(time) {
    	// create object
	const voxMesh = this.generateVoxelsMesh(voxelVertexSource, this.fragmentShader);
	// create scene
	const voxelScene = new THREE.Scene();
	voxelScene.add(voxMesh);
	const vRes = 5; // Voxel resolution
	const deltaZ = 1.0/vRes;
	const vCam = new THREE.OrthographicCamera( -0.5,0.5,0.5,-0.5, /*-vRes/2, vRes/2, vRes/2, -vRes/2,*/ 0.3, 100 );
	vCam.position.z += 2.0;
	// create render target 
	const vRender = new THREE.WebGLRenderer();
	vRender.setSize(vRes,vRes);
	const vTarget = new THREE.WebGLRenderTarget(vRes,vRes);
	//vRender.setRenderTarget(vTarget);
	const buffA = new Uint8Array(4*vRes*vRes);
	const buffB = new Uint8Array(4*vRes*vRes);
	
	voxMesh.material.uniforms['sculptureCenter'].value = new THREE.Vector3(0.0,0.0,-0.5);
	vRender.render(voxelScene, vCam, vTarget);
	vRender.readRenderTargetPixels(vTarget, 0, 0, vRes, vRes, buffA);
	
	for (let slice = 1; slice<vRes; slice++) {
		voxMesh.material.uniforms['sculptureCenter'].value = new THREE.Vector3(0.0,0.0,-0.5+slice*deltaZ);
		vRender.render(voxelScene, vCam, vTarget);
		// alternate buffers at each slice
		let upperBuffer;
		let lowerBuffer;
		if (slice%2 === 0) {
		    upperBuffer = buffA;
		    lowerBuffer = buffB;
		} else {
		    upperBuffer = buffB;
		    lowerBuffer = buffA;
		}
		vRender.readRenderTargetPixels(vTarget, 0, 0, vRes, vRes, upperBuffer);
		this.convertVoxels(lowerBuffer, upperBuffer);

	}

	return "test";
	// setup mesh to be created
	// update unfiorms to select slice
	// render to target
	// read target 
	// incorporate read pixels to mesh
	// if not finished go back to update uniforms
	// smooth mesh
	// colors :)
	// all done!
    }

    convertVoxels(lBuff, uBuff) {
	console.log(lBuff);
    }

    // getShaderErrors(renderer) {
    //     let gl = renderer.context;
    //     let s = gl.createShader(gl.FRAGMENT_SHADER);
    //     const prefix = `
	// 	#extension GL_EXT_frag_depth : enable
	// 	precision highp float;
	// 	precision highp int;
	// 	uniform vec3 cameraPosition;
	// 	uniform mat4 viewMatrix;
	// 	` ;
    //     gl.shaderSource(s, prefix + this.fragmentShader);
    //     gl.compileShader(s);
    //     let log = gl.getShaderInfoLog(s);
    //     gl.deleteShader(s);
    //     if (log.length == 0) { return []; }
    //     let re = /ERROR:\s(\d+):(\d+):\s'(.*)'\s:\s(.*)/g;
    //     let errors = [];
    //     var res;
    //     while (res = re.exec(log)) {
    //         errors.push({
    //             line: parseInt(res[2]) - 7/*number of lines in prefix*/,
    //             item: res[3], message: res[4]
    //         });
    //     }
    //     return errors;
    // }

}

