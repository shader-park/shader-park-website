<template>
	<div>
		<sculpture v-if="finishedLoadingSculp" ref="sculpture" :sculpData="emptySculpture"></sculpture>			
		<!-- <modal name="no-sculpture-data-found" class="modal-popup" height="auto" width="500px">
			¯\_(ツ)_/¯ couldn't find the sculpture you were looking for.
		</modal> -->
	</div>
</template>

<script>
import Sculpture from './Sculpture.vue';
import {handelUnsavedChanges} from '../helpers/handelUnsavedChanges.js';
export default {
	data: function() {
		return {
			emptySculpture: {},
			finishedLoadingSculp: false
		}
	},
	props: ['example', 'embed', 'hideEditor', 'hidePedestal', 'clickEnabled'],
	mounted() {
		
		this.$nextTick(function () {
			this.$store.commit('setDisplayCanvas', true);
			this.$store.commit('setInitialCameraPose', [0, 0, 4]);
			this.$store.commit('sculpturesLoaded', false);
			if(this.clickEnabled != null) {
				this.$store.commit('setClickEnabled', this.clickEnabled === 'true');
			}
			
			if(this.embed && this.embed === 'true') {
				this.$store.commit('setEmbedded', true);
				this.setSelectedSculpture();
			}
			const sculpId = this.$route.params.id;
			if(sculpId) {
				let payload = {id : sculpId};
				if(this.example && this.example === 'true') {
					payload['example'] = true;
				}
				this.$store.dispatch('fetchSculpture', payload).then(data => {
					if(data) {
						this.emptySculpture = data;
						this.finishedLoadingSculp = true;
						if(data.title != 'title') {
							this.$store.commit('setRouteTitle', data.title);
						}
						this.setSelectedSculpture();
					} else {
						this.$modal.show('no-sculpture-data-found');
					}
				});
			} else {
				this.finishedLoadingSculp = true;
				let sculptureType = this.$route.params.type;
				this.emptySculpture.type = 'js';
				if(sculptureType && sculptureType === 'glsl') {
					this.emptySculpture.type = sculptureType;
				}
				this.setSelectedSculpture();
				
			}
		});
		
	
	},
	components: {
		sculpture: Sculpture,
	},
	methods: {
		setUser: function() {
			this.$store.dispatch('setUser');
		},
		setSelectedSculpture() {
			this.$nextTick(function() {
				const sculp = this.$refs.sculpture;
				if(sculp) {
					if(!this.hideEditor) {
						
						this.$store.state.selectedObject = sculp.sculpture.mesh;
					}
					if(this.hidePedestal) {
						sculp.sculpture.pedestal.visible = false;
						sculp.sculpture.pedestalEdges.visible = false;
					}
				}
				this.$store.commit('sculpturesLoaded', true);
				window.onCanvasResize();
			});
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

<style>
.v--modal {
	text-align: center !important;
	padding-top: 20px !important;
	/* padding-bottom: 20px !important; */
}
</style>
