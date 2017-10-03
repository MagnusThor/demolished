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

uniform sampler2D fft;
uniform vec2 mouse;
uniform vec2 resolution;


uniform sampler2D iChannel0;
uniform sampler2D iChannel1;


float FH = 2.0;






vec3 tri(in vec3 x){return abs(x-floor(x)-.5);}

float surfFunc(in vec3 p){

	return dot(tri(p*0.5 + tri(p*0.25).yzx), vec3(0.666));
}

// The path is a 2D sinusoid that varies over time, depending upon the frequencies, and amplitudes.
vec2 path(in float z){
    float s = sin(z/24.)*cos(z/12.);
    return vec2(s*12., 0.);
}




float map(vec3 p){
    // Square tunnel.
    // For a square tunnel, use the Chebyshev(?) distance: max(abs(tun.x), abs(tun.y))
    vec2 tun = abs(p.xy - path(p.z))*vec2(0.5, 0.7071);
	
    float n = 1.- max(tun.x, tun.y) + (0.5-surfFunc(p));

  //	float n = max(abs(tun.x), abs(tun.y));

    return min(n, p.y + FH);
}

vec3 getNormal(in vec3 p) {
	const float eps = 0.001;
	return normalize(vec3(
		map(vec3(p.x+eps,p.y,p.z))-map(vec3(p.x-eps,p.y,p.z)),
		map(vec3(p.x,p.y+eps,p.z))-map(vec3(p.x,p.y-eps,p.z)),
		map(vec3(p.x,p.y,p.z+eps))-map(vec3(p.x,p.y,p.z-eps))
	));
}


float snoise(vec3 uv, float res)
{
	const vec3 s = vec3(1e0, 1e2, 1e3);
	uv *= res;
	vec3 uv0 = floor(mod(uv, res))*s;
	vec3 uv1 = floor(mod(uv+vec3(1), res))*s;

	vec3 f = fract(uv); f = f*f*(3.0-2.0*f);

	vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
		      	  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);

	vec4 r = fract(sin(v*1e-1)*1e3);
	float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

	r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);

	float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

	return mix(r0, r1, f.z)*2.-1.;
}

// Non-standard vec3-to-vec3 hash function.
vec3 hash33(vec3 p){

    float n = sin(dot(p, vec3(7, 157, 113)));
    return fract(vec3(2097152, 262144, 32768)*n);
}

// 2x2 matrix rotation.
mat2 rot2(float a){

    float c = cos(a); float s = sin(a);
	return mat2(c, s, -s, c);
}

vec3 tex3D( sampler2D tex, in vec3 p, in vec3 n ){

    n =   max(abs(n), 0.001) ; //max((abs(n) - 0.2)*7., 0.001); // max(abs(n), 0.001), etc.
    n /= (n.x + n.y + n.z );

	return (texture2D(tex, p.yz)*n.x + texture2D(tex, p.zx)*n.y + texture2D(tex, p.xy)*n.z).xyz;
}

float curve(in vec3 p, in float w){

    vec2 e = vec2(-1., 1.)*w;

    float t1 = map(p + e.yxx), t2 = map(p + e.xxy);
    float t3 = map(p + e.xyx), t4 = map(p + e.yyy);

    return 0.125/(w*w) *(t1 + t2 + t3 + t4 - 4.*map(p));
}

float getGrey(vec3 p){
	return p.x*0.299 + p.y*0.587 + p.z*0.114;
}

vec3 doBumpMap( sampler2D tex, in vec3 p, in vec3 nor, float bumpfactor){

    const float eps = 0.001;
    float ref = getGrey(tex3D(tex,  p , nor));
    vec3 grad = vec3( getGrey(tex3D(tex, vec3(p.x-eps, p.y, p.z), nor))-ref,
                      getGrey(tex3D(tex, vec3(p.x, p.y-eps, p.z), nor))-ref,
                      getGrey(tex3D(tex, vec3(p.x, p.y, p.z-eps), nor))-ref )/eps;

    grad -= nor*dot(nor, grad);

    return normalize( nor + grad*bumpfactor );

}

float calculateAO(vec3 p, vec3 n){
    const float AO_SAMPLES = 15.0;
    float r = 0.0, w = 1.0, d;
    
    for (float i=1.0; i<AO_SAMPLES+1.1; i++){
        d = i/AO_SAMPLES;
        r += w*(d - map(p + n*d));
        w *= 0.5;
    }
    return 1.0-clamp(r,0.0,1.0);
}

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

