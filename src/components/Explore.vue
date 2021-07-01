<template>
<div class="container">
		<router-link to="/featured" class="link"><h1 v-show="!loading">Featured Sculptures ›</h1></router-link>
		<sculpture-feed :sculptures="featuredSculptures" v-if="featuredSculptures"></sculpture-feed>
		<h1 v-show="!loading && $route.name !== 'featured'">New Sculptures</h1>
		<sculpture-feed :sculptures="sculptures" v-if="sculptures && $route.name !== 'featured'"></sculpture-feed>
</div>
  
</template>

<script>
import SculptureFeed from './SculptureFeed.vue';

export default {
	data: function() {
		return {
			sculptures: null,
			featuredSculptures: null,
			roomName: "Explore",
			loading: true
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
					temp2.slice(0,10);
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
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	},
};
</script>

<style lang="less" scoped>
.container {
    padding: 30px;
}
</style>
