<template>
<div>
    <!-- <sp-three-vue class="canvas1" :shaderParkCode="spCode" :sculptureParams="backgroundParams" ref="canvas1" :enableZoom="false" /> -->
    <sp-three-vue class="background-canvas" :shaderParkCode="spCode3" :sculptureParams="backgroundParams" :enableZoom="false" />
    <section class="container split-container hero">
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
        <!-- <p class="quote">
            “In computational design, the real challenge is to discover the intrinsic properties of the new medium and to find out how the stroke you draw via computation is one you could never draw, or even imagine without computation.”
            <br/>
            John Maeda, Design by Numbers
        </p> -->
        <sp-three-vue class="canvas1" :shaderParkCode="spCode" :sculptureParams="sculptureParams" ref="canvas1" :enableZoom="false" />
        <br/><br/>
        <!-- <canvas class="canvas1" powerPreference=“high-performance” ref="canvas1"/> -->
    </section>
    <!-- <section class="container">
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
        <iframe width="100%" height="450px" src="https://shaderpark.com/sculpture/-LhBKYiVaq9-d-LmnImX?example=true&embed=true" frameborder="0"></iframe>
    </section> -->



    <section class="container featured"> 
        <router-link to="/featured" class="link"><h1 v-show="!loading">Featured Sculptures ›</h1></router-link>
        <sculpture-feed :sculptures="featuredSculptures" v-if="featuredSculptures"></sculpture-feed>

    </section>

<section class="container split-container growing-community">
        <br/>
        <h4>shader-park</h4>
        <br/>
        <h1>
            We are a growing community of artists and creative coders.<br/>
        </h1>
        <p>
            Reach out and contribute:
        </p>
        <br/><br/><br/><br/>
        <br/><br/>
            <a target="_blank" href="https://discord.gg/Z8CDWvVMeR" class="external-platform-link"><img src="img/icons/discord.png" loading="lazy" width="80" alt="Disscord Logo"></a>
            <a target="_blank" href="https://github.com/shader-park/" class="external-platform-link"><img src="img/icons/github.png" loading="lazy" width="80" alt="Github Logo"></a>
    </section>    

    <section class="container other-platforms-section">
        <h1 class="center">
            Combine with other Platforms<br/>
        </h1>
        <br/>
        <div class='action-container'>
            <a target="_blank" href="https://github.com/shader-park/shader-park-touchdesigner" class="external-platform-link"><img src="img/icons/touchdesigner.png" loading="lazy" width="80" alt="TouchDesigner Logo"></a>
            <a target="_blank" href="https://github.com/shader-park/shader-park-examples" class="external-platform-link"><img src="img/icons/threejs.png" loading="lazy" width="80" alt="threejs logo"></a>
            <a target="_blank" href="https://glitch.com/@torinmb/shader-park-examples" class="external-platform-link"><img src="img/icons/glitch.png" loading="lazy" width="80" alt="glitch logo"></a>
            <a target="_blank" href="https://github.com/shader-park/shader-park-examples/tree/main/nft-hicetnunc-three-template" class="external-platform-link"><img src="img/icons/hicetnunc.png" loading="lazy" width="130" alt="hicetnunc logo"></a>
        </div>
        <br/>
        <a class="active-button w-button center-button" target="_blank" href="https://github.com/shader-park/shader-park-examples">Explore All Starter Templates</a>

    </section>

    <section class="container featured-projects">
        <h1 v-show="!loading && $route.name !== 'featured'">Featured Projects</h1>
        <a class="active-button w-button" target="_blank" href="https://forms.gle/7zsSQYpcD4JtEP3E6">Submit a Project</a>
        <br/>
        <div class="row">
            <div class="column">
                <a target="_blank" href="https://quantumsummer.world/"><img class="featured-project-img left" alt="Quantum Summer Website" src="/img/featured_projects/Quantum Summer Site.jpg" /></a>
                <a target="_blank" href="https://lightartspace.org/"><img class="featured-project-img right" alt="Light Art Space Website" src="/img/featured_projects/LAS Site.jpg" /></a>
            </div>
        </div>
        <div class="row">
            <div class="column">
                <a target="_blank" href="http://wcma-experiments.appspot.com/"><img class="featured-project-img left" alt="Williams College of Art Experimental Museum Exploration Website" src="/img/featured_projects/WCMA Site.jpg" /></a>
            </div>
        </div>
        

        <br/><br/><br/><br/><br/>
    </section>
</div>
  
</template>

<script>
import SculptureFeed from './SculptureFeed.vue';
import SpThreeVue from './SpThreeVue.vue';
import {sculptToMinimalRenderer} from 'shader-park-core'
import {spCode2, spCode3} from '../helpers/front-page-sculp1.js';

