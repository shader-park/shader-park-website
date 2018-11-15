<template>
	<div>
		<room v-if="sculptures.length > 0" v-bind:sculpturesData="sculptures"></room>
		<modal name="no-profile-data-found" class="modal-popup" height="60px" width="500px">
		¯\_(ツ)_/¯ couldn't find the profile you were looking for
		</modal>
	</div>		
</template>

<script>
import Sculpture from './Sculpture.vue';
import Room from './Room.vue';

export default {
	data: function() {
        return {
			sculptures: [],
        }
	},
	components : {
		sculpture: Sculpture,
		room : Room,
		roomName: ''
	},
	computed: {
		currUser () {
			return this.$store.getters.getUser;
		}
	},
	mounted() {
		this.$store.commit('setInitialCameraPose', [6, 2.5, 4]);
		console.log(this.$route.params.username);

		// this.$route.params.id;
		console.log('$route.params.id');
		const username = this.$route.params.username;

		
		if(username) {
			this.roomName = username;
			this.$store.commit('setRouteTitle', username);
			this.$store.dispatch('getUserIdFromUsername', username).then(uid => {
				if(uid) {
					this.$store.dispatch('fetchUserSculptures', uid).then(sculptures => {
						this.setSculpturesAndJoinRoom(sculptures);
					});
				} else {
					this.showModal();
				}
			});
		} else {
			this.roomName = this.currUser.displayName;
			this.$store.commit('setProfileBadgeCount', 0);
			this.$store.dispatch('fetchUserSculptures').then(sculptures => {
				this.setSculpturesAndJoinRoom(sculptures);
			})
			console.log(this.currUserID);
			// console.log(this.$store.state.scene);
		}
	},
	methods : {
		setSculpturesAndJoinRoom(sculptures) {
			if(sculptures) {
					let temp = [];
					Object.keys(sculptures).forEach(key => {
						temp.push(sculptures[key]);
					})
					temp.reverse();
					this.sculptures = temp; //array.push isn't tracked by state, resetting is
				}
			console.log(this.sculptures);
			this.$store.commit('joinRoom', this.roomName);
		},
		showModal() {
			this.$modal.show('no-profile-data-found');
		}
	},
	destroyed: function() {
		this.$store.commit('setRouteTitle', null);
	}
};


</script>