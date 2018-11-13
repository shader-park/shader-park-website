<template>
	<main id="app" class="section">
		<div class="container">
			<nav-main></nav-main>
			<router-view></router-view>
			<signIn v-if="displayLogin"></signIn>
			<signUp v-if="displaySignUp"></signUp>
			<main-container></main-container>
		</div>
	</main>
</template>

<script>
import Header from './components/Header.vue';
import MainContainer from './components/MainContainer.vue';
import SignIn from './components/SignIn.vue';
import SignUp from './components/SignUp.vue';

export default {
	components: {
		navMain: Header,
		mainContainer: MainContainer,
		signIn: SignIn,
		signUp: SignUp
	},
	data: function() {
		return {
			isMounted: false
		}
	},
	computed: {
		displayLogin() {
			return this.$store.getters.displayLogin;
		},
		displaySignUp() {
			return this.$store.getters.displaySignUp;
		}
	},
	methods: {
		setUser: function() {
			this.$store.dispatch('setUser');
		},
		didMount: function(callback) {
			callback();
		}
	},
	created() {
		console.log(this.tempSculp);
	// when the app is created run the set user method
	// this uses Vuex to check if a user is signed in
	// check out mutations in the store.js file
		this.setUser();
	},
	mounted() {
		this.$nextTick(function () {
			console.log('mounted app');
			this.isMounted = true;
		})
		
	}
};
</script>

