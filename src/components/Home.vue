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
        <a class="active-button w-button" target="_blank" href="https://forms.gle/7zsSQYpcD4JtEP3E6">Submit A Project</a>
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
import {sculptToMinimalRenderer} from 'shader-park-core'
import {spCode} from '../helpers/front-page-sculp1.js';

export default {
	data: function() {
		return {
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

    &:hover {
        color: white;
        opacity: 1 !important;
    }
}

.container {
    padding: 30px;
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

</style>
