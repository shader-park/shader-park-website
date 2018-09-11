<template>
	<!-- <sculpture sculpData="tempSculp"></sculpture> -->
	<room v-if="sculptures.length > 0" v-bind:sculpturesData="sculptures"></room>
	<!-- <section class="section">
		<h1 class="title has-text-centered">Profile</h1>
		<article class="notification is-info">
			<p>Secure Route</p>
		</article>
	</section> -->
</template>

<script>
import Sculpture from './Sculpture.vue';
import Room from './Room.vue';

export default {
	data: function() {
        return {
			sculptures: [],
        }
	},
	components : {
		sculpture: Sculpture,
		room : Room	
	},
	computed: {
		currUserID () {
			return this.$store.getters.getUser.uid
		}
	},
	mounted() {
		this.$store.commit('setProfileBadgeCount', 0);
		this.$store.dispatch('fetchUserSculptures').then(sculptures => {
			if(sculptures) {
				let temp = [];
				Object.keys(sculptures).forEach(key => {
					temp.push(sculptures[key]);
				})
				this.sculptures = temp; //array.push isn't tracked by state, resetting is
			}
			console.log(this.sculptures);
			this.$store.commit('joinRoom', this.roomName);
		})
		console.log(this.currUserID);
		// console.log(this.$store.state.scene);
	}
};


</script>