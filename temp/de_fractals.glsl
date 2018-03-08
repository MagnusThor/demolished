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
float ray_scale = (1. / max(resolution.x, resolution.y)) * .47;
//float fov = tan(45. * 0.017453292 * .67);
float fov = tan(45. * 0.17453292 * .7);

float de(vec3 p){
	vec4 q = vec4(p,.5);
	for(int i=0;i<14;i++){
		q = M * abs(q);	
	}
	float d = length(q) * pow(1.5,-14.);
	return d;
}


float de2(vec3 z){
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
	
	
}

float de4(vec3 r){
	float rad =.0,h = 0.,p = 8.,
	d = 1.;
	
	vec3 z = vec3(r.xyz);
	
	for(int i=0;i<10;i++){
		rad = length(r);
		if(rad > 2.) {
			h = .5 * log(rad) * rad / d;
		}else{
			float th = atan(length(z.xy),z.z);
			float phi = atan(z.y,z.x);
			float rado = pow(rad,8.);
			d = pow(rad,7.) * 7. * d + 1.;
			
			float sint = sin(th * p);
			z.x = rado * sint * cos(phi * p);
			z.y = rado * sint * sin(phi * p);
			z.z = rado * sint * cos(th * p);
				
			z += r;
		}
	}
	
	return h;
	
}


float de3(vec3 z0){
	
	vec4 c = vec4(z0,1.0),z = c;
	
	float r = length(z.xyz);
	float zr,zo,zi,pwr = 8.;
	for(int n=0;n<7  ;n++){
		zo = asin(z.z  * r) * pwr;
		zi = atan(z.y,z.x) * pwr;
		zr = pow(r,pwr -1.);
		z = zr*vec4(r*vec3(cos(zo)*vec2(cos(zi),sin(zi)),sin(zo)),z.w*pwr)+c;
		r = length(z.xyz);
		//if (r > 2.) break;
	}

	 return 0.5 *log(r) * r / z.w;
}






float ot=0.;
float det=0.;
const float detail=.1;

float shadow(vec3 pos, vec3 sdir) {
		float totalDist =2.0*det, sh=1.;
 		for (int steps=0; steps<30; steps++) {
			if (totalDist<1.) {
				vec3 p = pos - totalDist * sdir;
				float dist = de(p)*1.5;
				if (dist < detail)  sh=0.;
				totalDist += max(0.05,dist);
			}
		}
		return max(0.,sh);	
}

float kset(vec3 p) {
	p=abs(.5-act(p*20.));
	float es, l=es=0.;
	for (int i=0;i<13;i++) {
		float pl=l;
		l=length(p);
		p=abs(p)/dot(p,p)-.5;
		es+=exp(-1./abs(l-pl));
	}
	return es;	
}

vec3 normal(vec3 p) {
	vec3 e = vec3(0.0,det,0.0);
	
	return normalize(vec3(
			de(p+e.yxx)-de(p-e.yxx),
			de(p+e.xyx)-de(p-e.xyx),
			de(p+e.xxy)-de(p-e.xxy)
			)
		);	
}

float calcAO( const vec3 pos, const vec3 nor ) {
	float aodet=detail*10.;
	float totao = 0.0;
    float sca = 10.0;
    for( int aoi=0; aoi<5; aoi++ ) {
        float hr = aodet + aodet*float(aoi*aoi);
        vec3 aopos =  nor * hr + pos;
        float dd = de( aopos );
        totao += -(dd-hr)*sca;
        sca *= 0.15;
    }
    return clamp( 1.0 - 5.0*totao, 0.0, 1.0 );
}

vec3 lightdir=normalize(vec3(-0.,-0.5,-1.));

float de5(vec3 p){
	float r =0.,power = 8.,dr = 1.;
	vec3 z = p;
	for(int i=0;i<10;i++){
		r = length(z);
		if(r > 4.) break;
		float theta = acos(z.z / r) ;//+ fract(t/20.) * 6.3;
		float phi = atan(z.y,z.x);
		
		dr = pow(r,power-1.)*power*dr+1.;
		float zr =  pow(r,power);
		theta = theta * power;
		phi = phi*power;
		z =  zr*vec3(sin(theta) * cos(phi),sin(phi) * sin(theta),cos(theta)) ;
		z += p;
		
		
	}
	
	return .5 * log(r) * r / dr;
	
}


vec3 raymarch(in vec3 from, in vec3 dir) {
		
	float l = 0.; 
	float d = 0.; 
	float e = 0.00001; 
	float it = 0.;
	
	for(int i=0;i<12;i++){
		d = de5(from);
		from += d * dir;
		l += d;
		if(d<e) break;
		
		e = ray_scale * l;
		it++;	
	}	
	float f = 1. - (it / float(12));
	return  vec3(f);
}

void main(){	

	vec2 tx = (gl_FragCoord.xy / resolution) - .5;
	
	float a = time * 0.1;
	float sa = sin(a);
	float ca = cos(a);
	
	float fov  = tan(4. * 0.17453292 * sin(time*.05));
	
	
	vec3 dir = vec3(tx.x * fov, tx.y * fov * aspect_ratio, 1.);
	
	
	dir.xy = vec2(dir.x * ca - dir.y * sa,dir.x * sa + dir.y * ca);
	dir.xz = vec2(dir.x * ca - dir.z * sa, dir.x  * sa + dir.z * ca); 
	
	vec3 cam = vec3(0.0,0.,-4.5 );
		cam.xz = vec2(cam.x * ca - cam.z * sa, cam.x * sa + cam.z * ca);
	
	float ao=calcAO(cam,dir);
	
	vec3 col = raymarch(cam,dir);
	
	
	vec3 r = reflect(lightdir,col);
	

	
	col =  col + r * ao;

	

   	
	
	gl_FragColor = vec4(  col  ,1.0);

}