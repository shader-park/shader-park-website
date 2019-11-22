<template>
	<div>
		<!-- <room v-if="sculptures.length > 0" v-bind:sculpturesData="sculptures"></room> -->
		<sculpture-feed :sculptures="sculptures" v-if="sculptures.length > 0"></sculpture-feed>
		<modal name="profile-modal" class="modal-popup" height="auto" width="500px">
			{{modalText}}
		</modal>
		<modal name="profile-modal-empty" class="modal-popup" height="auto" width="500px">
			Looks like you don't have any sculptures yet.
			Try making a <router-link to="/new">new</router-link> one, or check out the <a href="/references">references</a> to see how to get started.
		</modal>
	</div>		
</template>

<script>
import SculptureFeed from './SculptureFeed.vue';
import {handelUnsavedChanges} from '../helpers/handelUnsavedChanges.js';

export default {
	data: function() {
	return {
			sculptures: [],
			modalText: "¯\_(ツ)_/¯ couldn't find the profile you were looking for"
        }
	},
	components : {
		SculptureFeed
	},
	computed: {
		currUser () {
			return this.$store.getters.getUser;
		},
		route() {
			return this.$route;
		}
	},
	mounted() {
		this.initUserProfile();
	},
	watch : {
		route(val) {
			this.initUserProfile();
		}
	},
	methods : {
		initUserProfile() {
			this.$store.commit('setInitialCameraPose', [6, 2.5, 4]);
			const username = this.$route.params.username;
			if(username) {
				this.roomName = username;
				this.$store.commit('setRouteTitle', username);

				this.$store.dispatch('getUserIdFromUsername', username).then(uid => {
					if(uid) {
						this.$store.dispatch('fetchUserSculptures', username).then(sculptures => {
							this.setSculpturesAndJoinRoom(sculptures);
							if(sculptures.length <= 5) {
								let count = sculptures.length -1;
								this.$store.commit('setInitialCameraPose', [count / 2 + count, 2.5, 4] );
							}
							if(sculptures.length == 0) {
								this.modalText = "This user doesn't have any sculptures yet"
								this.$modal.show('profile-modal');
							}
						});
					} else {
						this.showModal();
					}
				});
			} else {
				//this 
				this.roomName = this.currUser.displayName;
				this.$store.commit('setRouteTitle', this.roomName);
				this.$store.commit('setProfileBadgeCount', 0);
				this.$store.dispatch('fetchUserSculptures', this.roomName).then(sculptures => {
					this.setSculpturesAndJoinRoom(sculptures);
					if(sculptures.length == 0) {
						this.$modal.show('profile-modal-empty');
					}
				})
			}
		},
		setSculpturesAndJoinRoom(sculptures) {
			if(sculptures) {
				let temp = [];
				Object.keys(sculptures).forEach(key => {
					temp.push(sculptures[key]);
				})
				temp.reverse();
				this.sculptures = [];
				this.sculptures = temp; //array.push isn't tracked by state, resetting is
				
			}
			this.$store.commit('sculpturesLoaded', true);  
			this.$store.commit('joinRoom', this.roomName);
		},
		showModal() {
			this.$modal.show('profile-modal');
		}
	},
	destroyed: function() {
		this.$store.commit('setRouteTitle', null);
	},
	beforeRouteLeave (to, from, next) {
		handelUnsavedChanges(next, this);
	}
};


</script>