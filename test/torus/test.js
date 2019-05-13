After:

let ringCount = 6;

for (let i=0; i<ringCount; i++) {
	let ringCycle = add( 2*Math.PI*i/ringCount, time);
	let radius = sub( 0.25, mult( cos(ringCycle), 0.2 ) );

	displace(0.0, mult( 0.2, sin(ringCycle) ), 0.0);
	torus( radius, 0.04);
	reset();
}

intersect();
torus(0.25,0.22);

////////////////////////////

color(vec3(0.3,0.9,0.5));
basicLighting();
occlusion();

Before:

// Define the signed distance function (SDF) of your object here
float surfaceDistance(vec3 p) {
	float d = 10.0;
	const int ringCount = 6;
	vec3 newp = p;

	for (int i=0; i<ringCount; i++) {
		float ringCycle = float(fi)/float(ringCount)*TAU+time;
		float radius = 0.25-0.2*cos(ringCycle);

		newp.y = p.y-0.2*sin(ringCycle);
		d = add(d, torus(newp, vec2(radius,0.04)));
	}

	d = max(torus(p,vec2(0.25,0.22)), d);

	return d;
}

/////////////////////////////

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
	vec3 lightDirection = vec3(0.0, 1.0, 0.0);
	float light = simpleLighting(p, normal, lightDirection);
	vec3 color = vec3(0.061,1.000,0.708);
	float ao = occlusion(p,normal);
	return color*light*ao;
}