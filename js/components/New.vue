<template>
	<sculpture sculpData="tempSculp"></sculpture>			
</template>

<script>
import Sculpture from './Sculpture.vue';

export default {
	data: function() {
		return {
			tempSculp: {
				id : this._uid
			}
		}
	},
	components: {
		sculpture: Sculpture,
	},
	methods: {
		setUser: function() {
			this.$store.dispatch('setUser');
		}
	}
};
</script>

