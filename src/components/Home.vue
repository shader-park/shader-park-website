<template>
<div>
    <section class="container split-container">
        <br/>
        <h4>shader-park-core</h4>
        <br/>
        <h1>
                A JavaScript library for creating interactive procedural 2D and 3D shaders.<br/>
        </h1>
        <p>
            Explore shader programming through a JavaScript interface without the complexity of GLSL. Quickly script shaders using a P5.js style language.
        </p>
        <br/><br/>
        <p class="quote">
            “In computational design, the real challenge is to discover the intrinsic properties of the new medium and to find out how the stroke you draw via computation is one you could never draw, or even imagine without computation.”
            <br/>
            John Maeda, Design by Numbers
        </p>

        <canvas class="canvas1" ref="canvas1"/>
    </section>
    <section class="container">
        <br/>
        <h4>Shader Park</h4>
        <br/>
        <h1>
            We are a growing community of artists and creative coders.<br/>
        </h1>
        <p>
            Something about community etc
        </p>  
    </section>      
    <section class="container">
        <iframe width="100%" height="450px" src="https://shaderpark.netlify.com/sculpture/-LhBKYiVaq9-d-LmnImX?example=true&embed=true" frameborder="0"></iframe>
    </section>
    <section class="container"> 
        <router-link to="/featured" class="link"><h1 v-show="!loading">Featured Sculptures ›</h1></router-link>
        <sculpture-feed :sculptures="featuredSculptures" v-if="featuredSculptures"></sculpture-feed>
        <h1 v-show="!loading && $route.name !== 'featured'">Featured Projects</h1>
        <br/><br/><br/><br/><br/>
    </section>
    
	<!-- <sculpture-feed :sculptures="sculptures" v-if="sculptures && $route.name !== 'featured'"></sculpture-feed> -->
</div>
  
</template>

<script>
import SculptureFeed from './SculptureFeed.vue';
import {sculptToMinimalRenderer} from 'shader-park-core'
import {spCode} from '../helpers/front-page-sculp1.js';

export default {
	data: function() {
		return {
			sculptures: null,
			featuredSculptures: null,
			roomName: "Explore",
			loading: true,
            state: {
                buttonHover: 0.0,
                currButtonHover: 0.0,
                click: 0.0,
                currClick: 0.0
            }
		}
	},
	components : {
		SculptureFeed
	},
	mounted() {
		this.$store.commit('setInitialCameraPose', [6, 2.5, 4]);
		this.$store.dispatch('fetchAllSculptures').then(sculptures => {
			if(sculptures) {
				let temp = [];
				let temp2 = [];
				Object.keys(sculptures).forEach(key => {
					if(sculptures[key].featured) {
						temp2.push(sculptures[key]);
					} else {
						temp.push(sculptures[key]);
					}
				})
				temp.reverse();
				if(this.$route.name !== 'featured') {
					temp2.slice(0,8);
				}
				temp2.reverse();
				// temp = temp.filter(sculp => 'thumbnail' in sculp)
				this.sculptures = temp; //array.push isn't tracked by state, resetting is
				this.featuredSculptures = temp2; //array.push isn't tracked by state, resetting is
			}
			this.$store.commit('sculpturesLoaded', true);    
			this.$store.commit('joinRoom', this.roomName);
			this.loading = false;
		})

        this.$nextTick(function () {
            let canvas1 = this.$refs.canvas1;
            console.log('made it to nexttick', canvas1);

            function resizeCanvasToDisplaySize(canvas) {
                // look up the size the canvas is being displayed
                const devicePixelRatio = window.devicePixelRatio || 1;
                const width = window.innerWidth*devicePixelRatio;
                const height = window.innerHeight*devicePixelRatio;
                // const width = canvas.clientWidth * devicePixelRatio;
                // const height = canvas.clientHeight * devicePixelRatio;

                // If it's resolution does not match change it
                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                }
            }
            // let canvas = document.querySelector('.my-canvas');

            canvas1.addEventListener('mouseover', () => this.state.buttonHover = .8, false);
            canvas1.addEventListener('mouseout', () => this.state.buttonHover = 0.0, false);
            canvas1.addEventListener('mousedown', () => this.state.click = 1.0, false);
            canvas1.addEventListener('mouseup', () => this.state.click = 0.0, false);
            window.addEventListener('resize', () => resizeCanvasToDisplaySize(canvas1), false);
            resizeCanvasToDisplaySize(canvas1);
            // This converts your Shader Park code into a shader and renders it to the my-canvas element
            sculptToMinimalRenderer(canvas1, spCode, () => {
                this.state.currButtonHover = this.state.currButtonHover*.92 + this.state.buttonHover*.08;
                this.state.currClick = this.state.currClick*.92 + this.state.click*.08;
                return {
                    'buttonHover' : this.state.currButtonHover,
                    'click' : this.state.currClick,
                };
            });        
        });
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	},
};
</script>


<style lang="less" scoped>
@import '../client/mixins.less';

.container {
    padding: 30px;
}

.canvas1 {
    margin-top: calc(50vh - 10vh);
    width: 50vw;
    height: 50vh;
    transform: translateY(-50%-10vh);
}

.split-container {
    min-height: 80vh;
    column-count: 2;
    .mobile({
        column-count: 1;
    });
}

p {
    .mobile({
        font-size: 18px;
        line-height: 28px;
    });
    font-weight: 100!important;
    font-size: 21px;
    line-height: 33px;
    &.quote {
        font-style: italic;
    }
}

.container-center {

    .smallDesktop({
        margin-left: 0px;
        margin-right: 0px;
        padding-left: 30px;
        padding-right: 30px;
    });

    .mobile({
        
        margin-left: 0px;
        margin-right: 0px;
        padding-left: 20px;
        padding-right: 20px;

        & p {
            font-size: 18px;
            line-height: 28px;
        }
    });

    & p { 
        font-weight: 100!important;
    }

    margin-left: 30px;
    margin-right: 30px;
    max-width: 680px;
    position: relative;
    left: 50%;
    transform: translate(-50%, 0);
    font-size: 21px;
    line-height: 33px;

}

// h1 {
// 	margin-left: 30px;
// }

</style>
