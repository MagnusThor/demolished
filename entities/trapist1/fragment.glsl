#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#extension GL_EXT_shader_texture_lod : enable
#ifdef GL_ES
precision highp float;
precision highp int;
#endif



#define PI 3.1415926535898
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D fft;



vec3 nrand3( vec2 co )
{
	vec3 a = fract( cos( co.x*8.3e-3 + co.y )*vec3(1.3e5, 4.7e5, 2.9e5) );
	vec3 b = fract( sin( co.x*0.3e-3 + co.y )*vec3(8.1e5, 1.0e5, 0.1e5) );
	vec3 c = mix(a, b, 0.5);
	return c;
}

float field(in vec3 p,float s) {
	float strength = 5. + .03 * log(1.e-6 + fract(sin(time) * 99373.11));
	float accum = s/4.;
	float prev = 0.;
	float tw = 0.;
	for (int i = 0; i < 46; ++i) {
		float mag = dot(p, p);
		p = abs(p) / mag + vec3(-.5, -.4, -1.5);
		float w = exp(-float(i) / 7.);
		accum += w * exp(-strength * pow(abs(mag - prev), 2.2));
		tw += w;
		prev = mag;
	}
	return max(0., 5. * accum / tw - .7);
}

 float freqs[4];

 // The path is a 2D sinusoid that varies over time, depending upon the frequencies, and amplitudes.
vec2 path(in float z){
    float s = sin(z/24.)*cos(z/12.);
    return vec2(s*12., 0.);
}


mat2 rot2(float a){

    float c = cos(a); float s = sin(a);
	return mat2(c, s, -s, c);
}

// vec3 getNormal(in vec3 p) {
// 	const float eps = 0.001;
// 	return normalize(vec3(
// 		map(vec3(p.x+eps,p.y,p.z))-map(vec3(p.x-eps,p.y,p.z)),
// 		map(vec3(p.x,p.y+eps,p.z))-map(vec3(p.x,p.y-eps,p.z)),
// 		map(vec3(p.x,p.y,p.z+eps))-map(vec3(p.x,p.y,p.z-eps))
// 	));
// }


float tri(in float x){return abs(fract(x)-.5);}
vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}
                                 
mat2 m2 = mat2(0.970,  0.242, -0.242,  0.970);

float triNoise3d(in vec3 p, in float spd)
{
    float z=1.4;
	float rz = 0.;
    vec3 bp = p;
	for (float i=0.; i<=3.; i++ )
	{
        vec3 dg = tri3(bp*2.);
        p += (dg+time*spd);

        bp *= 1.8;
		z *= 1.5;
		p *= 1.2;
        //p.xz*= m2;
        
        rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
        bp += 0.14;
	}
	return rz;
}

float fogmap(in vec3 p, in float d)
{
    p.x += time*1.5;
    p.z += sin(p.x*.5);
    return triNoise3d(p*2.2/(d+20.),0.2)*(1.-smoothstep(0.,.7,p.y));
}

vec3 fog(in vec3 col, in vec3 ro, in vec3 rd, in float mt)
{
    float d = .9;
    for(int i=0; i<7; i++)
    {
        vec3  pos = ro + rd*d;
        float rz = fogmap(pos, d);
		float grd =  clamp((rz - fogmap(pos+.8-float(i)*0.1,d))*3., 0.1, 1. );
        vec3 col2 = (vec3(.1,0.8,.5)*.5 + .5*vec3(.5, .8, 1.)*(1.7-grd))*0.55;
        col = mix(col,col2,clamp(rz*smoothstep(d-0.4,d+2.+d*.75,mt),0.,1.) );
        d *= 1.5+0.3;
        if (d>mt)break;
    }
    return col;
}

void main() {

	freqs[0] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.23, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.55, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.60, 0.0 ) ).x;

    vec2 uv = 2. * gl_FragCoord.xy / resolution.xy - 1.;
    // vec2 uv = (gl_FragCoord.xy * resolution.xy*.5) / resolution.y;
    
    vec2 uvs = uv * resolution.xy / max(resolution.x, resolution.y);


    vec3 camPos = vec3(0.0, 0.0, 0.5);
    vec3 lookAt = camPos +  vec3(0.0, 0.0, 0.5);

	  vec3 ligt = normalize( vec3(.5, .05, -.2) );
    vec3 ligt2 = normalize( vec3(.5, -.1, -.2) );

    camPos.xy = path(camPos.z);
    lookAt.xy = path(lookAt.z);

    // vec3 p = vec3(uvs / 4., 0) + vec3(1., -1.3, 0.);
	//      p += .2 * vec3(sin(time / 16.), sin(time / 12.),  sin(time / 128.));

    vec3 p = vec3(uvs ,.0) + vec3(1., -1.3,0.);

    float FOV = PI / 3.0;

    vec3 forward = normalize(camPos - lookAt);
    vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
    vec3 up =   cross(forward, right);

	vec3 rd = normalize(forward + FOV*p.x*right + FOV*p.y*up);
 
 
    float a = 0.05;

//	rd.xy = rot2( path(camPos.z).x/32. )*rd.xy;

     vec3 sp = a * rd+camPos;
     vec3 sn = normalize(sp);


    float t = field(p,freqs[3]*0.1);
    float v = (1. - exp((abs(rd.x) - 1.) * 6.)) * (1. - exp((abs(rd.y) - 1.) * 6.));



    vec2 seed = rd.xy * .001;	
	seed = floor(seed * resolution.x);
	vec3 rnd = nrand3( seed );
	vec4 starcolor = vec4(pow(rnd.y,20.0));
    
     
    vec4 sceneCol = mix(freqs[3]-.3, 1., v) * vec4(1.5*freqs[2] * t * t* t ,
                     1.2*freqs[1] * t * t, 
                     freqs[3]*t, 1.0);

	vec3 fogb = mix(vec3(.7,.8,.8	)*0.3, vec3(1.,1.,.77)*.95, pow(dot(rd,ligt2)+1.2, 2.5)*.25);
     fogb *= clamp(rd.y*.5+.6, 0., 1.);
    vec3 col = fogb;
    
	float FAR = 30.0;

   	col = mix(col, fogb, smoothstep(FAR-7.,FAR,rd.z));

    gl_FragColor =  sceneCol;

}