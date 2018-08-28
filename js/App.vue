<template>
	<main id="app" class="section">
		<div class="container">
			<nav-main></nav-main>
			<router-view></router-view>
			<sculpture sculpdata="tempSculp"></sculpture>
			<editor></editor>
			<!-- <codemirror v-model="code"></codemirror> -->
		</div>
	</main>
</template>

<script>
import Header from './components/Header.vue';
import Sculpture from './components/Sculpture.vue';
import Editor from './components/Editor.vue';
// import { codemirror } from 'vue-codemirror-lite'

export default {
	data: function() {
		return {
			tempSculp: {
				id : '2',
				author : 'temp',
				title : '',
				description : '',
				tags : '',
				timestamp : ''
			}
		}
	},
	components: {
		navMain: Header,
		sculpture: Sculpture,
		editor: Editor,
		
		// codemirror
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
	}
};
</script>

