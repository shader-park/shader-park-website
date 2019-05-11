
// Some Classes
/*
class Float {
	constructor(name) {
		this.name = name;
	}

	toString() {
		return this.name;
	}
}
*/


// glsl transpilers


function buildGeoSource(geo) {
	src = "float surfaceDistance(vec3 p) {\n";
	src += "float d = 99999999999.0;\n";
	src += geo;
	src += "return d;\n}";
	return src;
}

function buildColorSource(col) {
	src = "vec3 shade(vec3 p, vec3 normal) {\n";
	src += "vec3 lightDirection = vec3(0.0, 1.0, 0.0);\n";
	src += "float light = 0.9;\n";
	src += "vec3 color = vec3(1.0,1.0,1.0);\n";
	src += col;
	src += "return color*light;\n}";
	return src;
}

////// Default

function sourceGenerator(jsSrc) {

	let src = "";
	let varCount = 0;
	let debug = true;

	// put each of these inside other function, and unless passed
	// extra inline parameter, assign a variable to the string value. 
	// Also have all other math functions assign variables with types to their returns

	function makeVar(source, type, dims, inline) {
		this.type = type;
		this.dims = dims;
		if (inline) {
			this.name = source;
		} else {
			let vname = "v_" + varCount;
			src += this.type + " " + vname + " = " + source + ";\n";
			varCount += 1;
			this.name = vname;
		}
		this.toString = function() {
			return this.name;
		}
		return this;
	}

	// Need to handle cases like - vec3(v.x, 0.1, mult(0.1, time))

	function float(source, inline) {
		if (typeof source === 'number') {
			source = collapseToString(source);
		}
		return new makeVar(source, 'float', 1, inline);
	}

	function vec2(source, y, inline) {
		if (typeof source === 'number') {
			source = "vec2(" + collapseToString(source) + ", " 
							 + collapseToString(y) + ")";
		}
		let self = new makeVar(source, 'vec2', 2, inline);
		self.x = new makeVarWithDims(self.name + ".x", 1, true); //self.name + ".x";
		self.y = new makeVarWithDims(self.name + ".y", 1, true); //self.name + ".y";
		return self;
	}

	function vec3(source, y, z, inline) {
		if (typeof source === 'number') {
			source = "vec3(" + collapseToString(source) + ", " 
							 + collapseToString(y) + ", " 
							 + collapseToString(z) + ")";
		}
		let self = new makeVar(source, 'vec3', 3, inline);
		self.x = new makeVarWithDims(self.name + ".x", 1, true);//self.name + ".x";
		self.y = new makeVarWithDims(self.name + ".y", 1, true);//self.name + ".y";
		self.z = new makeVarWithDims(self.name + ".z", 1, true);//self.name + ".z";
		return self;
	}

	function vec4(source, y, z, w, inline) {
		if (typeof source === 'number') {
			source = "vec4(" + collapseToString(source) + ", " 
							 + collapseToString(y) + ", " 
							 + collapseToString(z) + ", "
							 + collapseToString(w) + ")";
		}
		let self = new makeVar(source, 'vec4', 4, inline);
		self.x = new makeVarWithDims(self.name + ".x", 1, true);//self.name + ".x";
		self.y = new makeVarWithDims(self.name + ".y", 1, true);//self.name + ".y";
		self.z = new makeVarWithDims(self.name + ".z", 1, true);//self.name + ".z";
		self.w = new makeVarWithDims(self.name + ".w", 1, true);//self.name + ".w";
		return self;
	}

	function makeVarWithDims(source, dims, inline) {
		if (dims < 1 || dims > 4) compileError("Tried creating variable with dim: " + dims);
		if (dims === 1) return new float(source, inline);
		if (dims === 2) return new vec2(source, inline);
		if (dims === 3) return new vec3(source, inline);
		if (dims === 4) return new vec4(source, inline);
	}

	// Modes enum (TODO remove shell, it is not really a mode. It is same category as expand)
	const modes = {
		UNION: 10,
		DIFFERENCE: 11,
		INTERSECT: 12,
		BLEND: 13,
		MIX: 14,
		SHELL: 15,
	};
	//let extraParamCutoff = 13;
	let currentMode = modes.UNION;
	let blendAmount = 0.0;
	let mixAmount = 0.0;
	let shellDepth = 0.0;

	let time = new float("time", true);
	let x = new float("p.x", true);
	let y = new float("p.y", true);
	let z = new float("p.z", true);
	let p = new vec3("p", null, null, true);

	function compileError(err) {
		console.log(err, " char: " + src.length);
	}

	function ensureScalar(funcName, val) {
		let tp = typeof val;
		if (typeof val !== 'number' && val.type !=='float') {
			compileError("'"+funcName+"'" + " accepts only a scalar. Was given: '" + val.type + "'");
		}
	}

	function ensureGroupOp(funcName, a, b) {
		if (typeof a !== 'string' && typeof b !== 'string') {
			if (a.dims !== 1 && b.dims !== 1 && a.dims !== b.dims) {
				compileError("'" + funcName + "'" + 
					" dimension mismatch. Was given: '" + a.type + "' and '" + b.type + "'");
			}
		}
	}

	function collapseToString(val) {
		if (typeof val === 'string') {
			return val;
		} else if (typeof val === 'number') {
			return val.toFixed(8);
		} else {
			return val.toString();
		}
	}

	// Modes (prepend these with GEO or something to indicate they are geometry modes?)

	function union() {
		currentMode = modes.UNION;
	}

	function difference() {
		currentMode = modes.DIFFERENCE;
	}

	function intersect() {
		currentMode = modes.INTERSECT;
	}

	function blend(amount) {
		currentMode = modes.BLEND;
		ensureScalar("blend",amount);
		blendAmount = amount;
	}

	function mix(amount) {
		currentMode = modes.MIX;
		ensureScalar("mix",amount);
		mixAmount = amount;
	}

	function shell(depth) {
		currentMode = modes.SHELL;
		ensureScalar("shell",depth);
		shellDepth = depth;
	}

	function getMode() {
		switch (currentMode) {
			case modes.UNION:
				return ["add"];
				break;
			case modes.DIFFERENCE:
				return ["subtract"];
				break;
			case modes.INTERSECT:
				return ["intersect"];
				break;
			case modes.BLEND:
				return ["smoothAdd",blendAmount];
				break;
			case modes.MIX:
				return ["mix",mixAmount];
				break;
			case modes.SHELL:
				return ["shell",shellDepth];
				break;
			default:
				return ["add"];
		}
	}

	function applyMode(prim) {
		let cmode = getMode();
		src += "d = "+ cmode[0] + "( " + prim + ", d " +
			(cmode.length > 1 ? "," + collapseToString(cmode[1]) : "") + " );\n"
	}

	function tryMakeNum(v) {
		if (typeof v === 'number') {
			return new float(v);
		} else {
			return v;
		}
	}

	/// Math ///

	// Group ops

	function mult(a,b) {
		if (typeof a === 'number' && typeof b === 'number') return (a*b);
		a = tryMakeNum(a);
 		b = tryMakeNum(b);
 		if (debug) {
			console.log("multiplying...");
			console.log("a: ", a);
			console.log("b: ", b);
		}
 		ensureGroupOp("mult", a, b);
 		let dims = Math.max(a.dims, b.dims);
 		return new makeVarWithDims("(" + collapseToString(a) + "*" + collapseToString(b) + ")", dims);
	}

	function add(a,b) {
 		if (typeof a === 'number' && typeof b === 'number') return (a+b);
 		a = tryMakeNum(a);
 		b = tryMakeNum(b);
 		if (debug) {
			console.log("adding...");
			console.log("a: ", a);
			console.log("b: ", b);
		}
 		ensureGroupOp("add", a, b);
 		let dims = Math.max(a.dims, b.dims);
 		return new makeVarWithDims("(" + collapseToString(a) + "+" + collapseToString(b) + ")", dims);
	}

	function sub(a,b) {
 		if (typeof a === 'number' && typeof b === 'number') return (a-b);
 		a = tryMakeNum(a);
 		b = tryMakeNum(b);
 		if (debug) {
			console.log("subtracting...");
			console.log("a: ", a);
			console.log("b: ", b);
		}
 		ensureGroupOp("sub", a, b);
 		let dims = Math.max(a.dims, b.dims);
 		return new makeVarWithDims("(" + collapseToString(a) + "-" + collapseToString(b) + ")", dims);
	}

	// a -> a

	function sin(x) {
		x = tryMakeNum(x);
		if (debug) {
			console.log("sine...");
			console.log("x: ", x);
		}
		return new makeVarWithDims("sin(" + x + ")", x.dims);
	}

	// Built-in primitives

	function sphere(radius) {
		ensureScalar("sphere",radius);
		applyMode("sphere(p, " + collapseToString(radius) + ")"); 
	}

	// Displacements

	function displace(xc, yc, zc) {
		if (yc === undefined || zc === undefined) {
			// ensureVec3()
			src += "p -= " + collapseToString(vec3) + ";\n";
		} else {
			ensureScalar("displace",xc);
			ensureScalar("displace",yc);
			ensureScalar("displace",zc);
			src += "p -= vec3( " + collapseToString(xc) + ", " 
								 + collapseToString(yc) + ", " 
								 + collapseToString(zc) + ");\n";
		}
	}

	function expand(amount) {
		ensureScalar("expand",amount);
		src += "d -= " + collapseToString(amount) + ";\n";
	}

	// function shell(depth) {}

	function rotateX(angle) {
		ensureScalar("rotateX",angle);
		src += "p.yz = p.yz*rot2(" + collapseToString(angle) + ");\n";
	}

	function rotateY(angle) {
		ensureScalar("rotateY",angle);
		src += "p.xz = p.xz*rot2(" + collapseToString(angle) + ");\n";
	}

	function rotateZ(angle) {
		ensureScalar("rotateZ",angle);
		src += "p.xy = p.xy*rot2(" + collapseToString(angle) + ");\n";
	}

	function mirrorX() {
		src += "p.x = abs(p.x);\n";
	}

	function mirrorY() {
		src += "p.y = abs(p.y);\n";
	}

	function mirrorZ() {
		src += "p.z = abs(p.z);\n";
	}



	// Lighting

	function basicLighting() {
		src += "light = simpleLighting(p, normal, lightDirection);\n";
	}

	function test() {
		src += "//this is a test\n";
	}

	eval(jsSrc);

	return src;

}

