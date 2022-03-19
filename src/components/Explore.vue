<template>
<div class="container">
		<!-- <router-link to="/featured" class="link">
			<h1 v-show="!loading">Featured Sculptures 
				<span v-show="!loading && $route.name !== 'featured'">›</span>
			</h1>
		</router-link> -->
		<h1 v-show="!loading && $route.name == 'featured'">Featured Sculptures </h1>
		<sculpture-feed  :sculptures="featuredSculptures" v-if="featuredSculptures && $route.name == 'featured'"></sculpture-feed>
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
		if(this.$route.name == 'featured') {
			this.$store.dispatch('fetchFeaturedSculptures').then(sculptures => {
				if(sculptures) {
					sculptures.reverse();
					this.featuredSculptures = sculptures;
				}
				this.finishedLoading();
			});
		} else {
			this.$store.dispatch('fetchAllSculptures').then(sculptures => {
				if(sculptures) {
					sculptures.reverse();
					let featured = sculptures.filter(sculpture => sculpture.featured == true);
					this.sculptures = sculptures;
					// this.featuredSculptures = featured.slice(0, 8);
					this.finishedLoading();
				}
			})
		}
	},
	methods: {
		finishedLoading: function() {
				this.$store.commit('sculpturesLoaded', true);    
				this.$store.commit('joinRoom', this.roomName);
				this.loading = false;
		}
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
