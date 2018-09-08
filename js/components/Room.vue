<template>
    <div>
        <sculpture v-if="sculptureGeomotries.length == sculptures.length" 
                   v-for="(sculpture, index) in sculptures" :key="sculpture.id" 
                   :sculpGeom="sculptureGeomotries[index]" :sculpData="sculpture"></sculpture>
    </div>
</template>

<script>


import Sculpture from './Sculpture.vue';
import * as SculpOBJ from '../SculptureN.js';

export default {
    props: ['sculpturesData'],
    data: function() {
        return {
            grid : {x: 3, z: 0, spacing: 4.0, size: 1.0},
            sculptures : this.sculpturesData || [],
            sculptureGeomotries: []
        }
    },
    mounted() {
        
        // this.sculptures.forEach(sculp => {
        //     const newSculp = new Sculpture(sculp.shaderSource);
        //     newSculp
        //     sculptureGeomotries.push(newSculp)
        //     // this.$store.state.scene.add(this.sculpture.mesh);
        //     // this.$store.state.objectsToUpdate.push(this.sculpture);
        //     // this.$store.state.objectsToRaycast.push(this.sculpture.mesh);
            
        // });

        let index = 0;
        let col = 0;
        while (index < this.sculptures.length) {
            let row = 0;
            while (row < this.grid.x && index < this.sculptures.length) {
                const newSculp = new SculpOBJ.Sculpture(this.sculptures[index].shaderSource);
                // const currMesh = this.sculptures[index].sculpture.mesh;
                let pos = newSculp.mesh.position;
                pos.x = row * this.grid.spacing;
                pos.z = col * this.grid.spacing;
                console.log('pushed another sculp');
                this.sculptureGeomotries.push(newSculp);
                row++;
                index++;
            }
            col++;
        }
        // this.sculptures.forEach(sculp => {
        //     sculp.sculpture.mesh.position
        // })
        //grid code
        // this.grid.x = this.sculptures.length ;
        // this.grid.z = 
        // const half_grid_x = Math.floor(grid.x / 2);
        // const half_grid_z = Math.floor(grid.z / 2);
        
        // for (let i = 0; i < grid.x; i++ ) {
        //     for (let j = 0; j < grid.z; j++) {
                
        //         sculp.mesh.position.x =  grid.spacing*(i-half_grid_x);
        //         sculp.mesh.position.z =  grid.spacing*(j-half_grid_z);
        //     }
        // }

        // let index = 0;
        // let col = 0;
        // while (index < this.sculptures.length) {
        //     let row = 0;
        //     while (row < this.grid.x && index < this.sculptures.length) {
        //         const currMesh = this.sculptures[index].sculpture.mesh;
        //         currMesh.position.x = row * spacing;
        //         currMesh.position.z = col * spacing;

        //         row++;
        //         index++;
        //     }
        //     col++;
        // }


        console.log('sculptures from room:')
        console.log(this.sculptures);
        // this.sculptures.
    },
    components : {
        sculpture : Sculpture
    }
    // watch: {
    //     initializedSculps: function (val) {
    //         if(val == this.sculptures.length) {
                
    //         }
    //     }
    // },
    // computed : {
    //     initializedSculps() {
    //         return this.$store.state.objectsToRaycast.length;
    //     }
    // }
}
</script>