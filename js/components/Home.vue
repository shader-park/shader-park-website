<template>
  <sculpture-feed :sculptures="sculptures" v-if="sculptures"></sculpture-feed>
</template>

<script>
import SculptureFeed from './SculptureFeed.vue';

export default {
	data: function() {
		return {
			sculptures: null,
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
				Object.keys(sculptures).forEach(key => {
					temp.push(sculptures[key]);
				})
				temp.reverse();
				// temp = temp.filter(sculp => 'thumbnail' in sculp)
				this.sculptures = temp; //array.push isn't tracked by state, resetting is
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

</style>
