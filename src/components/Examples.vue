<template>
	<room v-if="sculptures.length > 0" v-bind:sculpturesData="sculptures"></room>
</template>

<script>
import Sculpture from './Sculpture.vue';
import Room from './Room.vue';

export default {
	props: ['embed'],
	data: function() {
		return {
			sculptures: [],
			roomName: "Examples"
		}
	},
	components : {
		sculpture: Sculpture,
		room : Room	
	},
	mounted() {
		this.$store.commit('setInitialCameraPose', [6, 2.5, 4]);
		if(this.embed && this.embed === 'true') {
			this.$store.commit('setEmbedded', true);
		}
		this.$store.dispatch('fetchExampleSculptures').then(sculptures => {
            if(sculptures) {
				let temp = [];
				Object.keys(sculptures).forEach(key => {
					temp.push(sculptures[key]);
				})
				this.sculptures = temp; //array.push isn't tracked by state, resetting is
			}
			this.$store.commit('joinRoom', this.roomName);
		})
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	}
};
</script>