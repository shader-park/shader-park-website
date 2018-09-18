<template>
    <div class="auth-container">
        <form v-on:submit.prevent>
			<span v-show="$v.email.$error">please enter a valid email</span>
            <input class="input w-input" type="email" @blur="$v.email.$touch()" placeholder="email:" v-model="email">
            <span v-show="$v.password.$error">password must be 6 or more characters</span>
            <input class="input w-input" type="password" @blur="$v.password.$touch()"  placeholder="password:" v-model="password">
            <button type="submit" class="button"  :disabled="$v.$invalid" v-on:click="signIn">Sign In</button>
        </form>
    </div>
</template>

<script>
import Firebase from "firebase";
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
			Firebase.auth()
			.signInWithEmailAndPassword(this.email, this.password)
			.then(
				user => {
					this.$router.replace('profile');
				},
				error => {
					alert(error.message);
				}
			);
		}
	}
};
</script>