<template>
	<div>
		<sculpture v-if="finishedLoadingSculp" ref="sculpture" :sculpData="tempSculp"></sculpture>			
		<modal name="no-sculpture-data-found" class="modal-popup" height="60px" width="500px">
			¯\_(ツ)_/¯ couldn't find the sculpture you were looking for.
		</modal>
	</div>
</template>

<script>
import Sculpture from './Sculpture.vue';

export default {
	data: function() {
		return {
			tempSculp: {
				id : this._uid
			},
			finishedLoadingSculp: false
		}
	},
	props: ['example', 'embed', 'hideEditor', 'hidePedestal'],
	mounted() {
		this.$store.commit('sculpturesLoaded', false);
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
					this.tempSculp = data;
					this.finishedLoadingSculp = true;
					if(data.title != 'title') {
						this.$store.commit('setRouteTitle', data.title);
					}
					this.setSelectedSculpture();
				} else {
					this.showModal();
				}
			});
		} else {
			this.finishedLoadingSculp = true;
			this.setSelectedSculpture();
		}
		
	
	},
	components: {
		sculpture: Sculpture,
	},
	methods: {
		setUser: function() {
			this.$store.dispatch('setUser');
		},
		showModal() {
			this.$modal.show('no-sculpture-data-found');
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
			});
		}
	},
	destroyed: function() {
		this.$store.commit('setRouteTitle', null);
	}
};
</script>

<style>
.v--modal {
	text-align: center !important;
	padding-top: 20px !important;
}
</style>
