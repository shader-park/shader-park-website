
<template>
    <div>
        <span>Favorites {{favorites}}</span>
        <span>Views {{views}}</span>
        <span>Comments {{comments}}</span>
        <span>Forks {{forks}}</span>
    </div>
</template>
<script>
import Sculpture from '../sculpture.js';

export default {
    data: function() {
        return {
            id : null,
            author : null,
            title : "",
            description : "",
            tags : "",
            timestamp : "",
            favorites : 0,
            views: 0,
            comments : 0,
            forks : 0,
            fork : null, //if a fork set to id
            featured : false, 
            image : "",
            visibility : "", //draft, public, private
            license : "",
            sculpture: null //
        };
    },
    mounted() {

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
            this.sculpture.refresh_material();
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