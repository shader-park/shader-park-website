export const defaultVertexSource = `
varying vec4 worldPos;
void main()
{
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    worldPos = modelMatrix*vec4(position,1.0);

    gl_Position = projectionMatrix * mvPosition;
}
`;

export const defaultFragSource = `// Define the signed distance function (SDF) of you object here
float map(vec3 p) {
	return sphere(p, 0.3);
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p) {
    vec3 lightDirection = vec3(0.0, 1.0, 0.0);
    float light = simpleLighting(p, lightDirection);
    vec3 color = vec3(light, light, light);
	return color;
}
`;

export const sculptureStarterCode = `
uniform mat4 projectionMatrix;
uniform float time;
uniform vec3 sculptureCenter;

varying vec4 worldPos;
float stepSize = 0.9;
float map(vec3 p);

const float PI = 3.14159265;
const float TAU = PI*2.0;
const float TWO_PI = TAU;

// Primitives

float line(vec3 p, vec3 a, vec3 b) {
	vec3 pa = p-a;
  	vec3 ba = b-a;
	float t = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.);
  	return length(pa - ba*t);
}

//line with radius
float line( vec3 p, vec3 a, vec3 b, float radius ){
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - radius;
}

float sphere( vec3 p, float size ){
  return length(p)-size;
}

float uBox( vec3 p, vec3 b ){
  return length(max(abs(p)-b,0.0));
}

float uRoundBox( vec3 p, vec3 b, float r ){
  return length(max(abs(p)-b,0.0))-r;
}

float box( vec3 p, vec3 box ){
  vec3 d = abs(p) - box;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float roundedBox( vec3 p, vec3 box , float roundness){
  vec3 d = abs(p) - box;
  return min(max(d.x,max(d.y,d.z)),roundness) + length(max(d,0.0));
}

float torus( vec3 p, vec2 t ){
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float cylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float cone( vec3 p, vec2 c )
{
    // c must be normalized
    float q = length(p.xy);
    return dot(c,vec2(q,p.z));
}

float plane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

float hexPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
}

float triPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float capsule( vec3 p, vec3 a, vec3 b, float r )
{
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}

float cappedCylinder( vec3 p, vec2 h )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float triangularPrism( vec3 p, vec2 h ){
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float cappedCone( in vec3 p, in vec3 c )
{
    vec2 q = vec2( length(p.xz), p.y );
    vec2 v = vec2( c.z*c.y/c.x, -c.z );
    vec2 w = v - q;
    vec2 vv = vec2( dot(v,v), v.x*v.x );
    vec2 qv = vec2( dot(v,w), v.x*w.x );
    vec2 d = max(qv,0.0)*qv/vv;
    return sqrt( dot(w,w) - max(d.x,d.y) ) * sign(max(q.y*v.x-q.x*v.y,w.y));
}

float ellipsoid( in vec3 p, in vec3 r )
{
    return (length( p/r ) - 1.0) * min(min(r.x,r.y),r.z);
}

float dot2( in vec3 v ) { return dot(v,v); }

float uTriangle( vec3 p, vec3 a, vec3 b, vec3 c )
{
    vec3 ba = b - a; vec3 pa = p - a;
    vec3 cb = c - b; vec3 pb = p - b;
    vec3 ac = a - c; vec3 pc = p - c;
    vec3 nor = cross( ba, ac );
    return sqrt(
    (sign(dot(cross(ba,nor),pa)) +
     sign(dot(cross(cb,nor),pb)) +
     sign(dot(cross(ac,nor),pc))<2.0)
     ?
     min( min(
     dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
     dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
     dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
     :
     dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float add( float d1, float d2 )
{
    return min(d1,d2);
}

float subtract( float d1, float d2 )
{
    return max(-d1,d2);
}

float intersect( float d1, float d2 )
{
    return max(d1,d2);
}

vec3 repeat3D(vec3 p, vec3 c )
{
    return mod(p,c)-0.5*c;
}

float repeat1D(inout float p, float size)
{
	float halfSize = size * 0.5;
	float c = floor((p + halfSize) / size);
  	p = mod(p + halfSize, size)-halfSize;
  	return c;
}

mat2 rot2(float a){
    float c = cos(a); float s = sin(a);
	return mat2(c, s, -s, c);
}

// polynomial smooth min (k = 0.1) (from IQ)
float smoothAdd( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

float smoothSubtract(float a,float b, float k)
{
    return -smoothAdd(-a,-b,k);
}

vec2 hash( vec2 p ) // replace this by something better
{
	p = vec2( dot(p,vec2(127.1,311.7)),
			  dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 p )
{
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;
	vec2 i = floor( p + (p.x+p.y)*K1 );
	
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = step(a.yx,a.xy);    
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;
    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}

// Compute intersection of ray and SDF. You probably won't need to modify this.
float intersect(vec3 ro, vec3 rd, float stepFraction) {
	float t = 0.;
	for(int i = 0; i < 128; ++i) {
		float h = map((ro+rd*t) - sculptureCenter);
		if(h < 0.001 || t>1.) break;
		t += h*stepFraction;
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

float simpleLighting(vec3 p, vec3 normal, vec3 lightdir) {
    // Simple phong-like shading
    float value = clamp(dot(normal, normalize(lightdir)),0.0, 1.0);
	return value * 0.3 + 0.7;
}
`;

export const fragFooter = `
// For advanced users //
void main() {
	vec3 rayOrigin = worldPos.xyz;
	vec3 rayDirection = normalize(worldPos.xyz-cameraPosition);
	float t = intersect(rayOrigin, rayDirection, stepSize);
	if(t < 1.) {
		vec3 p = (rayOrigin + rayDirection*t);
		vec4 sp = projectionMatrix*viewMatrix*vec4(p,1.0);
		vec3 normal = calcNormal(p);
		vec3 c = shade(p-sculptureCenter, normal);
		gl_FragColor = vec4(c, 1.0);
		gl_FragDepthEXT = (sp.z/sp.w) * 0.5 + 0.5;
	} else {
		discard;
	}
}
`;