let generateGLSL = function(geoSrc, colorSrc) {
	// This doesn't need to be code, could just be a drop down or not even exist
	return {
		    geoGLSL: buildGeoSource(sourceGenerator(geoSrc)), 
		  colorGLSL: buildColorSource(sourceGenerator(colorSrc))
		};
}

let gs = 
`let radius = 0.3;
let test = vec3(0.5,0.5,0.5);
let r2 = float(2.0);
rotateY(time);
displace(-0.15,0.0,add(r2,r2));
sphere(radius);
displace(0.3,0.0,mult(0.1, sin(mult(10.0,z))));
sphere(sub(add(mult(r2,radius),test.y),0.3));
displace(-0.15,mult(0.1,x),0.0);
difference();
sphere(0.25);`;

let cs = 
`basicLighting();`;


let glsl = generateGLSL(gs,cs);
console.log( glsl.geoGLSL + "\n" + glsl.colorGLSL );


///////////////////////////////////////////////////////

let defaultSource =
`float surfaceDistance(vec3 p) {
    float d = sphere(p, 0.3);
	return d;
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
    vec3 lightDirection = vec3(0.0, 1.0, 0.0);
    float light = simpleLighting(p, normal, lightDirection);
    vec3 color = vec3(1.0, 1.0, 1.0);
	return color*light;
}`

