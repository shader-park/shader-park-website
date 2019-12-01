<template>
    <div class="auth-container">
        <button class="close-auth" v-on:click="close" ></button>
        <form v-on:submit.prevent>
            <span v-show="$v.email.$error">please enter a valid email</span>
            <input class="input w-input" @blur="$v.email.$touch()" type="email" placeholder="email:" v-model="email">
            <span v-show="!$v.username.unique">username is taken</span>
            <input class="input w-input" @blur="$v.username.$touch()" type="text" placeholder="username:" v-model="username">
            <span v-show="$v.password.$error">password must be 6 or more characters</span>
            <input class="input w-input" @blur="$v.password.$touch()" type="password" placeholder="password:" v-model="password">
            <button type="submit" class="button"  :disabled="$v.$invalid"  v-on:click="signUp">Sign Up</button>
        </form>
    </div>
</template>

<script>
import firebase from "firebase";
import {userSchema} from "../schema/User.js";
import {required, email, minLength} from 'vuelidate/lib/validators'

export default {
	data: function() {
		return {
			email: "",
			username: "",
            password: "",
            allUserNames: []
		};
    },
    created() {
		this.$store.dispatch('getAllUserNames').then(userNames => {
            this.allUserNames = Object.keys(userNames);
		});
	},
    validations: {
        email: {
            required,
            email
        },
        username: {
            required,
            unique: (val, vm) => {
                if(val == '') return true;
                return !vm.allUserNames.includes(val);
            }
        },
        password: {
            required,
            minLength: minLength(6)
        }  
    },
    methods: {
        signUp() {
            firebase.auth()
            .createUserWithEmailAndPassword(this.email, this.password)
            .then(output => {
                output.user.updateProfile({
                    displayName: this.username
                });
                const uid = output.user.uid;
                const dbUser = Object.assign(userSchema, {'username': this.username, 'email' : this.email});
                firebase.database().ref("users").child(uid).set(dbUser);
                this.$store.dispatch('setDBUser', {user: dbUser, uid: uid});
                // this.$router.replace('profile');
                this.$store.commit('displaySignUp', false);
            },
            error => {
                alert(error.message);
            });
        },
        close: function() {
			this.$store.commit('displaySignUp', false);
		},
    }
};
</script>

<style lang="less">

.auth-container {
    z-index: 102;
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

.close-auth {
  position: absolute;
  left: 14px;
  top: 14px;
  width: 34px;
  height: 34px;
  border-style: none;
  background-image: url('/images/close.svg');
  background-position: 50% 50%;
  background-size: 40px;
  background-repeat: no-repeat;
  background-attachment: scroll;
  opacity: 0.8;
}
</style>
