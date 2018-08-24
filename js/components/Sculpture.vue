
<template>
    <div>
        <span>Title {{title}} </span>
        <span>Favorites {{favorites}}</span>
        <span>Views {{views}}</span>
        <span>Comments {{comments}}</span>
        <span>Forks {{forks}}</span>
    </div>
</template>

<script>

import {Sculpture} from '../SculptureN.js';
import * as THREE from 'three';
import { defaultFragSource } from '../default-shader.js'

export default {
    props: ['sculpdata'],
    data: function() {
        return {
            // id : this.sculp-data.id,
            // author : this.sculp-data.author,
            // title : this.sculp-data.title,
            // description : this.sculp-data.description,
            // tags : this.sculp-data.tags,
            // timestamp : this.sculp-data.timestamp,
            // favorites : this.sculp-data.favorites? this.sculp-data.favorites : 0,
            // views: this.sculp-data.views? this.sculp-data.views : 0,
            // comments : this.sculp-data.comments? this.sculp-data.comments : 0,
            // forks : this.sculp-data.views? this.sculp-data.views : 0,
            // fork : this.sculp-data.fork, //if a fork set to id
            // featured : this.sculp-data.featured? this.sculp-data.featured : false, 
            // visibility : this.sculp-data.visibility? this.sculp-data.visibility : 'public', //draft, public, private
            // license : this.sculp-data.visibility? this.sculp-data.visibility : '', 
            // shaderSource: this.sculp-data.shaderSource? this.sculp-data.shaderSource: defaultFragSource,
            id: '',
            title: '',
            favorites: 0,
            views: 0,
            comments: 0,
            forks: 0,
            sculpture: null
        };
    },
    mounted() {
        console.log('testttt');
        console.log(this.sculpdata);
        this.sculpture = new Sculpture();
        this.$store.state.scene.add(this.sculpture.mesh);
        this.$store.state.displayedSculptures.push(this.sculpture);
        
        // console.log(this.$store.state.scene);

        // let grid = {x: 1, z: 1, spacing: 4.0, size: 1.0, ceiling: 2.0};
        // let scene = this.$store.state.scene;
        // scene.remove(scene.getObjectByName('hl-boxes'));
        // scene.remove(scene.getObjectByName('sculptures'));

        // scene.add(create_hl_box(grid));
        // scene.add(create_sculps(grid, [], this.$store.state.socket));
    },
    watch: {
        shaderSource: function (val) {
            if(this.sculpture) {
                this.sculpture.refresh_material();
            }
        }
    },
    computed: {
        currUserID () {
            return this.$store.getters.getUser.uid
        }
    },
    methods: {


    },
    destroyed: function() {
        let scene = this.$store.state.scene;
        scene.remove(scene.getObjectByName(this.id));
    }
};
</script>