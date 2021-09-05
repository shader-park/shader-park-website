<template>
    <canvas ref="canvasContainer" powerPreference=“high-performance” />
</template>

<script>
import { mapGetters } from 'vuex'

import { Scene, PerspectiveCamera, WebGLRenderer, Color} from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSculpture, createSculptureWithGeometry } from 'shader-park-core';

export default {
    props: {
        canvasWidth: { type: String, default: '100vw' },
        shaderParkCode: {type: [Function, String], default: 'sphere(.5);'},
        sculptureParams: {type: Object, default() {
            return {time: 0}
        }}
    },
    data () {
        return {
            favorited: false,
            favoriteCount: 0,
            params: {time : 0}
        }
    },
    computed : {
        ...mapGetters({
            userFavorites: 'userFavorites'
        }),
        isEmbeded() {
            return this.$store.state.embedded;
        },
        currSculpture() {
            return this.$store.state.currSculpture;
        },
        displayActionButton() {
            return this.currSculpture && this.currSculpture.id && this.currSculpture.id.length > 3
        },
        isMobile() {
            return window.innerWidth < 500;
        },
        currUser () {
			return this.$store.getters.getUser;
        },
    },
    watch : {
        canvasWidth(value) {
            if(this.$refs.canvasContainer) {
                this.resize();
            }
        },
       
    },
    created() {
        // this.throttleFavorite = throttle(this.favorite, 850);
    },
    methods: {
        resize() {
            if(this.$refs.canvasContainer) {
                let container = this.$refs.canvasContainer;
                this.camera.aspect = container.offsetWidth / container.offsetHeight;
                this.camera.updateProjectionMatrix();
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            console.log('SPParams', this.sculptureParams)
            let canvasContainer = this.$refs.canvasContainer;
            let scene = new Scene();

            this.camera = new PerspectiveCamera( 75, canvasContainer.offsetWidth/canvasContainer.offsetHeight, 0.1, 1000 );
            this.camera.position.z = 3;

            this.renderer = new WebGLRenderer({ canvas: canvasContainer, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance', alpha: true});
            // this.renderer.setSize( canvasContainer.offsetWidth, canvasContainer.offsetHeight );
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setClearColor( new Color(1, 1, 1), 1 );
            // canvasContainer.appendChild( this.renderer.domElement );

            //Shader Park setup
            // if(this.sculptureParams && this.sculptureParams) {
            //     this.sculptureParams.time = this.params.time;
            // }
            
            let mesh = createSculpture(this.shaderParkCode, () => (
                this.sculptureParams) );
            scene.add(mesh);

            let controls = new OrbitControls( this.camera, this.renderer.domElement, {
                enableDamping : true,
                dampingFactor : 0.25,
                zoomSpeed : 0.5,
                rotateSpeed : 0.5
            } );

            // let onWindowResize = () => {
            //     this.camera.aspect = window.innerWidth / window.innerHeight;
            //     this.camera.updateProjectionMatrix();
            //     this.renderer.setSize( window.innerWidth, window.innerHeight );
            // }
            window.addEventListener( 'resize', this.resize );

            let render = () => {
                requestAnimationFrame( render );
                this.sculptureParams.time += 0.01;
                controls.update();
                this.renderer.render( scene, this.camera );
            };

            render();
        });
    },

    beforeDestroy() {
        let canvas1 = this.$refs.canvas1;

        // handel.removeEventListener('mousedown', this.mouseDown);
        // let appEl =  document.getElementById('app');

        window.removeEventListener('resize', this.resize);
    },
}

</script>


<style lang="less" scoped>

</style>