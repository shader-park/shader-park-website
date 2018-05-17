
/*
 
float sdBox( vec2 p, vec2 b )
{
  vec2 d = abs(p) - b;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;
    uv -= 0.5;
    
    uv.x *= iResolution.x/iResolution.y;

    // Time varying pixel color
    float size_a = 0.05;
    float spacing = size_a*2.0;
    float size_outer = 0.3;
    vec3 col;
    if (sdBox(mod(uv+0.5*size_a,spacing), vec2( size_a ) ) > 0.0 && 
        sdBox(uv, vec2(size_outer)) < 0.0  ) {
    	col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    } else {
    	col = vec3(0.0);
    }

*/

/* Why not hack collisions together using SDFs? */

// This could be made into a class and contain the anonymous "grid" object in main.js

import * as THREE from './three.module.js';

export function collides_grid( p, grid ) {
	//console.log(map(p,grid));
	return (map(p, grid) < 0.0);
}

export function map( p, grid) {
	let md = new THREE.Vector3( 
		(p.x+0.5*grid.size) % grid.spacing, 
		(p.y+0.5*grid.size) % grid.spacing,
		(p.z+0.5*grid.size) % grid.spacing );
	let d_sculps = sdBox( md, new THREE.Vector3( grid.size, grid.size, grid.size ) );
	//let total_d = Math.min( sdBox( whole room ), d_scupls );
	return d_sculps;
}

export function get_normal( p, grid ) {

	let d = 0.001;
	let dir = new THREE.Vector3(
		map(p.clone().add(new THREE.Vector3(d,0,0)), grid) - map(p.clone().add(new THREE.Vector3(-d,0,0)), grid),
		map(p.clone().add(new THREE.Vector3(0,d,0)), grid) - map(p.clone().add(new THREE.Vector3(0,-d,0)), grid),
	 	map(p.clone().add(new THREE.Vector3(0,0,d)), grid) - map(p.clone().add(new THREE.Vector3(0,0,-d)), grid));
	console.log(dir);
	return dir.normalize();
}

export function sdBox(p, box) {
	let d = (new THREE.Vector3(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z))).sub(box);
	return Math.min(Math.max(d.x,Math.max(d.y,d.z)),0.0) + d.max(new THREE.Vector3()).length();
}
