<template>
    <div class="container">
        <h1>About</h1>
        <p>
            Shader Park is an open source web-based platform and community for creating real-time 3D graphics and animations using code. 
            It integrates diverse computer graphics techniques into a unified programming interface designed for fast 
            experimentation and live-coding.<br/><br/>

            Inspired by tools and communities like P5.js, Processing and Shader Toy, <a target="_blank" href="https://torinblankensmith.com">Torin Blankensmith</a> and
            <a target="_blank" href="http://www.peterwhidden.com/">Peter Whidden</a> developed Shader Park 
            with the intention of making emerging technology in computer graphics accessible and inclusive for artists, designers, and educators.

            
            
            

            <br/><br/>
            <b> Acknowledgments: </b><br/>
            Huge thank you to Inigo Quilez for his guidance and research on raymarching and signed distance fields. This project is heavily inspired by <a  target="_blank" href="https://www.shadertoy.com/">ShaderToy</a> (hence the name) and we encourage anyone on this site to also explore Shadertoy.

            Special thanks to the following for guidance on Shader Park:<br/>
            Ricardo Cabello, Ben Fry, Casey Reas, Kyle Phillips, Reza Ali, Alex Miller, and Avneeseh Sware.
            Thanks to Jono Brandel for the inspiration for the design of the editor heavily based on <a  target="_blank" href="http://www.anitype.com/">Anitype</a>
        </p>

        <p>

        
            
            
        </p>
    </div>
  
</template>

<script>

export default {
	data: function() {
		return {
			roomName: "About",
		}
	},
	components : {
		
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
