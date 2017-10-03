#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

#define PI 3.1415926535898

#define max_ray_steps 12;
#define max_de_steps 14;

 mat4 M = mat4
	(
		-5.740254e-01,
		4.547220e-01,
		1.309093e+00,
		0.000000e+00,
		-4.547220e-01,
		1.276698e+00,
		-6.428610e-01,
		0.000000e+00,
		-1.309093e+00,
		-6.428610e-01,
		-3.507233e-01,
		-0.000000e+00,
		3.896400e-01,
		-1.814425e-01,
		-5.258469e-02,
		1.000000e+00
	);

float aspect_ratio = resolution.y / resolution.x;
float ray_scale = (1. / max(resolution.x, resolution.y)) * .6;
float fov = tan(45. * 0.017453292 * 0.67);

float mandelbox(vec3 p){
	vec4 q = vec4(p,.5);
	for(int i=0;i<14;i++){
		q = M * abs(q);	
	}
	float d = length(q) * pow(1.5,-14.);
	return d;
}

float de(vec3 z){
	float r;
	float Scale= 2.;
	
	float Offset= 0.3;
		
	for(int n= 0; n< 8;n++){
		if(z.x+z.y <0.) z.xy = -z.yx; // fold1;
		if(z.x+z.z <0.) z.xz = -z.zx; // fold2;
		if(z.y+z.z <0.) z.zy = -z.yz; // fold3;
		z = z*Scale - Offset*(Scale-1.0);
		
		
	}
	return (length(z)) * pow(2.0, -float(8));
	return 1.;
	
}

void main(){	

	vec2 tx = (gl_FragCoord.xy / resolution) - .5;
	
	float a = time*0.2;
	float sa = sin(a);
	float ca = cos(a);
	
	
	
	
	//float fov  = tan(45. * 0.017453292 * sin(time*0.1));
		
	vec3 dir = vec3(tx.x * fov, tx.y * fov * aspect_ratio, 1.);
	
	dir.xy = vec2(dir.x * ca - dir.y * sa,dir.x * sa + dir.y * ca);
	dir.xz = vec2(dir.x * ca - dir.z * sa, dir.x  * sa + dir.z * ca); 
	
	dir = normalize(dir);
	
	vec3 cam = vec3(0.0,0.,-2.5);
	
	cam.xz = vec2(cam.x * ca - cam.z * sa, cam.x * sa + cam.z * ca);
	
	// ray <- cam 
	

	//vec3 ray = vec3(1.);

	vec3 ray = cam;
		
	float l = 0.; 
	float d = 0.; 
	float e = 0.00001; 
	float it = 0.;
	
	for(int i=0;i<12;i++){
		d = de(ray);
		ray += d * dir;
		l += d;
		if(d<e) break;
		
		e = ray_scale * l;
		it++;
		
	}
	
	float f = 1. - (it / float(12));
	
	float s = max(0.0,pow(1.0-d,50.));
	
	//vec3 bg = vec3(pow(length(tx),3.5));
	
	vec3 bg = vec3(pow(length(tx),3.5));	       
	
	gl_FragColor = vec4(bg + f,1.0);

}