import firebase from 'firebase/app';
import * as OrbitControls from './THREE_Helpers/OrbitControls.js'
import * as MapControls from './THREE_Helpers/MapControls'
import * as IntersectionObserver from 'intersection-observer';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Vue from 'vue';

import VModal from 'vue-js-modal';
import VueRouter from 'vue-router';
import Vuelidate from 'vuelidate';
import anime from 'animejs';
import App from './App.vue';
import {dbConfig} from './dbConfig.js';
import {routes} from './router/routes';
import {store} from './store/store';

window.anime = anime;
firebase.initializeApp(dbConfig);

Vue.use(VueRouter);


Vue.use(VModal, { dialog: true });
Vue.use(Vuelidate);
// Vue.use(window['vue-js-modal'].default, { dialog: true });
Vue.config.devtools = true;
// Vue.config.productionTip = false;
let storageRef = firebase.storage().ref();

const router = new VueRouter({routes: routes, mode: 'history'});
let animationPaused = false;

// console.defaultLog = console.log.bind(console);
// console.logs = [];
// console.log = function () {
// 	// default &  console.log()
// 	console.defaultLog.apply(console, arguments);
// 	// new & array data
// 	console.logs.push(Array.from(arguments));
// }


//TRY TO CAPTURE ERRORS
/*
console.defaultError = console.error.bind(console);
console.errors = [];
console.error = function () {
	// default &  console.error()
	console.defaultError.apply(console, arguments);
	// new & array data
	console.errors.push(Array.from(arguments));
}
*/

let sculptureHasBeenSelected = false;
let sculptureHasBeenDeselected = false;
let cachedSelectedSculptureId, cachedCameraPose;
let allSculpturesOpacity = {opacity: 0.0};
let selectedSculptureOpacity = {opacity: 0.0};
let firstTimeAtRoute = true;
let mediaCap = null;
let isCapturing = false;

router.beforeEach((to, from, next) => {
	const currentUser = firebase.auth().currentUser;

	const nextRoute = () => {
		store.state.selectedObject = null;
		animationPaused = true;
		allSculpturesOpacity.opacity = 0.0;
		sculptureHasBeenDeselected = false;
		sculptureHasBeenSelected = false;
		selectedSculptureOpacity.opacity = 0.0;
		store.state.selectedSculpture = null;
		cachedSelectedSculptureId = null;
		cachedCameraPose = null;
		firstTimeAtRoute = true;
		const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
		if (requiresAuth && !currentUser) {
			this.$store.commit('displayLogin', true);
			// next('/sign-in');
		} else if (requiresAuth && currentUser) {
			store.state.displayCanvas = false;
			next();
		} else {
			store.state.displayCanvas = false;
			next();
		}
		animationPaused = false;
	};
	if (store.state.selectedSculpture) { //fade single sculpture if selected
		let id = store.state.selectedSculpture.id;
		transitionSculptureOpacity(id, 0.0, 1000).then(() => {
			const nextRouteHasSculptureSelected = to.matched.some(record => record.meta.selectedSculpture);
			if (!nextRouteHasSculptureSelected) {
				store.state.selectedSculpture = null;
			}
			setTimeout(() => { //wait for the editor to close
				store.state.displayCanvas = false;
				nextRoute();
			}, 300);
		});
	} else if (store.state.sculpturesLoaded) {
		if (store.state.displayCanvas) {
			transitionAllSculpturesOpacity(0.0, 1000).then(() => {
				store.state.displayCanvas = false;
				nextRoute();
			});
		} else {
			nextRoute();
		}
	} else {
		store.state.displayCanvas = false;
		nextRoute();
	}	
});

