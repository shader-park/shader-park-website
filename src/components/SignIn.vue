<template>
    <div class="auth-container">
		<button class="close-auth" v-on:click="close" ></button>
        <form v-on:submit.prevent>
			<span v-show="$v.email.$error">please enter a valid email</span>
            <input class="input w-input" type="email" @blur="$v.email.$touch()" placeholder="email:" v-model="email">
            <span v-show="$v.password.$error">password must be 6 or more characters</span>
            <input class="input w-input" type="password" @blur="$v.password.$touch()"  placeholder="password:" v-model="password">
            <button type="submit" class="button"  :disabled="$v.$invalid" v-on:click="signIn">Sign In</button>
			<button class="link sign-up" v-on:click="signUp" v-if="!user" active-class="active">Sign Up</button>
        </form>
    </div>
</template>

<script>
import firebase from "firebase/app";
import {required, email, minLength} from 'vuelidate/lib/validators'

export default {
	data: function() {
		return {
			email: "",
			password: ""
		};
	},
	computed: {
		isDisabled : function () {
			return !(this.email.length > 0 && this.password.length > 0);
		}
	},
	validations: {
        email: {
            required,
            email
        },
        password: {
            required,
            minLength: minLength(6)
        }  
    },
	methods: {
		signIn: function() {
			firebase.auth()
			.signInWithEmailAndPassword(this.email, this.password)
			.then(
				user => {
					// this.$router.replace('profile');
					this.$store.commit('displayLogin', false);
				},
				error => {
					alert(error.message);
				}
			);
		},
		signUp: function() {
			this.$store.commit('displaySignUp', true);
		},
		close: function() {
			this.$store.commit('displayLogin', false);
		},
	}
};
</script>
<style scoped>
.sign-up {
	margin-left: 10px;
}
</style>
