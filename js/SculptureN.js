import * as THREE from 'three';

import {createPedestalEdges} from './create-pedestal-edges.js'
import { defaultFragSourceGLSL, defaultVertexSource, voxelVertexSource, fragFooter, voxelFooter, sculptureStarterCode} from 'sculpture-park-core'

export class Sculpture {
    constructor(fragmentShader = defaultFragSourceGLSL, msdfTexture, uniforms) {
        this.uniforms = uniforms;
        this.MSDFTexture = msdfTexture;
        this.vertexShader = defaultVertexSource;
        this.fragmentShader = fragmentShader;
        this.geometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
        this.mesh = new THREE.Mesh(
            this.geometry,
            this.generateMaterial(defaultVertexSource, fragmentShader, uniforms));
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

    setMSDFTexture(texture) {
        console.log('setting MSDF texture in sculp', texture)
        this.MSDFTexture = texture;
        this.refreshMaterial(this.uniforms);
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

    generateMaterial(vertexShader, fragmentShader, uniforms) {
        this.uniforms = uniforms;
        let finalUniforms = {
            time: { value: 0.0 },
            mouse: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
            opacity: { value: 1.0 },
            sculptureCenter: { value: new THREE.Vector3() },
            stepSize: { value: 0.8 },
            msdf: { value: this.MSDFTexture || new THREE.Texture() },
        }
        if(uniforms) {
            uniforms.forEach(uniform => {
                finalUniforms[uniform.name] = {value: uniform.value}
            });
        }
        // if(uniforms.length) {
        //     for (const [name, value] of Object.entries(uniforms)) {
        //         uniforms[name] = { value };
        //     }
        // }
        let uniformCode = this.generateUniformCode(uniforms);
        const material = new THREE.ShaderMaterial({
            uniforms: finalUniforms,
            vertexShader,
            fragmentShader: uniformCode + sculptureStarterCode + fragmentShader + fragFooter,
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

    generateUniformCode(uniforms) {

        let output = '';
        if(uniforms) {
            uniforms.forEach(uniform => {
                output += `uniform ${uniform.type} ${uniform.name};\n`;
            });
            // console.log('UNIFORM CODE', output)
        }
        return output;
    }

    refreshMaterial(uniforms = []) {
        // let uniformCode = this.generateUniformCode(uniforms);
        // this.mesh.material.fragmentShader = uniformCode + sculptureStarterCode + this.fragmentShader + fragFooter;
        // this.mesh.material.needsUpdate = true;
        this.mesh.material = this.generateMaterial(this.vertexShader, this.fragmentShader, uniforms);
    }

    update(uniforms) {
        
        // this.mesh.material.uniforms['time'].value = time * 0.001;
        this.mesh.material.uniforms['sculptureCenter'].value = this.mesh.position;
        this.mesh.material.uniforms['opacity'].value = this.opacity;
        this.mesh.material.uniforms['stepSize'].value = this.stepSize;
        this.mesh.material.uniforms['msdf'].value = this.MSDFTexture;
        // console.log(this.mesh.material.uniforms, uniforms);
        // console.log('update', uniforms);
        uniforms.forEach(uniform => {
            // console.log(uniform);
            this.mesh.material.uniforms[uniform.name].value = uniform.value;
        });
        // if (uniforms && Object.keys(uniforms).length) {
        //     for (const [name, value] of Object.entries(uniforms)) {
        //         console.log(name, value);
        //         this.mesh.material.uniforms[name].value = value;
        //     }
        // }
        // uniforms.forEach(uniform => {
        //     this.mesh.material.uniforms[]
        // })
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

}

