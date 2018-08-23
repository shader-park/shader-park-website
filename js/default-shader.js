export const defaultVertexSource = `
varying vec4 worldPos;
void main()
{
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    worldPos = modelMatrix*vec4(position,1.0);

    gl_Position = projectionMatrix * mvPosition;
}
`;

export const defaultFragSource = `uniform mat4 projectionMatrix;
uniform float time;
uniform vec3 sculptureCenter;
varying vec4 worldPos;

// Define the signed distance function (SDF) of you object here
float map(vec3 p) {
	return length(p)-0.3;
}

// Compute intersection of ray and SDF. You probably won't need to modify this.
float intersect(vec3 ro, vec3 rd) {
	float t = 0.;
	for(int i = 0; i < 128; ++i) {
		float h = map((ro+rd*t) - sculptureCenter);
		if(h < 0.001 || t>1.) break;
		t += h*0.9;
	}
	return t;
}

// Calculate the normal of a SDF
vec3 calcNormal( in vec3 pos )
{
    pos -= sculptureCenter;
    vec2 e = vec2(1.0,-1.0)*0.0005;
    return normalize( e.xyy*map( pos + e.xyy ) + 
		      e.yyx*map( pos + e.yyx ) + 
		      e.yxy*map( pos + e.yxy ) + 
		      e.xxx*map( pos + e.xxx ) );
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p) {
	vec3 lightdir = normalize(vec3(0.0, 1.0, 0.0));
	vec3 normal = calcNormal(p);
	float value = clamp(dot(normal, lightdir),0.0, 1.0);
	return vec3(value * 0.3 + 0.7);
}

void main() {

	vec3 ro = worldPos.xyz;
	vec3 rd = normalize(worldPos.xyz-cameraPosition);

	float t = intersect(ro, rd);
	if(t < 1.) {
		vec3 p = (ro + rd*t);
		vec4 sp = projectionMatrix*viewMatrix*vec4(p,1.0);
		vec3 c = shade(p);
		gl_FragColor = vec4(c, 1.0);
		gl_FragDepthEXT = (sp.z/sp.w) * 0.5 + 0.5;
	} else {
		discard;
	}
}
`;