let cup =
`float chunk(vec3 p, float r, float h) {
float d = cylinder(p, vec3(0.0, 0.0, r));
d = intersect(d, box(p,vec3(0.4,h,0.4)));
return d;
}

float cup(vec3 p, float rad, float height) {
float d = chunk(p,rad, height);
vec3 op = p;
p *= 1.15;
p.y -= 0.1;
float di = chunk(p,rad,height);
d = subtract(di,d);
d = add(d, torus(op+vec3(0.0,-height,0.0),vec2(rad-0.015,0.015)));
return d;
}

float handle(vec3 p, float r) {
p.xz = rot2(time)*p.xz;
p = p.yxz;
p.z -= 0.22;
p.x -= 0.01;
p.x = p.x*p.x*5.5;
float d = torus(p, vec2(0.15,0.03));
d = subtract(plane(p,vec4(0.0,0.0,1.0,0.02)),d);
return d*0.6;
}

float rad = 0.2;
float height = 0.23;

float phase() {
/*
float tn = tan(time*0.5);
return 1.0/(tn*tn*tn*tn+1.0);
*/
return 0.0;
}

float surfaceDistance(vec3 p) {
vec3 op = p;
float d = cup(p, rad,height);
float h = handle(op,0.1);
d = smoothAdd(d,h,0.02);
d = mix(d,sphere(op,0.3),phase());
return d;
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
float light = simpleLighting(p, normal, lightDirection);
vec3 color = vec3(1.0, 1.0, 1.0);
color.bg = vec2(sign(sin(117.0*p.y))*0.5+0.5);
if (cup(p,rad,height)>handle(p,rad)) {
//color = vec3(1.0,0.0,0.0);
color.bg = vec2(1.0);
}
float occ = occlusion(p*1.5,normal);
occ = 0.5 + 0.5*occ;
return color*light*occ;
}
`

