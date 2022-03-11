<template>
	<room ref="room" v-if="sculptures.length > 0" v-bind:sculpturesData="sculptures"></room>
</template>

<script>
import Sculpture from './Sculpture.vue';
import Room from './Room.vue';
import {handelUnsavedChanges} from '../helpers/handelUnsavedChanges.js';

export default {
	props: ['embed'],
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
		this.$store.commit('sculpturesLoaded', true);    
		this.$store.commit('setInitialCameraPose', [16, 2.5, 4]);
		if(this.embed && this.embed === 'true') {
			this.$store.commit('setEmbedded', true);
		}
		this.$store.dispatch('fetchAllSculptures').then(sculptures => {
			if(sculptures) {
				let temp = [];
				Object.keys(sculptures).forEach(key => {
					temp.push(sculptures[key]);
				})
				temp.reverse();
				this.sculptures = temp.slice(0, 256); //array.push isn't tracked by state, resetting is
				setTimeout(() => {
					this.$store.commit('sculpturesLoaded', true);    
					window.onCanvasResize();	
				}, 10);
			}
			this.$store.commit('joinRoom', this.roomName);
		})
	},
	destroyed() {
		this.$store.commit('leaveRoom', this.roomName);
	},
	beforeRouteLeave (to, from, next) {
		handelUnsavedChanges(next, this);
	}
	
};
</script>