let firstInit = true;
let vueApp;
firebase.auth().onAuthStateChanged(function(user) {
	if(firstInit) {
		vueApp = new Vue({el: '#app', store: store, router: router, render: h => h(App)});
		init();

		//Detect when sculpture is saved
		vueApp.$store.subscribeAction(async (action, state) => {
			let {payload, type} = action;
			await payload;
			if ((type === 'saveNewSculpture' || type === 'saveSculpture') 
				&& (payload.uid === firebase.auth().currentUser.uid || firebase.auth().currentUser.uid ==='K3lAQQTKbiTiVXlwRZouH4OrWyv1')) {
				//hide pedestal during image capture
				let pedestal = null;
				let pedestalWasVisible = false;
				if (state.selectedSculpture && state.selectedSculpture.sculpture && state.selectedSculpture.sculpture.pedestal) {
					pedestal = state.selectedSculpture.sculpture.pedestal;
					pedestalWasVisible = pedestal.visible;
					pedestal.visible = false;
				}
				
				setTimeout(() => { //make sure pedestal is hidden
					captureCanvasImage(async (blob) => {
						try {
							if (pedestal && pedestalWasVisible) {
								pedestal.visible = true;
							}
							console.log('captured image', 'uploading to id', payload.id)
							let fileData = await storageRef.child(`sculptureThumbnails/${payload.id}.jpeg`).put(blob);
							console.log('uploaded')
							let thumbnail = await fileData.ref.getDownloadURL();
							if (thumbnail) {
								console.log('thumbnail url', thumbnail)
								firebase.database().ref('sculptures').child(payload.id).update({ thumbnail })	
							}
						} catch(e) {
							console.error(e);
						}
					}, false);
				}, 1);
			}
		});
		firstInit = false;
	} else {
		store.dispatch('setUser');
	}
});

const scene = store.state.scene;
window.scene = scene;
scene.background = new THREE.Color(1.0, 1.0, 1.0);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.0001, 180);

window.camera = camera;

let renderer, controls, mapControls, canvas, canvasContainer;

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const hemisphereLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF);
const startTime = Date.now();
let prevCanvasSize = window.innerWidth/2; 
let tweeningSculpturesOpacity = false;
let fogDistance = 8.0;
window.fogDistance = fogDistance;

let loader = new THREE.TextureLoader();
// loader.load('/msdf-left-align.png', (texture) => {
// 	store.commit('setMSDFTexture', texture)
// }, undefined,
// (err) => {
// 	console.error('An error happened.', err);
// });

function init() {
	canvasContainer = document.querySelector('.canvas-container');
	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true});
	renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
	prevCanvasSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight };
    Object.assign(store.state.canvasSize, prevCanvasSize);
    renderer.setPixelRatio(window.devicePixelRatio);
	canvasContainer.appendChild(renderer.domElement);

	canvas = document.querySelector('canvas');
	canvas.setAttribute('tabindex', '0');
	canvas.addEventListener('click', (event) => {
		event.target.focus();
	});
	canvas.addEventListener('mousemove', onMouseMove, false);

	mediaCap = piCreateMediaRecorder(() => console.log("capturing render"), canvas); 
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.zoomSpeed = 0.5;
	controls.rotateSpeed = 0.5;
	controls.keys = {
		LEFT: 65,
		UP: 87,
		RIGHT: 68,
		BOTTOM: 83
	};

	mapControls = new THREE.MapControls(camera, renderer.domElement);
	mapControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	mapControls.dampingFactor = 0.25;
	mapControls.screenSpacePanning = false;
	mapControls.maxPolarAngle = Math.PI / 2;

	window.mapControls = mapControls;
	window.controls = controls;
	// camera.position.set(6, 2.5, 4);
	// controls.target.set(6, 0, 0);

	scene.add(hemisphereLight);
    render();
}

window.addEventListener('resize', onCanvasResize, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);
document.addEventListener('keydown', keyPress.bind(null, true));
document.addEventListener('keyup', keyPress.bind(null, false));

function setInitialCameraPose() {
	if (store.state.initialCameraPose && firstTimeAtRoute) {
		firstTimeAtRoute = false;
		let pose = store.state.initialCameraPose;
		camera.position.set(pose[0], pose[1], pose[2]);
		controls.target.set(pose[0], 0, 0);
		mapControls.target.set(pose[0], 0, 0);
	}
}