let red_twister =
`float surfaceDistance(vec3 p) {
float r = length(p.xy);
float th = atan(p.x,p.y);
vec2 v = vec2(r,p.z);
v.x -= 0.3;
float f = 7.0;
float amp = 0.1;
v.x += amp*sin(f*th);
v.y += amp*cos(f*th);
float d = length(v)-0.09;
return d*0.28;
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
float r = length(p.xy);
float th = atan(p.x,p.y);
vec3 v = vec3(r,0.0,p.z);
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
float occ = occlusion(p,normal)+0.05;
occ = pow(occ,0.5)*2.0;
float light = simpleLighting(p, normal, lightDirection);
vec3 color = vec3(1.000,0.040,0.068);
return color*light*occ;
}`

let green_flower =
`float surfaceDistance(vec3 p) {
float speed = 2.0;
p.xz = rot2(2.4*length(p)
*sin(speed*time)
+0.7*cos(speed*time))*p.xz;
float d = sphere(p, 0.4);
vec3 np = normalize(p);
vec4 fb = sphericalDistribution(np,120.0+60.0*sin(0.0*time));
vec3 scA = toSpherical(np);
vec3 scB = toSpherical(fb.xyz);
vec2 uv = vec2(scA.y-scB.y, scA.z-scB.z);
float r = 0.8*fb.w;
d += r;
// d += 0.1*distance(fb.xyz,np);//0.1*fb.w;//0.1*length(uv);
return d*0.4;
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
float light = simpleLighting(p, normal, lightDirection);
vec3 color = vec3(1.0, 1.0, 1.0);
vec3 m = mouseIntersection();
vec3 mp = normalize(m);
vec4 fbM = sphericalDistribution(mp,70.0+60.0*sin(0.0*time));
vec3 np = normalize(p);

vec4 fb = sphericalDistribution(np,1170.0+60.0*sin(0.0*time));
//if (distance(fbM.xyz,fb.xyz) < 0.01) light = 0.0;
//light = floor(27.0*fb.w);
vec3 scA = toSpherical(np);
vec3 scB = toSpherical(fb.xyz);
vec2 uv = vec2(scA.y-scB.y, scA.z-scB.z);
//light = sin(32.0*length(uv))*0.5+0.5;
//light = fb.y;
vec3 rd = getRayDirection();
float lt = abs(dot(rd,normal));
lt = (lt);
light += 1.2-1.2*lt;
color.rb *= smoothstep(0.36,0.41,length(p))+0.2;
color.r += smoothstep(0.35,0.38,length(p));
float occ = occlusion(p,normal)*1.0+0.1;
return color*light*occ;
}`