export default {
	data: function() {
		return {
            spCode: spCode2(),
            spCode3: spCode3(),
			featuredSculptures: null,
			roomName: "Explore",
			loading: true,
            state: {
                hovering: false,
                hover: 0,
                currHover: 0,
                click: 0.0,
                currClick: 0.0
            },
            sculptureParams :{
                click: 0.0,
                hover: 0.0,
                _scale: .9
            },
            backgroundParams:  {
                scroll: 0.0,
                click: 0.0,
                hover: 0.0,
            }
		}
	},
	components : {
		SculptureFeed,
        SpThreeVue
	},
	mounted() {

		this.$store.commit('setInitialCameraPose', [6, 2.5, 4]);
		this.$store.dispatch('fetchFeaturedSculptures').then(sculptures => {
			if(sculptures) {
                sculptures.reverse();
                sculptures = sculptures.slice(0, 8);
				this.featuredSculptures = sculptures; //array.push isn't tracked by state, resetting is
			}
			this.$store.commit('sculpturesLoaded', true);    
			this.$store.commit('joinRoom', this.roomName);
			this.loading = false;
		})

        this.$nextTick(function () {
            let canvas1 = this.$refs.canvas1;
            if(canvas1) {
                // console.log('found canvas1', canvas1)
            } else {
                console.log('coudcaskdjhf no canvas')
            }
            document.addEventListener('scroll', () => {
                this.backgroundParams.scroll = this.backgroundParams.scroll*.98 + window.pageYOffset/window.innerHeight*.02;
            }, false);
            /*
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
            */
            // let canvas = document.querySelector('.my-canvas');

            // canvas1.addEventListener('mouseover', () => this.state.hover = 1, false);
            // canvas1.addEventListener('mouseout', () => this.state.hover = 0, false);
            // canvas1.addEventListener('mousedown', () => this.state.click = 1.0, false);
            // canvas1.addEventListener('mouseup', () => this.state.click = 0.0, false);

            // window.addEventListener('resize', () => resizeCanvasToDisplaySize(canvas1), false);
            // resizeCanvasToDisplaySize(canvas1);
            // This converts your Shader Park code into a shader and renders it to the my-canvas element
            // sculptToMinimalRenderer(canvas1, spCode, () => {
            //     // if(this.state.hovering) {
            //     //     this.state.hover += .007;
            //     // }
            //     this.state.currHover = this.state.currHover*.98 + this.state.hover*.02;
            //     this.state.currClick = this.state.currClick*.98 + this.state.click*.02;
            //     return {
            //         'hover' : this.state.currHover,
            //         'click' : this.state.currClick,
            //     };
            // });        
        });
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	},
};
</script>


<style lang="less" scoped>
@import '../client/mixins.less';

.row {
    margin-top: 20px;
    .mobile({
        margin-top: 0px;
    });
    display: flex;
}

.column {
    flex: 50%;
    .mobile({
        flex: 100%;
    });
}

.featured-project-img {
    width: calc(50vw - 45px);
    &.right {
        margin-left: 15px;
    }
    &.left {
        margin-right: 15px;
    }

    opacity: .85;
    transition: opacity 300ms ease-in-out;

    &:hover {
        opacity: 1;
    }
    .mobile({
        flex: 100%;
        margin-top: 20px;
        margin-left: 0px !important;
        margin-right: 0px !important;
        width: calc(100vw - 60px);
    });
}

.active-button {
    padding: 11px 35px;
    border: 1px solid #dedede;
    border-radius: 10px;
    background-color: #50e3c2;
    font-family: 'Inter ui', sans-serif;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 1.1px;
    text-indent: 0px;
    opacity: .8 !important;
    transition: opacity 300ms ease-in-out, color 300ms ease-in-out ;

    .mobile( {
        padding: 11px 20px;
    });

    &:hover {
        color: white;
        opacity: 1 !important;
    }

}

.container {
    padding: 30px;
}

.background-canvas {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: -1;
}

.canvas1 {
    cursor: pointer;
    margin-top: calc(50vh - 10vh);
    width: 50vw;
    height: 50vh;
    transform: translateY(-50%-10vh);
    .mobile({
        margin-top: 30px;
        margin-left: -30px;
        width: calc(100vw);
        height: auto;
        transform: translateY(0px);
    });
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


.center-button {
    position: relative;
    left: 50%;
    transform: translate(-50%, 0);
}

.center {
    text-align: center;
}

.external-platform-link {
    margin-left: 25px;
    margin-right: 25px;
}


.action-container {
    height: 40vh;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
}





section {

    min-height: 100vh;

    &.hero {
        background-image: linear-gradient(to bottom, rgba(0, 255, 234, 0), rgba(255,255,255,1));
    }

    &.featured {
        // background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255,255,255,0));
        // background-image: linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(0,0,0,0));
        background-color: white;
        // background-color: white;
        // background-image: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,0,0,0));
    }

    &.growing-community {
        padding-top: 100px;
        padding-bottom: 100px;
        background-image: linear-gradient(to bottom, rgba(255,255,255,1), rgba(0,0,255,.2) 90%);
    }

    &.other-platforms-section {
        // pointer-events: none;
        // margin-top: -80px;
        background-image: linear-gradient(to bottom, rgba(0,0,255,.2) , rgba(255,255,255,1));
    }


    &.featured-projects {
        background-color: white;
    }
}
</style>