function render(time) {
	if (!animationPaused) {
		requestAnimationFrame(render);
	}

	const t = (Date.now() - startTime) % 600000.0;

	if (store.state.canvasSize !== prevCanvasSize) {
		Object.assign(prevCanvasSize, store.state.canvasSize);
		onCanvasResize();
	}

	if(store.state.objectsToUpdate.length == 1) {
		controls.enabled = true;
		mapControls.enabled = false;
	}

    if (store.state.selectedSculpture) {
		if (!sculptureHasBeenSelected) {
			setInitialCameraPose()
			transitionAllSculpturesOpacity(0.0, 1000, store.state.selectedSculpture.id);
			transitionSculptureOpacity(store.state.selectedSculpture.id, 1.0, 1000);
			let selectedSculpturePose = new THREE.Vector3();

			selectedSculpturePose.getPositionFromMatrix(store.state.selectedObject.matrixWorld);
			cachedCameraPose = camera.position;
			tweenCameraToSculpturePosition(selectedSculpturePose);
			
			sculptureHasBeenSelected = true;
			mapControls.enabled = false;
			controls.enabled = true;
			cachedSelectedSculptureId = store.state.selectedSculpture.id;
		}
		sculptureHasBeenDeselected = false;
	} else {
		if (!sculptureHasBeenDeselected && store.state.sculpturesLoaded) {
			sculptureHasBeenDeselected = true;
			mapControls.enabled = true;
			controls.enabled = false;
			setInitialCameraPose();
			// if(store.state.initialCameraPose && firstTimeAtRoute) {
			// 	firstTimeAtRoute = false;
			// 	let pose = store.state.initialCameraPose;
			// 	camera.position.set(pose[0], pose[1],pose[2]);
			// 	controls.target.set(pose[0], 0, 0);
			// }
			transitionAllSculpturesOpacity(1.0, 1000, cachedSelectedSculptureId);
		} else if (sculptureHasBeenDeselected && cachedCameraPose) {
			// camera.position.y = 2;
			tweenObjectToValue(camera.position.y, store.state.initialCameraPose[1], (val) => camera.position.y = val);
			cachedCameraPose = null;
			// if(cachedSelectedSculpturePose){
				// tweenCameraToSculpturePosition(cachedSelectedSculpturePose);
			// }
		}
		sculptureHasBeenSelected = false;
	}
	
	let currTime = t * 0.001;
	store.state.objectsToUpdate.forEach(sculpture => {
		if (!store.state.selectedSculpture && !tweeningSculpturesOpacity && store.state.sculpturesLoaded){
			let fadeOpacity = calcSculptureOpacityForCameraDistance(sculpture);
			sculpture.setOpacity(fadeOpacity);
		}
		let uniforms = [];
		uniforms.push({ name: 'time', value: currTime, type: 'float' });
		if (store.state.selectedSculpture && store.state.selectedSculpture.sculpture === sculpture) {
			if(sculpture && sculpture.uniforms) {
				window.uniforms = sculpture.uniforms;
				uniforms = uniforms.concat(sculpture.uniforms);
			}
			
		}
		sculpture.update(uniforms);
	});	

	const objectsToRaycast = store.state.objectsToRaycast;
	if (objectsToRaycast.length > 0) {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(objectsToRaycast);
		if(intersects.length > 0) {
			const firstIntersect = intersects[0].object;
			firstIntersect.material.side = THREE.FrontSide;
			const frontSideIntersection = raycaster.intersectObjects(objectsToRaycast);
			if (frontSideIntersection.length > 0) {
				firstIntersect.material.uniforms.mouse.value = frontSideIntersection[0].point.sub(firstIntersect.position);
			} else { 
				firstIntersect.material.uniforms.mouse.value = camera.position.clone().sub(firstIntersect.position);
			}
			firstIntersect.material.side = THREE.BackSide;
			if (store.state.selectedSculpture === null && store.state.clickEnabled) {
				canvas.style.cursor = 'pointer';
				store.state.intersectedObject = firstIntersect;
			}
		} else {
			if (store.state.selectedSculpture === null) {
				canvas.style.cursor = 'auto';
				store.state.intersectedObject = null;
			}
		}
	}
	TWEEN.update(time);
	// if(player) player.update();
	// updateRemotePlayers();
	let enableKeys = store.state.selectedSculpture ? false : true;
	mapControls.enableKeys = enableKeys;
	controls.enableKeys = enableKeys;

	if(controls.enabled) {
		controls.update();
	}
	if(mapControls.enabled) {
		mapControls.update();
	}
	
	
	renderer.render(scene, camera);	

}

