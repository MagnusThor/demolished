#ifdef GL_ES
	precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable


// some fake postprocessing fun --novalis


uniform float time;
uniform vec2 resolution;
uniform float freq_data[32];
uniform float freq_time[32];


#define EPS 1e-3
#define PI 3.1415
#define INF 9e9

vec3 rotateX(vec3 p, float a) { float c = cos(a); float s = sin(a); return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z); }
vec3 rotateY(vec3 p, float a) { float c = cos(a); float s = sin(a); return vec3(c*p.x + s*p.z, p.y, c*p.z - s*p.x); }
vec3 rotateZ(vec3 p, float a) { float c = cos(a); float s = sin(a); return vec3(c*p.x - s*p.y, s*p.x + c*p.y, p.z); }
vec3 rotate(vec3 p, vec3 rot) { return rotateZ(rotateY(rotateX(p, rot.x), rot.y), rot.z); }

// http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

float displacement(vec3 p) {
	float d = 0.;
	const int STEPS = 1;
	for (int i=1; i<STEPS+1; i++) {
		d += 1./float(i) * dot(sin(float(i)*p), vec3(1.))/3.;
	}
	return d;
}

float udRoundBox(vec3 p, vec3 b, float r) {
	return length(max(abs(p)-b,0.0))-r;
}

float sdSphere(vec3 p, float s) {
    float f = freq_time[16] / 16.0;
	return f + length(p)-s;
}

float sdBox(vec3 p, vec3 b) {
	vec3 d = abs(p) - b;
	return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float scene(vec3 p) {
	vec3 p2 = rotate(p, vec3(.2*time,.3*time,.5*time));
	//float d = udRoundBox(p2, vec3(0.2,0.2,0.2), 5e-3) + 0.005*displacement(p2*70.);
	float d = sdSphere(p2, 0.3) + 0.03*sin(2.*time)*displacement(p2*70.);
	
	float room = -sdBox(p+vec3(0.,-1.5,0.), vec3(2.,2.,2.));
	return min(d, room);
}
	
vec3 normal(vec3 p) {
	vec2 e = vec2(EPS, 0.);
	float d = scene(p);
	return normalize(vec3(d-scene(p+e.xyy), d-scene(p+e.yxy), d-scene(p+e.yyx)));
}

vec3 lighting(vec3 p, vec3 lightPos) {
	vec3 n = normal(p);
	vec3 lightDir = normalize(p-lightPos);
	vec3 color = vec3(max(dot(lightDir,n), 0.));
	return color;
}

bool raytrace(vec3 ro, vec3 rd, out vec3 p) {
	float f = 0.;
	
	const float fMax = 10.;
	
	for (int i=0; i<256; i++) {
		p = ro+f*rd;
		float d = scene(p);
		if (d <= EPS) return true;
		if (f > fMax) return false;
		f += d;
	}
	
	return false;
}

void main(void) {
	vec2 uv = (2.*gl_FragCoord.xy-resolution.xy)/min(resolution.x,resolution.y);

	vec3 lightPos = vec3(1.0);
	
	
 

	vec3 ro = vec3(sin(time),-.2,cos(time));
	vec3 rd = normalize(rotate(vec3(uv,-1.), vec3(0.3,sin(time),0.0)));
	
	vec3 p;
	bool hit;
	vec3 color;
	// r
	hit = raytrace(ro, rotate(rd, vec3(0.,.01,0.)), p);
	if (hit) {
		color.r = lighting(p, lightPos).r;
	}
	// g
	hit = raytrace(ro, rd, p);
	if (hit) {
		color.g = lighting(p, lightPos).g;
	}
	// b
	hit = raytrace(ro, rotate(rd, vec3(0.,-.01,0.)), p);
	if (hit) {
		color.b = lighting(p, lightPos).b;
	}
	
	float vignette = smoothstep(2.0, 2.0-0.45, length(uv));
	color = mix(color, color*vignette, 0.5);
	gl_FragColor = vec4((pow(color, vec3(1./1.3))+0.08*rand(3.*uv)), 1.);

}