color(0.3,0.9,0.5);
basicLighting();
occlusion();

let ringCount = 6;

for (let i=0; i<ringCount; i++) {
	let portion = i/ringCount;
	let ringCycle = add( 2*Math.PI*portion, time);
	let radius = sub( 0.25, mult( cos(ringCycle), 0.2 ) );
	color(portion,portion,portion);
	displace(0.0, mult( 0.2, sin(ringCycle) ), 0.0);
	torus( radius, 0.04);
	reset();
}

intersect();
torus(0.25,0.22);