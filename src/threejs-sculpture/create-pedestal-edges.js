import { BoxBufferGeometry, MeshBasicMaterial, Color, Mesh, Group} from 'three';

/**
 * Creates thin edges for a pedestal given its dimensions
 * @param pedSize width and depth of the pedestal. The same value is
 * used for both because they are square
 * @param pedHeight height of the pedestal
 * @todo these could change color/size to represent selection?
 * Add ability to set all their colors with a single call
 * Could be made into class
 */

export function createPedestalEdges(pedSize, pedHeight, size = 0.005) {
  const edgeSize = pedSize * size;
  const longEdgeGeom =
      new BoxBufferGeometry(edgeSize, edgeSize, pedSize + 1.0 * edgeSize);
  const shortEdgeGeomVertical =
      new BoxBufferGeometry(edgeSize, pedHeight, edgeSize);
  const shortEdgeGeomHorizontal =
      new BoxBufferGeometry(pedSize, edgeSize, edgeSize);
  const edgeMat =
      new MeshBasicMaterial({color: new Color(1.0, 1.0, 1.0)});
  const edgeGroup = new Group();

  const longUL = new Mesh(longEdgeGeom, edgeMat);
  longUL.position.x -= pedSize * 0.5;
  longUL.position.y += pedHeight * 0.5;
  edgeGroup.add(longUL);

  const longUR = new Mesh(longEdgeGeom, edgeMat);
  longUR.position.x += pedSize * 0.5;
  longUR.position.y += pedHeight * 0.5;
  edgeGroup.add(longUR);

  const longBL = new Mesh(longEdgeGeom, edgeMat);
  longBL.position.x -= pedSize * 0.5;
  longBL.position.y -= pedHeight * 0.5;
  edgeGroup.add(longBL);

  const longBR = new Mesh(longEdgeGeom, edgeMat);
  longBR.position.x += pedSize * 0.5;
  longBR.position.y -= pedHeight * 0.5;
  edgeGroup.add(longBR);

  const shortUF = new Mesh(shortEdgeGeomHorizontal, edgeMat);
  shortUF.position.z += pedSize * 0.5;
  shortUF.position.y += pedHeight * 0.5;
  edgeGroup.add(shortUF);

  const shortUB = new Mesh(shortEdgeGeomHorizontal, edgeMat);
  shortUB.position.z -= pedSize * 0.5;
  shortUB.position.y += pedHeight * 0.5;
  edgeGroup.add(shortUB);

  const shortLF = new Mesh(shortEdgeGeomVertical, edgeMat);
  shortLF.position.x -= pedSize * 0.5;
  shortLF.position.z += pedSize * 0.5;
  edgeGroup.add(shortLF);

  const shortRF = new Mesh(shortEdgeGeomVertical, edgeMat);
  shortRF.position.x += pedSize * 0.5;
  shortRF.position.z += pedSize * 0.5;
  edgeGroup.add(shortRF);

  const shortLB = new Mesh(shortEdgeGeomVertical, edgeMat);
  shortLB.position.x -= pedSize * 0.5;
  shortLB.position.z -= pedSize * 0.5;
  edgeGroup.add(shortLB);

  const shortRB = new Mesh(shortEdgeGeomVertical, edgeMat);
  shortRB.position.x += pedSize * 0.5;
  shortRB.position.z -= pedSize * 0.5;
  edgeGroup.add(shortRB);

  const shortBF = new Mesh(shortEdgeGeomHorizontal, edgeMat);
  shortBF.position.z += pedSize * 0.5;
  shortBF.position.y -= pedHeight * 0.5;
  edgeGroup.add(shortBF);

  const shortBB = new Mesh(shortEdgeGeomHorizontal, edgeMat);
  shortBB.position.z -= pedSize * 0.5;
  shortBB.position.y -= pedHeight * 0.5;
  edgeGroup.add(shortBB);

  return edgeGroup;
}