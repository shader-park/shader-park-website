<template>
	<room v-if="sculptures.length > 0" v-bind:sculpturesData="sculptures"></room>
</template>

<script>
import Sculpture from './Sculpture.vue';
import Room from './Room.vue';

export default {
	data: function() {
		return {
			sculptures: [],
			roomName: "Global Room"
		}
	},
	components : {
		sculpture: Sculpture,
		room : Room	
	},
	mounted() {
		this.$store.dispatch('fetchAllSculptures').then(sculptures => {
			let temp = [];
			Object.keys(sculptures).forEach(key => {
				temp.push(sculptures[key]);
			})
			this.sculptures = temp; //array.push isn't tracked by state, resetting is
			console.log(this.sculptures);
			this.$store.commit('joinRoom', this.roomName);
		})
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	}
};
</script>