function piCreateMediaRecorder(isRecordingCallback, canvas) 
{
	/*
    if (piCanMediaRecorded(canvas) == false)
    {
        return null;
    }
    */

    let options = {
		videoBitsPerSecond: 2500000,
		mimeType: 'video/webm;'
    };
	if (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia) {
		console.error('recorder unsupported');
		return
	}
    var mediaRecorder = new MediaRecorder(canvas.captureStream(), options);
    console.log("videoBitsPerSecond: ", mediaRecorder.videoBitsPerSecond);
    var chunks = [];
    
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };
 
    mediaRecorder.onstart = () => { 
        isRecordingCallback( true );
    };
    
	mediaRecorder.onstop = (download) => {
		isRecordingCallback(false);
		let blob = new Blob(chunks, options);

		chunks = [];
		if (download) {
			let videoURL = window.URL.createObjectURL(blob);
			let url = window.URL.createObjectURL(blob);
			let a = document.createElement("a");
			document.body.appendChild(a);
			a.style = "display: none";
			a.href = url;
			a.download = "capture.webm";
			a.click();
			window.URL.revokeObjectURL(url);
		}
		return blob;
	};
    
    return mediaRecorder;
}

function captureCanvasImage(callback, download) {
	return canvas.toBlob((blob) => {
		if(download) {
			let url = window.URL.createObjectURL(blob);
			let a = document.createElement("a");
			document.body.appendChild(a);
			a.style = "display: none";
			a.href = url;
			a.download = "capture.jpeg";
			a.click();
			window.URL.revokeObjectURL(url);
		}
		callback(blob);
	}, 'image/jpeg', 1.0);
}

function toggleScreenCapture(download) {
	if (!isCapturing) {
		mediaCap.start();
		isCapturing = true;
	} else {
		isCapturing = false;
		return mediaCap.stop(download);
	}
}

function keyPress(down, e) {
	if (e.target.nodeName === 'BODY') {
		// player.keyEvent(down, e);
	}
	if (e.altKey && down) {
		if (e.key === 'r' || e.key === '®') {
			toggleScreenCapture(true);
		}
	}

}

// Raycast to sculptures
function onMouseMove(event) {
	if(canvasContainer) {
		mouse.x = ((event.clientX - canvasContainer.offsetLeft)  / canvasContainer.clientWidth) * 2 - 1;
		mouse.y = -((event.clientY - canvasContainer.offsetTop) / canvasContainer.clientHeight ) * 2 + 1;
	}
	
}

let tempIntersectedObject;
let mouseDownTime = 0;
function onMouseDown(event) {

	if(store.state.intersectedObject) {
		tempIntersectedObject = store.state.intersectedObject;
		mouseDownTime = Date.now();
	} else {
		store.state.selectedObject = null;
	}
}

function onMouseUp(event) {
	if (store.state.selectedObject || !store.state.clickEnabled) return;
	if (store.state.intersectedObject && store.state.intersectedObject === tempIntersectedObject) {
		mouseDownTime = Date.now() - mouseDownTime;
		if(mouseDownTime < 400) {
			store.state.selectedObject = store.state.intersectedObject;
			selectedSculptureOpacity.opacity = 1.0;
			canvas.style.cursor = 'auto';
		}
	} else {
		store.state.selectedObject = null;
	}
	tempIntersectedObject = null;
}

