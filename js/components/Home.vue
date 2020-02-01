<template>
<div>
	<h1>Featured Sculptures</h1>
	<sculpture-feed :sculptures="featuredSculptures" v-if="featuredSculptures"></sculpture-feed>
	<h1>New Sculptures</h1>
	<sculpture-feed :sculptures="sculptures" v-if="sculptures"></sculpture-feed>
</div>
  
</template>

<script>
import SculptureFeed from './SculptureFeed.vue';

export default {
	data: function() {
		return {
			sculptures: null,
			featuredSculptures: null,
			roomName: "Global Room"
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
				temp2.reverse();
				// temp = temp.filter(sculp => 'thumbnail' in sculp)
				this.sculptures = temp; //array.push isn't tracked by state, resetting is
				this.featuredSculptures = temp2; //array.push isn't tracked by state, resetting is
			}
			this.$store.commit('sculpturesLoaded', true);    
			this.$store.commit('joinRoom', this.roomName);
		})
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	},
};
</script>



<style scoped>
h1 {
	margin-left: 30px;
}
</style>
