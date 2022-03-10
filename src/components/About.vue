<template>
    <div class="container">
        <h1>About</h1>
        <p>
            Shader Park is an open source web-based platform and community for creating real-time 3D graphics and animations using code. 
            It integrates diverse computer graphics techniques into a unified programming interface designed for fast 
            experimentation and live-coding.<br/><br/>

            Inspired by tools and communities like P5.js, Processing, Three.js, and Shader Toy, <a target="_blank" href="https://torinblankensmith.com">Torin Blankensmith</a> and
            <a target="_blank" href="http://www.peterwhidden.com/">Peter Whidden</a> developed Shader Park 
            with the intention of making emerging technology in computer graphics accessible and inclusive for artists, designers, and educators.
            <br/>
            <br/>
            If you enjoy using Shader Park please consider giving us a star.<br/><br/>
            Core Framework
	    <github-button href="https://github.com/shader-park/shader-park-core" data-color-scheme="no-preference: light; light: light; dark: light;" data-size="large" aria-label="Star shader-park/shader-park-core on GitHub">Star</github-button>
            <br/>
            Website 
	    <github-button href="https://github.com/shader-park/shader-park-website" data-color-scheme="no-preference: light; light: light; dark: light;" data-size="large" aria-label="Star shader-park/shader-park-website on GitHub">Star</github-button><br/>


            <br/><br/>
            <b> Acknowledgments: </b><br/>
            Special thanks to the following for inspiration and guidance:<br/>
            Inigo Quilez, Ricardo Cabello, Andrew Palmer, Ben Fry, Casey Reas, Kyle Phillips, Reza Ali, Alex Miller, Avneeseh Sware, Jono Brandel and Cassie Tarakajian.
        </p>

        <p>

        
            
            
        </p>
    </div>
  
</template>

<script>
import GithubButton from 'vue-github-button'

export default {
	data: function() {
		return {
			roomName: "About",
		}
	},
	components : {
		GithubButton
	},
	mounted() {
		this.$store.commit('sculpturesLoaded', true);    
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	},
};
</script>


<style lang="less" scoped>
@import '../client/mixins.less';

.container {

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
</style>
