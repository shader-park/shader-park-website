
<template>
</template>
<script>
import {create_hl_box, create_sculps} from '../generate-scene.js';    
    // console.log(this.$store.state.scene);
    // console.log(grid);
    // console.log(this);
export default {
    
	mounted() {
		console.log(this.$store.state.scene);
		let grid = {x: 1, z: 1, spacing: 4.0, size: 1.0, ceiling: 2.0};
		let scene = this.$store.state.scene;
		scene.remove(scene.getObjectByName('hl-boxes'));
		scene.remove(scene.getObjectByName('sculptures'));

		scene.add(create_hl_box(grid));
		scene.add(create_sculps(grid, [], this.$store.state.socket));

	}
};
</script>