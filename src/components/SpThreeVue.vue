<template>
    <canvas ref="canvasContainer" powerPreference=“high-performance”
        @mouseover="state.hover = 1.0"
        @mouseout="state.hover = 0.0"
        @pointerdown="state.click = 1.0"
        @pointerup="state.click = 0.0"
     />
</template>

<script>
import { mapGetters } from 'vuex'

import { Scene, PerspectiveCamera, WebGLRenderer, Color} from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createSculpture, createSculptureWithGeometry } from 'shader-park-core';

export default {
    props: {
        // canvasWidth: { type: String, default: '100vw' },
        hoverInterpolation: { type: Number, default: .98 },
        clickInterpolation: { type: Number, default: .98 },
        scrollInterpolation: { type: Number, default: .98 },
        shaderParkCode: {type: [Function, String], default: 'sphere(.5);'},
        sculptureParams: {type: Object, default() {
            return {}
        }},
        enableZoom: {type: Boolean, default: true}
    },
    data () {
        return {
            favorited: false,
            favoriteCount: 0,
            params: {},
            state: {
                click: 0.0,
                hover: 0.0,
                scroll: 0.0
            }
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
        enableZoom(value) {
            this.controls.enableZoom = value;
        }
        // canvasWidth(value) {
        //     if(this.$refs.canvasContainer) {
        //         this.resize();
        //     }
        // },
       
    },
    created() {
        // this.throttleFavorite = throttle(this.favorite, 850);
    },
    methods: {
        resize() {
            if(this.$refs.canvasContainer) {
                let container = this.$refs.canvasContainer;
                let cs = getComputedStyle(container);
                let width  = parseInt( cs.getPropertyValue('width'), 10);
                let height = parseInt( cs.getPropertyValue('height'), 10);
                this.camera.aspect = width/height;
                this.renderer.setSize( width, height );
                container.style.removeProperty('width');
                container.style.removeProperty('height');
                // this.camera.aspect = container.offsetWidth / container.offsetHeight;
                // this.renderer.setSize( container.offsetWidth, container.offsetHeight );
                this.camera.updateProjectionMatrix();
            }
        },
        mouseDown1() {
            console.log('mouseDown');
            this.state.click = 1.0;
        }
    },
    mounted() {
        this.$nextTick(() => {
            console.log('SPParams', this.sculptureParams)
            let canvasContainer = this.$refs.canvasContainer;
            this.scene = new Scene();

            this.camera = new PerspectiveCamera( 75, canvasContainer.offsetWidth/canvasContainer.offsetHeight, 0.1, 1000 );
            this.camera.position.z = 1.5;

            this.renderer = new WebGLRenderer({ canvas: canvasContainer, antialias: true, powerPreference: 'high-performance', alpha: true});
            this.renderer.setSize( canvasContainer.offsetWidth, canvasContainer.offsetHeight );
            canvasContainer.style.removeProperty('width');
            canvasContainer.style.removeProperty('height');
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setClearColor( new Color(1, 1, 1), 0 );
            // canvasContainer.appendChild( this.renderer.domElement );

            //Shader Park setup
            // if(this.sculptureParams && this.sculptureParams) {
            //     this.sculptureParams.time = this.params.time;
            // }
            
            let mesh = createSculpture(this.shaderParkCode, () => this.sculptureParams );
            this.scene.add(mesh);

            this.controls = new OrbitControls( this.camera, this.renderer.domElement, {
                enableDamping : true,
                dampingFactor : 0.25,
                zoomSpeed : 0.5,
                rotateSpeed : 0.5
            } );
            this.controls.enableZoom = this.enableZoom

            // let onWindowResize = () => {
            //     this.camera.aspect = window.innerWidth / window.innerHeight;
            //     this.camera.updateProjectionMatrix();
            //     this.renderer.setSize( window.innerWidth, window.innerHeight );
            // }

            // canvasContainer.addEventListener('mouseover', () => this.mouseOver, false);
            // canvasContainer.addEventListener('mouseout', () => this.mouseOut, false);
            let self = this;
            console.log('got canvasContainer', canvasContainer)
            canvasContainer.addEventListener('mousedown', () => {
                console.log('mouse down')
                self.state.click = 1.0
            }, false);
            canvasContainer.addEventListener('mouseup', () => self.state.click = 0.0, false);

            window.addEventListener( 'resize', this.resize );

            let render = () => {
                this.$emit('beginRender');
                this.animationId = requestAnimationFrame( render );
                if('time' in this.sculptureParams) {
                    this.sculptureParams.time += 0.01;
                } else {
                    this.sculptureParams.time = 0;
                }
                this.sculptureParams.click =  this.sculptureParams.click*this.clickInterpolation + this.state.click*(1.0-this.clickInterpolation);
                this.sculptureParams.hover =  this.sculptureParams.hover*this.hoverInterpolation + this.state.hover*(1.0-this.hoverInterpolation);
                this.sculptureParams.scroll =  this.sculptureParams.scroll*this.scrollInterpolation + window.pageYOffset/window.innerHeight*(1.0-this.scrollInterpolation);
                
                // this.state.currClick = this.state.currClick*.98 + this.state.click*.02;
                
                this.controls.update();
                
                this.renderer.render( this.scene, this.camera );
            };

            render();
        });
    },

    beforeDestroy() {
        let canvas1 = this.$refs.canvas1;
        cancelAnimationFrame(this.animationId);// Stop the animation
    
        // this.renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
        this.scene = null;
        this.camera = null;
        this.controls = null;
        // handel.removeEventListener('mousedown', this.mouseDown);
        // let appEl =  document.getElementById('app');

        window.removeEventListener('resize', this.resize);
    },
}

</script>


<style lang="less" scoped>

</style>