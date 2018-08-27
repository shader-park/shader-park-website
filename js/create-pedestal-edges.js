import * as THREE from 'three';

/**
 * Creates thin edges for a pedestal given its dimensions
 * @param pedSize width and depth of the pedestal. The same value is
 * used for both because they are square
 * @param pedHeight height of the pedestal
 * @todo these could change color/size to represent selection?
 * Add ability to set all their colors with a single call
 * Could be made into class
 */

export function createPedestalEdges(pedSize, pedHeight) {

    const edgeSize = pedSize * 0.005;
    const longEdgeGeom = new THREE.BoxBufferGeometry(edgeSize, edgeSize, pedSize + 1.0*edgeSize);
    const shortEdgeGeomVertical = new THREE.BoxBufferGeometry(edgeSize, pedHeight, edgeSize);
    const shortEdgeGeomHorizontal = new THREE.BoxBufferGeometry(pedSize, edgeSize, edgeSize);
    const edgeMat = new THREE.MeshBasicMaterial({color: new THREE.Color(1.0, 1.0, 1.0)});
    const edgeGroup = new THREE.Group();

    const longUL = new THREE.Mesh(longEdgeGeom, edgeMat);
    longUL.position.x -= pedSize*0.5;
    longUL.position.y += pedHeight*0.5;
    edgeGroup.add(longUL);

    const longUR = new THREE.Mesh(longEdgeGeom, edgeMat);
    longUR.position.x += pedSize*0.5;
    longUR.position.y += pedHeight*0.5;
    edgeGroup.add(longUR);

    const longBL = new THREE.Mesh(longEdgeGeom, edgeMat);
    longBL.position.x -= pedSize*0.5;
    longBL.position.y -= pedHeight*0.5;
    edgeGroup.add(longBL);

    const longBR = new THREE.Mesh(longEdgeGeom, edgeMat);
    longBR.position.x += pedSize*0.5;
    longBR.position.y -= pedHeight*0.5;
    edgeGroup.add(longBR);

    const shortUF = new THREE.Mesh(shortEdgeGeomHorizontal, edgeMat);
    shortUF.position.z += pedSize*0.5;
    shortUF.position.y += pedHeight*0.5;
    edgeGroup.add(shortUF);

    const shortUB = new THREE.Mesh(shortEdgeGeomHorizontal, edgeMat);
    shortUB.position.z -= pedSize*0.5;
    shortUB.position.y += pedHeight*0.5;
    edgeGroup.add(shortUB);

    const shortLF = new THREE.Mesh(shortEdgeGeomVertical, edgeMat);
    shortLF.position.x -= pedSize*0.5;
    shortLF.position.z += pedSize*0.5;
    edgeGroup.add(shortLF);

    const shortRF = new THREE.Mesh(shortEdgeGeomVertical, edgeMat);
    shortRF.position.x += pedSize*0.5;
    shortRF.position.z += pedSize*0.5;
    edgeGroup.add(shortRF);

    const shortLB = new THREE.Mesh(shortEdgeGeomVertical, edgeMat);
    shortLB.position.x -= pedSize*0.5;
    shortLB.position.z -= pedSize*0.5;
    edgeGroup.add(shortLB);

    const shortRB = new THREE.Mesh(shortEdgeGeomVertical, edgeMat);
    shortRB.position.x += pedSize*0.5;
    shortRB.position.z -= pedSize*0.5;
    edgeGroup.add(shortRB);

    const shortBF = new THREE.Mesh(shortEdgeGeomHorizontal, edgeMat);
    shortBF.position.z += pedSize*0.5;
    shortBF.position.y -= pedHeight*0.5;
    edgeGroup.add(shortBF);

    const shortBB = new THREE.Mesh(shortEdgeGeomHorizontal, edgeMat);
    shortBB.position.z -= pedSize*0.5;
    shortBB.position.y -= pedHeight*0.5;
    edgeGroup.add(shortBB);

    return edgeGroup;
}