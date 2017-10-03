#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define PI 3.1415926535898

const int MAX_RAY_STEPS = 12;
const int MAX_DE_STEPS = 14;

float ray_scale = (1. / max(resolution.x, resolution.y)) * .67;

float de(vec3 Z){
	float r,p,d = 1.,t = .1;
	vec3 z = Z;
	for(int i=0;i<10;i++){
		r = length(z);
		if(r > 4.) break;
		float a = acos(z.z / r) + fract(t/20.) * 6.3;
		float b = atan(z.y,z.x);
		p = pow(r,8.);
		d = p / r * 8. +1.;
		z = p * vec3(sin(a*=8.) * cos(b*=8.),sin(b) * sin(a),cos(a)) + z;
		
		
	}
	
	return .5 * log(r) * r / d;
	
}

vec3 raymarch(in vec3 from, in vec3 dir) {
		
	float l = 0.; 
	float d = 0.; 
	float e = 0.00001; 
	float it = 0.;
	float ao;
	
	for(int i=0;i<12;i++){
		d = de(from);
		from += d * dir;
		l += d;
		if(d<e) break;
		
		e = ray_scale * l;
		it++;	
	}	
	float f = 1. - (it / float(12));
		
	return  vec3(f);
}

vec3 lightdir=normalize(vec3(-0.,-0.5,-1.));
float aspect_ratio = resolution.y / resolution.x;
float fov = tan(45. * 0.17453292 * .7);

void main(){
	
	
	vec2 tx = (gl_FragCoord.xy / resolution ) - .5;
	
	
	float a = time * 0.4;
	float sa = sin(a);
	float ca = cos(a);
	
	vec3 cam = vec3(0.0,0.,-3. );
		cam.xz = vec2(cam.x * ca - cam.z * sa, cam.x * sa + cam.z * ca);
	
//	float fov  = tan(4. * 0.17453292 * sin(time*.05));
	
	
	vec3 dir = vec3(tx.x * fov, tx.y * fov * aspect_ratio, 1.);
	
	
	dir.xy = vec2(dir.x * ca - dir.y * sa,dir.x * sa + dir.y * ca);
	dir.xz = vec2(dir.x * ca - dir.z * sa, dir.x  * sa + dir.z * ca); 
	
		
	
	vec3 col = raymarch(cam,dir);
	
	
	
	gl_FragColor = vec4(   col,1.0);
	
}	