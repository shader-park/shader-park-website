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
			this.sculptures = temp;
			console.log(this.sculptures)
		})
	}
};
</script>