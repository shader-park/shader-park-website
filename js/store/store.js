import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase';
import * as THREE from 'three';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state: {
		user: null,
		scene: new THREE.Scene(),
		socket: null,
		selectedSculpture: null,
		displayedSculptures: [],
		currentSculptures: [],
		currSculptureDisplayIndex: 0
	},
	getters: {
		getUser: state => {
			return state.user;
		},
		selectedSculpture: state => {
			return state.selectedSculpture;
		}
	},
	mutations: {
		setUser: state => {
			state.user = firebase.auth().currentUser;
		},
		setSelectedSculpture(state, sculpture) {
			state.selectedSculpture = sculpture;
		}
	},
	actions: {
		setUser: context => {
			context.commit('setUser');
		},
		setDBUser: (context, payload) => {
			let uid = payload.uid;
			let dbUser = payload.user;
			firebase.database().ref('users/' + uid).set(dbUser);
			firebase.database().ref('usernames/' + dbUser.username).set(uid);
		}
	}
});