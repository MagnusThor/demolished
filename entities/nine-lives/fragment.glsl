#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D textureA; //<-- eye
uniform sampler2D textureB; //<-landscape texture
uniform sampler2D textureC; //<-heightmap
uniform sampler2D textureD;

uniform sampler2D fft;
float freqs[4];

#define MaxSteps 30

#define MinimumDistance 0.001
#define normalDistance     0.0005

#define Iterations 7
#define PI 3.141592
#define Scale 3.0
#define FieldOfView 1.0
#define Jitter 0.05
#define FudgeFactor 0.6


#define Ambient 0.32184
#define Diffuse 0.5
#define LightDir vec3(1.0)
#define LightColor vec3(1.0,1.0,0.858824)
#define LightDir2 vec3(1.0,-1.0,1.0)
#define LightColor2 vec3(0.0,0.333333,1.0)
#define Offset vec3(0.92858,0.92858,0.32858)


vec4 orb;

vec2 rotate(vec2 v, float a) {
	return vec2(cos(a)*v.x + sin(a)*v.y, -sin(a)*v.x + cos(a)*v.y);
}


float trap(vec3 p){
	return  length(p.x-0.5-0.5*sin(time/10.0)); // <- cube forms 
	
}



// Kalidoscope
float kalidoscope(in vec3 z)
{	
	vec3 offset = vec3(1.0+0.2*(cos(time/5.7)),0.3+0.1*(cos(time/1.7)),1.).xzy;
	z  = abs(1.0-mod(z,2.0));	
	float d = 1000.0;
	float r;
	for (int n = 0; n < Iterations; n++) {
		z.xz = rotate(z.xz, time/37.0);	
		if (z.x+z.y<0.0) z.xy = -z.yx;
		z = abs(z);
		if (z.x+z.z<0.0) z.xz = -z.zx;
		z = abs(z);
		if (z.x-z.y<0.0) z.xy = z.yx;
		z = abs(z);
		if (z.x-z.z<0.0) z.xz = z.zx;
		z = z*Scale - offset*(Scale-1.0);
		//z.yz = rotate(z.yz -time/18.0);
		d = min(d, trap(z) * pow(Scale, -float(n+1)));
	}
	return d;
}

float kaliSet( vec3 p )
{
	p = abs(1.0-mod(p,2.0));
	
	float scale = 1.0;

	orb = vec4(1000.0); 
	
	for( int i=0; i<8;i++ )
	{
		p = -1.0 + 2.0*fract(0.5*p+0.5);

		float r2 = dot(p,p);
		
       		 orb = min( orb, vec4(abs(p),r2) );
		
		float k = 1.0/r2;
		p     *= k;
		scale *= k;
	}
	
	return 0.25*abs(p.y) / scale;
}



float mengerSponge(in vec3 z)
{
	orb = vec4(1000.);
	vec3 op = z;
	z  = abs(1.0-mod(z,2.));
	float d = 1000.0;
	for (int n = 0; n < 7; n++) {
		op = -1.0 + 2.0*fract(0.5*op+0.5);
		float r2 = dot(op,op);
        	orb = min( orb, vec4(abs(op),r2) ); 
		//z.xy = rotate(z.xy,4.0+2.0*cos( time/16.0));
		z = abs(z);
		if (z.x<z.y){ z.xy = z.yx;}
		if (z.x< z.z){ z.xz = z.zx;}
		if (z.y<z.z){ z.yz = z.zy;}
		z = 3.0*z-Offset*(3.0-1.0);
		if( z.z<-0.5*Offset.z*(3.0-1.0))  z.z+=Offset.z*(3.0-1.0);
		d = min(d, length(z) * pow(3.0, float(-n)-1.0));
	}
	
	return d-0.0001;
}


float mandelBulb(vec3 p) {
    	vec3 op = p;
 	p = abs(1.0-mod(p,2.));
    	float r = 0., power = 8., dr = 1.;
    	vec3 z = p;
	
	orb = vec4(1000.0); 
	
    for (int i = 0; i < 7; i++) {
	    
	 op = -1.0 + 2.0*fract(0.5*op+0.5);

	float r2 = dot(op,op);
		
        orb = min( orb, vec4(abs(op),r2) );   
	   
	    
        r = length(z);
	
	    
        if (r > 2.) break;
        float theta = acos(z.z / r) ;//+ fract(time/20.) * 0.3;
        float phi = atan(z.y, z.x);

        dr = pow(r, power - 1.) * power * dr + 1.;
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += p;
    }
    return (.5 * log(r) * r / dr) - 0.001;
}