float freqs[4];

void main( void ) {

	freqs[0] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.23, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.55, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.60, 0.0 ) ).x;

	FH = 2.; //-   (1.5*freqs[1]);

	const float tSize0 = 1./1.;
	const float tSize1 = 1./4.;

	vec2 p = (gl_FragCoord.xy - resolution.xy*.5) /  resolution.y;

	vec3 sceneCol = vec3(.0);

    vec3 camPos = vec3(0.0, 0.0, time*2.5);
    vec3 lookAt = camPos +  vec3(0.0, 0.0, 0.5);

	vec3 light_pos = camPos -  vec3(mouse,0.125);//camPos + vec3(0.0, 0.125,-0.125); // -0.125
	vec3 light_pos2 = camPos + vec3(0.0, 0.0, 2.0);
	    
    lookAt.xy += path(lookAt.z);
	camPos.xy += path(camPos.z);

    float FOV = PI / 3.0;

    vec3 forward = normalize(lookAt-camPos);
    vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
    vec3 up = cross(forward, right);
	vec3 rd = normalize(forward + FOV*p.x*right + FOV*p.y*up);

	light_pos.xy += path(light_pos.z);
	light_pos2.xy += path(light_pos2.z);

	rd.xy = rot2( path(lookAt.z).x/32. )*rd.xy;

	float t = 0.0, dt;
	for(int i=0; i<128; i++){
		dt = map(camPos + rd*t);
		if(dt<0.005 || t>150.){ break; }
		t += dt*0.75;
	}

	if(dt<0.005){
	
	    t += dt;
	    vec3 sp = t * rd+camPos;
	    vec3 sn = getNormal(sp);
        
		if (sp.y<-(FH-0.005)) sn = doBumpMap(iChannel0, sp*tSize1, sn, 0.25);
	    else sn = doBumpMap(iChannel1, sp*tSize0, sn,0.25); 

		float ao = calculateAO(sp, sn);
    	
	    vec3 ld = light_pos-sp;
	    vec3 ld2 = light_pos2-sp;

	    float distlpsp = max(length(ld), 0.001);
	    float distlpsp2 = max(length(ld2), 0.001);
    
	    ld /= distlpsp;
	    ld2 /= distlpsp2;
	    
	    float atten = min(1./(distlpsp) + 1./(distlpsp2), 1.);

		float ambience =  0.25 ; 
    	
	    float diff = max( dot(sn, ld), 0.0);
	    float diff2 = max( dot(sn, ld2), 0.0);

		float spec = pow(max( dot( reflect(-ld, sn), -rd ), 0.0 ), 8.);
	    float spec2 = pow(max( dot( reflect(-ld2, sn), -rd ), 0.0 ), 8.);
    	
    
	    float crv = clamp(curve(sp, 0.125)*0.5+0.5, .0, 1.);
	    float fre = pow( clamp(dot(sn, rd) + 1., .0, 1.), 1.);

		vec3 texCol;
        	if (sp.y<-(FH-0.005)) texCol = tex3D(iChannel0, sp*tSize1, sn); // Floor.
 	    		else texCol = tex3D(iChannel1, sp*tSize0, sn); // Walls.

   		//	sceneCol = getGrey(texCol)*((diff+diff2)*0.75 + ambience*0.25) + (spec+spec2)*texCol*2. + fre*crv*texCol.zyx*2.;
     
	 	sceneCol = texCol*((diff+diff2)*vec3(1.0, 0.95, 0.9) + ambience + crv*crv*texCol) + (spec+spec2);

		float shading =  crv*0.5+0.5; 

		sceneCol *= ao*shading*atten;
	
		//sceneCol *= clamp(1.-abs(curve(sp, 0.0125)), .0, 1.);    
       // sceneCol = vec3(c*c*c, c*c, c);
		
	}



vec3 fogb = mix(vec3(.7,.8,.8	)*0.3, vec3(1.,1.,.77)*.95, pow(dot(lookAt,light_pos2)+1.2, 2.5)*.25);
     fogb *= clamp(lookAt.y*.5+.6, 0., 1.);
    vec3 col = fogb;
    
	float FAR = 60.0;

   	col = mix(col, fogb, smoothstep(FAR-7.,FAR,rd.z));


	vec3 mixed = mix(col,sceneCol,0.0); 

	gl_FragColor = vec4(fogb,.1);

}