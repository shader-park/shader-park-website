<template>
	<main id="app" class="section">
		<div class="container">
			<nav-main></nav-main>
			<router-view></router-view>
			<editor></editor>
		</div>
	</main>
</template>

<script>
import Header from './components/Header.vue';
import Sculpture from './components/Sculpture.vue';
import Editor from './components/Editor.vue';

export default {
	components: {
		navMain: Header,
		sculpture: Sculpture,
		editor: Editor,
	},
	methods: {
		setUser: function() {
			this.$store.dispatch('setUser');
		}
	},
	created() {
		console.log(this.tempSculp);
	// when the app is created run the set user method
	// this uses Vuex to check if a user is signed in
	// check out mutations in the store.js file
		this.setUser();
	},
};
</script>

