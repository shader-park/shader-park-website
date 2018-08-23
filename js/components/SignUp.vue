<template>
    <div class="auth-container">
        <form v-on:submit.prevent>
            <input class="input w-input" type="email" placeholder="email:" v-model="email">
            <input class="input w-input" type="text" placeholder="username:" v-model="username">
            <input class="input w-input" type="password" placeholder="password:" v-model="password">
            <button type="submit" class="button" :class="{ disabled: isDisabled }" :disabled="isDisabled"  v-on:click="signUp">Sign Up</button>
        </form>
    </div>
</template>

<script>
import firebase from "firebase";
import {User} from "../schema/User.js";

export default {
	data: function() {
		return {
			email: "",
			username: "",
			password: ""
		};
	},
  methods: {
	signUp: function() {
		firebase.auth()
		.createUserWithEmailAndPassword(this.email, this.password)
		.then(output => {
			const uid = output.user.uid;
			const dbUser = new User(this.username, this.email);
			this.$store.dispatch('setDBUser', {user: dbUser, uid: uid});
			this.$router.replace('profile');
		},
		error => {
			alert(error.message);
		});
	},
    checkUsername(username) {
		return this.$db.object(`usernames/${username.toLowercase()}`);
    }
  }
};
</script>

<style lang="less">
.auth-container {
    background: white;
    position: absolute;
    top: 0px;
    right: 0px;
    display: block;
    margin-top: 80px;
    padding: 60px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .15);
}

.input {
    display: block;
    width: 400px;
    margin-bottom: 40px;
    padding-top: 11px;
    padding-bottom: 11px;
    border-radius: 4px;
    font-size: 18px;
    font-weight: 300;
}
</style>
