<template>
    <div v-if="sculpPositions.length == sculptures.length">
        <sculpture v-for="(sculpture, index) in sculptures" :key="sculpture.id" 
                   :sculpPosition="sculpPositions[index]" :sculpData="sculpture"></sculpture>
    </div>
</template>

<script>


import Sculpture from './Sculpture.vue';
import {Vector3} from 'three';

export default {
    props: ['sculpturesData'],
    data: function() {
        return {
            grid : {x: 5, z: 0, spacing: 3.0, size: 1.0},
            sculptures : this.sculpturesData || [],
            sculpPositions: []
        }
    },
    mounted() {
        
        let index = 0;
        let col = 0;
        this.$store.commit('setDisplayCanvas', true);
        this.$store.commit('sculpturesLoaded', false);
        while (index < this.sculptures.length) {
            let row = 0;
            while (row < this.grid.x && index < this.sculptures.length) {
                let x = row * this.grid.spacing;
                let z = - col * this.grid.spacing ;
                let pos = new Vector3(x, 0, z);
                this.sculpPositions.push(pos);
                row++;
                index++;
            }
            col++;
        }
        setTimeout(() => { //wait for main thread to lag compiling shaders
            this.$store.commit('sculpturesLoaded', true);    
        }, 1);
    },
    components : {
        sculpture : Sculpture
    },
    computed : {
        MSDFTexture () {
            return this.$store.getters.getMSDFTexture;
        },
    }
}
</script>