let orange_blobs =
`float surfaceDistance(vec3 p) {
float dist = 0.9;
const float smoothness = 0.22;
const int sphere_count = 6;
for (int i=0; i<sphere_count; i++) {
float fi = float(i)+0.002*time;
vec3 offset = 0.3*vec3(
sin(357.81*fi+8.2),
cos(235.15*fi+3.1)+0.3,
cos(278.42*fi+0.9)
);
dist = smoothAdd(dist, sphere(p+offset, 0.12),smoothness);
}
return smoothAdd(dist,box(p+vec3(0.0,0.9,0.0),vec3(0.48)),smoothness);
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
float light = 1.0*simpleLighting(p, normal, lightDirection);
light *= shadow(p,lightDirection,0.16);
vec3 color = vec3(1.000,0.455,0.061);
return color*light;
}
"
green grinder -
"
// Define the signed distance function (SDF) of your object here
float surfaceDistance(vec3 p) {
p.z *= 0.3;
float dist = 10.0;
mat2 rot = rot2(4.0*p.y);
const int rings = 10;
const float ringz = float(rings);
for (int i=0; i<rings; i++) {
vec3 offset = vec3(osc(0.021,0.25,0.0)*cos(TAU*float(i)/ringz+0.3*time),
0.0, osc(0.021,0.25,0.0)*sin(TAU*float(i)/ringz+0.3*time));
dist =
smoothAdd(
dist,
torus(p.yzx+offset,0.5*vec2(osc(0.2)*0.3,0.01)),
0.08
);
}
return dist;
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
float light = simpleLighting(p, normal, lightDirection);
light = pow(light,4.0)+0.3;
vec3 color = vec3(0.8, 0.8, 0.8);
color.g *= 6.0*length(p.xy);
color.r *= 15.0*abs(p.z);
return color*light*(pow(clamp(occlusion(p,normal),0.01,1.0),0.25));
}`

let cotton_candy_tree =
`float surfaceDistance(vec3 p) {

p.y += 0.2;
//p += 0.008*noise(6.0*p);
float len = 0.18;
float width = 0.025;

p.x = abs(p.x);
p.z = abs(p.z);

float d = capsule(p,
vec3(0.0,-0.5*len-0.12,0.0),
vec3(0.0,0.5*len+0.03,0.0),
width);
const int iters = 6;
float it = float(iters);

for (int i=0; i<iters; i++) {
float fi = float(i);
float fr = fi/it;
float ang = 0.5*pow(1.5,-fi);
p.y -= len;//len*sin(ang);
float offs = ang/(PI*0.5);
float comp = 1.25;
p.x -= len*offs;
p.z -= len*offs*0.8;
p.xy = rot2(ang*comp)*p.xy;
p.yz = rot2(-ang/comp)*p.yz;
p.xz = rot2(0.1+0.04*sin(time))*p.xz;

//p = abs(p);
p.x = abs(p.x);
p.z = abs(p.z);
float alen = (1.0-1.0*fr);
if (i==iters-1) alen = 0.9;
d = smoothAdd(d, capsule(p,
vec3(0.0,-0.5*len,0.0),
vec3(0.0,0.5*len,0.0),
width*alen), 0.02*alen);
len *= 0.75;
}

return d;
}

// Here you can define how your object at point p will be colored.
vec3 shade(vec3 p, vec3 normal) {
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
float light = simpleLighting(p, normal, lightDirection);
vec3 color = vec3(1.0, 1.0, 1.0);
float rad = length(p+vec3(0.0,0.1,0.0));
color.rb += 5.0*pow(1.9*rad,27.0);
float ao = occlusion(p,normal);
float bark = 1.0;
float nz = noise(200.0*p)-1.2;
bark = smoothstep(0.46,0.45, rad)*nz*0.2;
//if (rad < 0.46) bark = nz*0.2 + 0.5;
return color*light*ao+bark;
}`