window.THREE = THREE;

function tweenCameraToSculpturePosition(endTargetPos, duration=1000) {
	let camTarget;
	if (controls.enabled) {
		camTarget = new THREE.Vector3().copy(controls.target);
		mapControls.target = new THREE.Vector3().copy(controls.target);
	} else {
		camTarget = new THREE.Vector3().copy(mapControls.target);
		controls.target = new THREE.Vector3().copy(mapControls.target);
	}
	let tweenControlsTarget = new TWEEN.Tween(camTarget)
		.to(endTargetPos, duration)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(function () {
			controls.target.set(camTarget.x, camTarget.y, camTarget.z);
			mapControls.target.set(camTarget.x, camTarget.y, camTarget.z);
		});
	let camPos = new THREE.Vector3().copy(camera.position);
	let endCamPos = new THREE.Vector3().copy(endTargetPos);
	endCamPos.z += 2;
	let tweenCamera = new TWEEN.Tween(camPos)
		.to(endCamPos, duration)
		.easing(TWEEN.Easing.Quadratic.InOut)
		.onUpdate(function () {
			camera.position.set(camPos.x, camPos.y, camPos.z);
		});
	tweenCamera.start();
	tweenControlsTarget.start();
}

function transitionSculptureOpacity(sculptureId, opacity, duration = 2000) {
	tweeningSculpturesOpacity = true;
	return new Promise(function(resolve, reject) {
		let sculp = store.state.objectsToUpdate.filter(obj => obj.mesh.name === sculptureId);
		if(sculp.length == 0) {
			reject();
		} else {
			sculp = sculp[0];
		}
		let fadeSculpture = new TWEEN.Tween(selectedSculptureOpacity)
			.to({opacity}, duration)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(function() {
				sculp.setOpacity(selectedSculptureOpacity.opacity);
			})
			.onComplete(function() {
				tweeningSculpturesOpacity = false;
				resolve();
			});
		fadeSculpture.start();
	});
}

function tweenObjectToValue(obj, endValue, updateCallback, time = 1000) {
	return new Promise(function (resolve, reject) {
		let currState = { state: obj };
		let tween = new TWEEN.Tween(currState)
			.to({ 'state': endValue }, time)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(() => {
				updateCallback(currState.state);
			})
			.onComplete(() => resolve());
		tween.start();
	});
}

function transitionAllSculpturesOpacity(opacity, duration = 2000, excludedSculptureId = null) {
	tweeningSculpturesOpacity = true;

	let objectsToFade = store.state.objectsToUpdate.filter(obj => calcSculptureOpacityForCameraDistance(obj) > 0);
	return new Promise(function(resolve, reject) {
		let fadeSculptures = new TWEEN.Tween(allSculpturesOpacity)
			.to({ opacity }, duration)
			.easing(TWEEN.Easing.Quadratic.InOut)
			.onUpdate(function () {
				objectsToFade.forEach(obj => {
					let fadeOpacity = calcSculptureOpacityForCameraDistance(obj);
					if(!(obj.opacity == 0 && opacity == 0)) {	
						if (!excludedSculptureId && fadeOpacity) {
							obj.setOpacity(Math.min(allSculpturesOpacity.opacity, fadeOpacity));
						} else if (obj.mesh.name !== excludedSculptureId) {
							obj.setOpacity(Math.min(allSculpturesOpacity.opacity, fadeOpacity));
						}
					}
				});
			})
			.onComplete(function () {
				tweeningSculpturesOpacity = false;
				resolve();
				
			});
		fadeSculptures.start();
	});
}

function calcSculptureOpacityForCameraDistance(sculp) {
  let dist = sculp.mesh.position.distanceTo(camera.position);
  return Math.min(Math.max(0.0, window.fogDistance - dist * 0.5), 1.0);
}


function onCanvasResize() {
	camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}