float map(vec3 p){
	float tm = time;	
	if(tm < 22.0){

	}else
		if(tm > 22.0 && tm < 40.){
		return mandelBulb(p);
		}else
		return mengerSponge(p);
	
		
	
}



vec3 getNormal(in vec3 p) {
	
 	vec2 e = vec2(0.005, -0.005); 
 	return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

float rand(vec2 co){
	return fract(cos(dot(co,vec2(4.898,7.23))) * 23421.631);
}

vec3 getLight(in vec3 color, in vec3 normal, in vec3 dir) {
	vec3 lightDir = normalize(LightDir);
	float diffuse = max(0.0,dot(-normal, lightDir)); // Lambertian
	
	vec3 lightDir2 = normalize(LightDir2);
	float diffuse2 = max(0.0,dot(-normal, lightDir2)); // Lambertian
	
	return
	(diffuse*Diffuse)*(LightColor*color) +
	(diffuse2*Diffuse)*(LightColor2*color);
}



vec3 getColor(vec3 normal, vec3 pos) {
	return vec3(1.);
}


vec4 rayMarch(in vec3 from, in vec3 dir, in vec2 fragCoord) {
	
	float totalDistance = Jitter*rand(fragCoord.xy+vec2(time));
	vec3 dir2 = dir;
	
	float distance;
	int steps = 0;
	vec3 pos;
	for (int i=0; i < MaxSteps; i++) {
		pos = from + totalDistance * dir;
		
		distance = map(pos)*FudgeFactor;
		
		totalDistance += distance;
		
		if (distance < MinimumDistance) break;
		steps = i;
	}
	vec4 tra = orb;
	
	 vec3 rgb = vec3(0.0);
        	rgb = mix( rgb, vec3(1.0,0.80,0.2), clamp(6.0*tra.y,0.0,1.0) );
        	rgb = mix( rgb, vec3(1.0,0.55,0.0), pow(clamp(1.0-2.0*tra.z,0.0,1.0),8.0) );
	
	
	float smoothStep =   float(steps) + distance/MinimumDistance;
	float ao = 1.1-smoothStep/float(MaxSteps);
	
	
	vec3 normal = getNormal(pos-dir*normalDistance*3.0);
	
	vec3 color = getColor(normal, pos);
	vec3 light = getLight(rgb, normal, dir);
	 
    
	
	color = color * rgb ;
	
	color *= (Ambient+light)*ao;
	//  (ao * _texture(p)) * (ambient * (2. - LIGHT_COLOR) * .5 + (specular + diffuse) * shadow * LIGHT_COLOR) + glow(p);
	
	return vec4(color ,1.0);
}

vec4 morph(vec4 tot){
	return tot;
}

vec4 postProcess(vec4 tot){
	
	return tot;
}


vec3 blenders(vec2 p){
		
	freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;
	
	float a = abs(fract(freqs[0]))*6.284;
	float b = abs(fract(freqs[1]))*6.284;
	float c = abs(fract(freqs[2]))*6.284;
		
	vec2 pa = p + normalize(vec2(sin(a),-sin(a))) * freqs[0];
	vec2 pb = p+ normalize(vec2(sin(b),-sin(c))) * freqs[3];
	
	vec2 q = pb  + mod(fract(pa) * pa*1000.,14. + freqs[0]);
	
	float blenders = abs(length(pa/q) * 0.1);
	
	
	return vec3(1.0,1.0,1.) * blenders;		    
	
}



void main( void ) {


	vec2 uv = (gl_FragCoord.xy / resolution.xy) ;

	float t = time ;


	if(t <22.){
		vec4 eye = texture2D(textureA,-uv);
		vec4 al = vec4(blenders(uv),1.0);
		gl_FragColor = mix(al,eye,.7);
	}else{

	
	vec3 camPos = .1*t*vec3(0.0,0.,0.5);	
	//  camPos = vec3(0.0, 0., -2.5);
	
	vec3 target = camPos + vec3(1.,0.0*cos(t),0.);
	//vec3 target = camPos + vec3(1.0,0.0*cos(t),0.0*sin(0.4*t));
	vec3 camUp  = vec3(1.0,0,1.);
	
	// Calculate orthonormal camera reference system
	vec3 camDir   = normalize(target-camPos); // direction for center ray
		
	camUp = normalize(camUp-dot(camDir,camUp)*camDir); // orthogonalize
	vec3 camRight = normalize(cross(camDir,camUp));
	
	vec2 coord = -1.+2.*gl_FragCoord.xy/resolution.xy;
	
	coord.x *= resolution.x/resolution.y;
	
	
	vec3 rd = normalize(camDir + (coord.x*camRight + coord.y*camUp)*FieldOfView);
	
	vec4 tot = postProcess(rayMarch(camPos, rd, coord ));
	
	gl_FragColor =  tot * 0.5;

	}

}



// /*
// 	Nine Lives 	
// 	Code & Visuals 	- Magnus | 
// 	Music 		- Doe | 
// 	Art		-// uniform sampler2D fft;
// float freqs[4]; JL
// */

// #ifdef GL_ES
// precision highp float;
// #endif


// #extension GL_OES_standard_derivatives : enable

// uniform float time;
// uniform vec2 mouse;
// uniform vec2 resolution;




// #define PI 3.1415926535898

// #define max_ray_steps 12;
// #define max_de_steps 14;


//  mat4 M = mat4
// 	(
// 		-5.740254e-01,
// 		4.547220e-01,
// 		1.309093e+00,
// 		0.000000e+00,
// 		-4.547220e-01,
// 		1.276698e+00,
// 		-6.428610e-01,
// 		0.000000e+00,
// 		-1.309093e+00,
// 		-6.428610e-01,
// 		-3.507233e-01,
// 		-0.000000e+00,
// 		3.896400e-01,
// 		-1.814425e-01,
// 		-5.258469e-02,
// 		1.000000e+00
// 	);

// float aspect_ratio = resolution.y / resolution.x;
// float ray_scale = (1. / max(resolution.x, resolution.y)) * .47;
// //float fov = tan(45. * 0.017453292 * .67);
// float fov = tan(45. * 0.17453292 * .7);
// float ot=0.;
// float det=0.;
// const float detail=.1;
// vec3 lightdir=normalize(vec3(-0.,-0.5,-1.));


// float box(vec3 p){
// 	vec4 q = vec4(p,.5);
// 	for(int i=0;i<14;i++){
// 		q = M * abs(q);	
// 	}
// 	float d = length(q) * pow(1.5,-14.);
// 	return d;
// }

// float bulb(vec3 p){
// 	float r =0.,power = 8.,dr = 1.;
// 	vec3 z = p;
// 	for(int i=0;i<10;i++){
// 		r = length(z);
// 		if(r > 4.) break;
// 		float theta = acos(z.z / r) ;//+ fract(t/20.) * 6.3;
// 		float phi = atan(z.y,z.x);
		
// 		dr = pow(r,power-1.)*power*dr+1.;
// 		float zr =  pow(r,power);
// 		theta = theta * power;
// 		phi = phi*power;
// 		z =  zr*vec3(sin(theta) * cos(phi),sin(phi) * sin(theta),cos(theta)) ;
// 		z += p;
		
		
// 	}
	
// 	return .5 * log(r) * r / dr;
	
// }


// float sirpinsky(vec3 z){
// 	float r;
// 	float Scale= 2.;
	
// 	float Offset= 0.3;
		
// 	for(int n= 0; n< 8;n++){
// 		if(z.x+z.y <0.) z.xy = -z.yx; // fold1;
// 		if(z.x+z.z <0.) z.xz = -z.zx; // fold2;
// 		if(z.y+z.z <0.) z.zy = -z.yz; // fold3;
// 		z = z*Scale - Offset*(Scale-1.0);
		
		
// 	}
// 	return (length(z)) * pow(2.0, -float(8));
// 	return 1.;
	
// }





// float shadow(vec3 pos, vec3 sdir) {
// 		float totalDist =2.0*det, sh=1.;
//  		for (int steps=0; steps<30; steps++) {
// 			if (totalDist<1.) {
// 				vec3 p = pos - totalDist * sdir;
// 				float dist = de(p)*1.5;
// 				if (dist < detail)  sh=0.;
// 				totalDist += max(0.05,dist);
// 			}
// 		}
// 		return max(0.,sh);	
// }

// float calcAO( const vec3 pos, const vec3 nor ) {
// 	float aodet=detail*10.;
// 	float totao = 0.0;
//     float sca = 10.0;
//     for( int aoi=0; aoi<5; aoi++ ) {
//         float hr = aodet + aodet*float(aoi*aoi);
//         vec3 aopos =  nor * hr + pos;
//         float dd = de( aopos );
//         totao += -(dd-hr)*sca;
//         sca *= 0.15;
//     }
//     return clamp( 1.0 - 5.0*totao, 0.0, 1.0 );
// }



// vec3 raymarch(in vec3 from, in vec3 dir) {
		
// 	float l = 0.; 
// 	float d = 0.; 
// 	float e = 0.00001; 
// 	float it = 0.;
	
// 	for(int i=0;i<12;i++){
// 		if(time < 1000. ){
// 			d = de2(from);
// 		}else d = de(from);
		
// 		from += d * dir;
// 		l += d;
// 		if(d<e) break;
		
// 		e = ray_scale * l;
// 		it++;	
// 	}	
// 	float f = 1. - (it / float(12));
// 	return  vec3(f);
// }


// // FFT alpha blende's
// vec3 blenders(vec2 p){
		
// 	freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
// 	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
// 	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
// 	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;
	
// 	float a = abs(fract(freqs[0]))*6.284;
// 	float b = abs(fract(freqs[1]))*6.284;
// 	float c = abs(fract(freqs[2]))*6.284;
		
// 	vec2 pa = p + normalize(vec2(sin(a),-sin(a))) * freqs[0];
// 	vec2 pb = p+ normalize(vec2(sin(b),-sin(c))) * freqs[3];
	
// 	vec2 q = pb  + mod(fract(pa) * pa*1000.,14. + freqs[0]);
	
// 	float blenders = abs(length(pa/q) * 0.1);
	
	
// 	return vec3(1.0,1.0,1.) * blenders;		    
	
// }

// float de3(vec3 z0){
	
// 	vec4 c = vec4(z0,1.0),z = c;
	
// 	float r = length(z.xyz);
// 	float zr,zo,zi,pwr = 8.;
// 	for(int n=0;n<7  ;n++){
// 		zo = asin(z.z  * r) * pwr;
// 		zi = atan(z.y,z.x) * pwr;
// 		zr = pow(r,pwr -1.);
// 		z = zr*vec4(r*vec3(cos(zo)*vec2(cos(zi),sin(zi)),sin(zo)),z.w*pwr)+c;
// 		r = length(z.xyz);
// 		//if (r > 2.) break;
// 	}

// 	 return 0.5 *log(r) * r / z.w;
// }



// void main(){
	
// 		vec2 tx = (gl_FragCoord.xy / resolution) - .5;
	
	
// 	float a = time * 0.1;
// 	float sa = sin(a);
// 	float ca = cos(a);
	
// 	float fov  = tan(45. * 0.17453292 * sin(time*.05));
	
	
// 	vec3 dir = vec3(tx.x * fov, tx.y * fov * aspect_ratio, 1.);
	
	
// 	dir.xy = vec2(dir.x * ca - dir.y * sa,dir.x * sa + dir.y * ca);
// 	dir.xz = vec2(dir.x * ca - dir.z * sa, dir.x  * sa + dir.z * ca); 
	
// 	vec3 cam = vec3(0.0,0.,-4.5 );
// 		cam.xz = vec2(cam.x * ca - cam.z * sa, cam.x * sa + cam.z * ca);
	
// 	float ao=calcAO(cam,dir);
	
// 	vec3 col = raymarch(cam,dir);
	
	
// 	vec3 r = reflect(lightdir,col);
	

	
// 	col =  col + r * ao;

	
	
	
	
// 	col = mix(blenders(tx),col,.7);
	
// 	gl_FragColor = vec4(  col  ,1.0);


	
// }
