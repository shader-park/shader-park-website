
<template>
</template>

<script>

import {Sculpture} from '../threejs-sculpture/SculptureN.js';
import {mapGetters} from 'vuex';
import {defaultFragSourceGLSL} from 'shader-park-core';

function defaultMap(obj, id, def) {
    if(obj && obj[id]) {
        return obj[id];
    } else {
        return def;
    }
}

export default {
    props: ['sculpData', 'sculpPosition'],
    metaInfo () {
		return {
			title: 'Shader Park',
			meta: [
				{property: 'og:title', content: 'Shader Park'},
				{property: 'og:site_name', content: 'Shader Park'},
				// The list of types is available here: http://ogp.me/#types
				{property: 'og:type', content: 'website'},
				// Should the the same as your canonical link, see below.
				// {property: 'og:url', content: 'https://www.my-site.com/my-special-page'},
				{property: 'og:image', content: this.thumbnail},
				// Often the same as your meta description, but not always.
				{property: 'og:description', content: this.title},

				// Twitter card
				{name: 'twitter:card', content: 'summary'},
				// {name: 'twitter:site', content: 'https://www.my-site.com/my-special-page'},
				{name: 'twitter:title', content: 'Shader Park'},
				{name: 'twitter:description', content: this.title},
				// Your twitter handle, if you have one.
				// {name: 'twitter:creator', content: '@alligatorio'},
				{name: 'twitter:image:src', content: this.thumbnail},

				// Google / Schema.org markup:
				{itemprop: 'name', content: 'Shader Park'},
				{itemprop: 'description', content: this.title},
				{itemprop: 'image', content: this.thumbnail}
			]
		}
	},
    data: function() {
        return {
            //This all gets saved to the Database!!!!
            id : this.sculpData.id || this._uid,
            vueId: this._uid,
            uid : this.sculpData.uid || null,
            username : this.sculpData.username || null,
            title : this.sculpData.title || null,
            isExample: this.sculpData.isExample || false,
            description : this.sculpData.description || null,
            tags : this.sculpData.tags || null,
            timestamp : this.sculpData.timestamp || Date.now(),
            favorites : this.sculpData.favorites || 0,
            views: this.sculpData.views || 0,
            comments : this.sculpData.comments || 0,
            forks : this.sculpData.forks || 0,
            fork : this.sculpData.fork || null, //if a fork set to id
            featured : this.sculpData.featured || false,
            visibility : this.sculpData.visibility || 'public', //draft, public, private
            license : this.sculpData.license || null, 
            shaderSource: this.sculpData.shaderSource || ((this.sculpData.type && this.sculpData.type === 'glsl')? defaultFragSourceGLSL: 'sphere(0.5);'),
            type: this.sculpData.type || 'js',
            saved : this.sculpData.shaderSource? true: false,
            thumbnail: this.sculpData.thumbnail || null,
            //sculpture is not saved to the db
            sculpture: null
        };
    },
    mounted() {
        // this.$data = Object.assign(this.$data, this.sculpData);

        // this is just to make a copy??
        let shaderSourceCopy = this.shaderSource.slice();
        this.sculpture = new Sculpture(this.type !== 'js', shaderSourceCopy, this.MSDFTexture);
        if(this.sculpture.compileError) {
            //wait until the editor opens to log the error
            setTimeout(() => {
                this.$store.commit('setSculptureError', this.sculpture.compileError);
            }, 300);
        }
        
        if(this.sculpPosition) {
            this.setPose(this.sculpPosition);
        }
        if(this.id) {
            this.sculpture.mesh.name = this.id;
        } else {
            this.sculpture.mesh.name = this._uid; //_uid is a unique ID generated by vue for a component
        }
        window.scene.add(this.sculpture.mesh);
        this.$store.state.objectsToUpdate.push(this.sculpture);
        this.$store.state.objectsToRaycast.push(this.sculpture.mesh);
        this.$store.state.currSculpture = this.$data;
        if(this.$store.state.selectedObject) {
            this.setSelectedSculpture(this.$store.state.selectedObject);
        }
    },
    watch: {
        shaderSource: function (input) {
            if(this.sculpture) {
                this.shaderSource = input;
                try {
                    this.sculpture.refreshMaterial(input);
                    this.$store.commit('setSculptureError', ' ');
                } catch (e) {
                    this.$store.commit('setSculptureError', e);
                }
                
            }
        },
        selectedObject: function (obj) {
            this.setSelectedSculpture(obj);
        },
        id: function (val) {
            console.log('id of sculp changed to' + val);
        }
    },
    computed: {
        currUserID () {
            return this.$store.getters.getUser.uid;
        },
        selectedObject() {
            return this.$store.state.selectedObject;
        },
        MSDFTexture () {
            return this.$store.getters.getMSDFTexture;
        },
    },
    methods: {
        setPose(pose) {
            this.sculpture.mesh.position = this.sculpPosition;
        },
        setSaved(saved) {
            this.saved = saved;
        },
        setSelectedSculpture(obj) {
            let uniformsToExclude = {'sculptureCenter': 0,  'msdf': 0, 'opacity': 0, 'time': 0, 'resolution': 0};
            if(obj && this.sculpture && this.sculpture.mesh && this.sculpture.mesh.name && obj.name == this.sculpture.mesh.name) {
                this.$store.state.selectedSculpture = this.$data;
                this.$store.state.currSculpture = this.$data;
                if(this.sculpture.uniforms) {
                    this.sculpture.uniforms = this.sculpture.uniforms.filter(uniform => !(uniform.name in uniformsToExclude))
                }
                this.sculpture.selectedSculpture(true);
            } else {
                if(this.sculpture && this.sculpture.selected) {
                    this.sculpture.selectedSculpture(false);
                }
            }
        },
        removeSculpture() {
            const name = this.id || this._uid;
            this.$store.commit('removeObjectFromUpdate', this.sculpture);
            this.$store.commit('removeObjectFromRaycast', this.sculpture.mesh);
            this.$store.commit('removeObjectFromSceneByName', name);
        }
    },
    destroyed: function() {
        this.removeSculpture();
    }
};
</script>