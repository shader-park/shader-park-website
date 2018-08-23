// import * as THREE from 'three';
// import Sculpture  from "./sculpture";

// export class Room {
//     constructor(scene, sculpturesData, grid) {
//         this.sculpturesData = sculpturesData;
//         this.grid = grid ? grid : {spacing: 4.0, size: 1.0, ceiling: 2.0};

//         const roomContainerGeom = new THREE.BoxBufferGeometry(
//             grid.x * grid.spacing, grid.ceiling, grid.z * grid.spacing);
//         const roomContainerMat = new THREE.MeshBasicMaterial(
//             {color: new THREE.Color(1.0, 1.0, 1.0), side: THREE.BackSide});
//         this.roomContainer = new THREE.Mesh(roomContainerGeom, roomContainerMat);
//         scene.add(this.roomContainer);

//         // highlight_box = create_hl_box(grid);
//         // scene.add(highlight_box);

//         // this.sculps = create_sculps(grid, existing_sculps, socket);

//         // scene.add(sculps);

//     }

//     render(renderer) {

//     }
// }