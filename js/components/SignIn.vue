<template>
     <div class="auth-container">
        <form v-on:submit.prevent>
            <input class="input w-input" type="email" placeholder="email:" v-model="email">
            <!-- <input class="input w-input" type="text" placeholder="username:" v-model="username"> -->
            <input class="input w-input" type="password" placeholder="password:" v-model="password">
            <button type="submit" class="button"  :class="{ disabled: isDisabled }" :disabled="isDisabled" v-on:click="signIn">Sign In</button>
        </form>
    </div>
</template>

<script>
import Firebase from "firebase";
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