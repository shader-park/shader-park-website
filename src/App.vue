<template>
	<div>
		<main id="app" class="section" v-if="$route.meta.title !== 'embed'">
			<h1 v-if="!isEmbeded" class="loading-logo" :class='{fade: hasBeenLoaded}'>Shader Park</h1>
			<div class="container">
				<nav-main></nav-main>
				<router-view :key="$route.fullPath"></router-view>
				<signIn v-if="displayLogin"></signIn>
				<signUp v-if="displaySignUp"></signUp>
				<share-modal v-if="displayShareModal"></share-modal>
				<main-container v-show="displayCanvas"></main-container>
			</div>
			<uniformGUI></uniformGUI>
		</main>
		<div class="main embeded" v-if="$route.meta.title === 'embed'">
			<router-view :key="$route.fullPath"></router-view>
			<div ref="threeCanvas" class="canvas-container" ></div>
		</div>
	</div>
</template>

<script>
import Header from './components/Header.vue';
import MainContainer from './components/MainContainer.vue';
import SignIn from './components/SignIn.vue';
import SignUp from './components/SignUp.vue';
import UniformGUI from './components/UniformGUI.vue';
import ShareModal from './components/ShareModal.vue';

export default {
	components: {
		navMain: Header,
		mainContainer: MainContainer,
		signIn: SignIn,
		signUp: SignUp,
		uniformGUI: UniformGUI,
		shareModal: ShareModal
	},
	data: function() {
		return {
			isMounted: false,
			hasBeenLoaded: false
		}
	},
	computed: {
		displayShareModal() {
			return this.$store.getters.displayShareModal;
		},
		displayCanvas() {
			return this.$store.getters.displayCanvas;
		},
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
		},
		displayCanvas(val) {
			// console.log('display canvas changed', val)
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
	// when the app is created run the set user method
	// this uses Vuex to check if a user is signed in
	// check out mutations in the store.js file
		this.setUser();
	},
	mounted() {
		this.$nextTick(function () {
			this.isMounted = true;
			if (this.$route.meta.title === 'embed') {
				let canvas = this.$refs.threeCanvas;
				this.$store.commit('setCanvasSize', {width: window.innerWidth, height: window.innerHeight});
			}
		})
		
	},
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
	line-height: 89px;
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


@media (max-width: 479px) {
	.loading-logo {
		font-size: 67px;
		line-height: 62px;
		letter-spacing: 10.06px;
	}
}
</style>

<style lang="less">

@import './client/webflow.css';
@import './client/normalize.css';

@font-size: 40px;


@font-face {
  font-family: 'Inter ui';
  src: url('./client/fonts/Inter-UI-SemiBold.woff') format('woff');
  font-weight: 600;
  font-style: normal;
}
@font-face {
  font-family: 'Inter ui';
  src: url('./client/fonts/Inter-UI-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Inter ui';
  src: url('./client/fonts/Inter-UI-Medium.woff') format('woff');
  font-weight: 500;
  font-style: normal;
}
@font-face {
  font-family: 'Inter ui';
  src: url('./client/fonts/Inter-UI-Black.woff') format('woff');
  font-weight: 900;
  font-style: normal;
}
@font-face {
  font-family: 'Inter ui';
  src: url('./client/fonts/Inter-UI-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'Inter ui';
  src: url('./client/fonts/Inter-UI-ExtraBold.woff') format('woff');
  font-weight: 800;
  font-style: normal;
}
@font-face {
  font-family: 'Regolapro';
  src: url('./client/fonts/RegolaPro-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
}
@font-face {
  font-family: 'Regolapro';
  src: url('./client/fonts/RegolaPro-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}
@font-face {
  font-family: 'Regolapro';
  src: url('./client/fonts/RegolaPro-Book.otf') format('opentype');
  font-weight: 300;
  font-style: normal;
}
@font-face {
  font-family: 'Regolapro';
  src: url('./client/fonts/RegolaPro-Medium.otf') format('opentype');
  font-weight: 500;
  font-style: normal;
}

@font-family: 'Regolapro', 'Poppins', sans-serif;

[v-cloak] {
    display: none;
}
.logo {
	position: relative;
	text-align: center;
	top:50%;
	// transform: translateY(-50%);
}

// canvas { width: 100%; height: 100% }
#editor {
	position: absolute;
	top: 135px;
	right: 8px;
	width: 40%;
	height: 80%;
	visibility: visible;
}
#editor-controls {
	padding-bottom: 3px;
}
.CodeMirror {
	width: 100%;
	height: 100%;
}
.error-span {
	background-color: red;
	color: white;
}

body {
    background: white;
    font-family: @font-family;
    // overflow: hidden;
    letter-spacing: 0.1px;
    margin: 0;
}

.ge_editor {
	letter-spacing: 0px;
}

button {
	letter-spacing: 0.5px;
}

h1 {
	letter-spacing: 0.5px;
}

a {
  text-decoration: none;
  transition: color 300ms ease-in-out;
  color:#006492;
}

a:hover {
  color: black;
}
// textarea {
//     background: white;
//     height: 40vh;
//     width: 60vw;
//     padding: 10px;
//     // height: 56px;
//     font-family: @font-family;
//     font-weight: 300;
//     font-size: @font-size;
//     -webkit-appearance: none;
//     border: none;
//     border-bottom: 5px solid #64C7CC;
// }
// select {
//     border: none;
//     border-color: lightgray;
//     background-color: white;
//     height: 60px;
//     font-family: @font-family;
//     font-size: @font-size;
// }
// span {
//     text-transform: uppercase;
//     display: inline-block;
// }

// button {
//     font-size: 30px;
//     font-family: @font-family;
//     border:none;
//     cursor: pointer;
//     padding: 10px;
//     border: 5px solid black;
// }

// .footer {
//     text-align: center;
//     position: absolute;
//     width: 100%;
//     bottom: 20px;
    
// }

.w-layout-grid {
  display: -ms-grid;
  display: grid;
  grid-auto-columns: 1fr;
  -ms-grid-columns: 1fr 1fr;
  grid-template-columns: 1fr 1fr;
  -ms-grid-rows: auto auto;
  grid-template-rows: auto auto;
  grid-row-gap: 16px;
  grid-column-gap: 16px;
}

input:focus,
select:focus,
textarea:focus,
button:focus {
    outline: none;
}

</style>


