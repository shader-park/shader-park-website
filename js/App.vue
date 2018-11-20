<template>
	<main id="app" class="section">
		<h1 v-if="isEmbeded" class="loading-logo" :class='{fade: hasBeenLoaded}'>Shader Park</h1>
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
			isMounted: false,
			hasBeenLoaded: false
		}
	},
	computed: {
		sculpturesLoaded() {
			return this.$store.state.sculpturesLoaded;
		},
		isEmbeded() {
			return this.$store.state.embedded;
		},
		displayLogin() {
			return this.$store.getters.displayLogin;
		},
		displaySignUp() {
			return this.$store.getters.displaySignUp;
		}
	},
	watch : {
        sculpturesLoaded(value) {
			if(value && !this.hasBeenLoaded) {
				this.hasBeenLoaded = true;
			}
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

<style lang="less" scoped>
.loading-logo {
	position: absolute;
	left: 0px;
	top: 50%;
	right: 0px;
	bottom: 0px;
	z-index: 10;
	height: 47px;
	margin-top: 0px;
	margin-bottom: 0px;
	letter-spacing: 2px;
	-webkit-transform: translate(0px, -50%);
	-ms-transform: translate(0px, -50%);
	transform: translate(0px, -50%);
	-webkit-transition: opacity 300ms ease;
	transition: opacity 300ms ease;
	/* font-family: Poppins, sans-serif; */
	font-size: 88px;
	font-weight: 400;
	text-align: center;
	letter-spacing: 10.06px;
	text-transform: uppercase;
	-moz-animation-duration: 300ms;
	-webkit-animation-duration: 300ms;
	-ms-animation-duration: 300ms;
	animation-duration: 300ms;
	&.fade {
		opacity: 0.0;
		visibility:hidden;
		transition:visibility 0s ease-in-out 300ms,opacity 300ms ease-in-out;
	}

}
</style>
