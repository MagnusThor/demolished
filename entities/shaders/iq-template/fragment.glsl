uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D iChannel0;
out vec4 fragColor;

#include "entities/shared/helpers.glsl";
#include "entities/shared/primitives.glsl";
#include "entities/shared/manipulation.glsl";
#include "entities/shared/combination.glsl";


// Template based on https://www.shadertoy.com/view/ldfSWs by IQ
//------------------------------------------------------------------------
// Camera
//
// Move the camera. In this case it's using time and the mouse position
// to orbitate the camera around the origin of the world (0,0,0), where
// the yellow sphere is.
//------------------------------------------------------------------------
void doCamera( out vec3 camPos, out vec3 camTar, in float time, in float mouseX )
{
    float an = 0.3*time + 10.0*mouseX;
	camPos = vec3(2.772*sin(an),0.424,2.820*cos(an));
    camTar = vec3(0.000,.000,0.000);
}
//------------------------------------------------------------------------
// Background 
//
// The background color. In this case it's just a black color.
//------------------------------------------------------------------------
vec3 doBackground( void )
{
    return vec3( 0.);
}
//------------------------------------------------------------------------
// Modelling 
//------------------------------------------------------------------------
const float width=.22;
const float scale=5.;
const float detail=.002;


mat2 rotate(float a) {
	float c = cos(a);
	float s = sin(a);
	return mat2(c, -s, s, c);
}

float doModel( vec3 p )
{
    vec3 z = p;
    z.xz *= rotate(z.y *0.28 * 2.5 + time * 1.5);	
    vec2 q = vec2(length(z.xy) - 1.2, z.z);

	float d = length(q) - .1;
    d = min(d, length(z.xz) - (.1 - .2 )); //* sin(time + z.y * 6.28 * 0.5)));
            
    pMod3(p,vec3(1.8));
    
 	float sphere = fSphere(p,.4);   
    float bulb = fSphere(p,0.2);
    vec3 pp = p;
    pp.xz *= rotate(pp.y *0.28 * 2.5 + time * 1.5);
    float c = fCapsule(pp,.1,1.0);
    
    bulb = min (bulb,c);
    
    float box = fBoxCheap(p,vec3(0.4));
    
    float u = fOpDifferenceRound(box,sphere,.1);
    
    return min(min(u,bulb),d);   
}
float map(vec3 p){
    return doModel(p);
}
vec3 normal( in vec3 p) {
    //vec2 e = vec2(0.005, -0.005);
    vec2 e = vec2(1.0,-1.0)*0.5773*0.0005;
    return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}
vec3 calcNormal( in vec3 pos ){
    return normal(pos);
}
//------------------------------------------------------------------------
// Material 
//
// Defines the material (colors, shading, pattern, texturing) of the model
// at every point based on its position and normal. In this case, it simply
// returns a constant yellow color.
//------------------------------------------------------------------------
float kset(vec3 p) {
		p = abs(.5 - fract(p * 1.1));
    float es, l = es = 0.;
    for (int i = 0; i < 13; i++) {
        float pl = l;
        l = length(p);
        p = abs(p) / dot(p, p) - .5;
        es += exp(-1. / abs(l - pl));
    }
    return es;
}
vec3 doMaterial( in vec3 pos, in vec3 nor )
{
    
   float k = kset(pos) * .18;
   vec3 col = mix(vec3(k * 1.1, k * k * 1.3, k * k * k), vec3(k), .45) * 1.7;
   return col;
    
}
//------------------------------------------------------------------------
// Lighting
//------------------------------------------------------------------------
float shadow( in vec3 ro, in vec3 rd){
	float res = .0;
    	float t = .05;
	float h;	
    	for (int i = 0; i < 4; i++)
	{
		h = doModel( ro + rd*t );
		res = min(6.0*h / t, res);
		t += h;
	}
    return max(res, 0.0);
}

float calcAO(const vec3 pos,const vec3 nor) {
    float aodet = detail * 1.1;
    float totao = 0.0;
    float sca = 10.0;
    for (int aoi = 0; aoi < 5; aoi++) {
        float hr = aodet + aodet * float(aoi * aoi);
        vec3 aopos = nor * hr + pos;
        float dd = doModel(aopos);
        totao += -(dd - hr) * sca;
        sca *= 0.75;
    }
    return clamp(1.0 - 5.0 * totao, 0.0, 1.0);
}

vec3 doLighting( in vec3 pos, in vec3 nor, in vec3 dir, in float dis)
{

    float ti = time ;//* 0.3;
     ;
    vec3 lightdir  = vec3(sin(ti), cos(ti * .5), - .7);


 	vec3 n = calcNormal(pos);
    
	float sh = min(5., shadow(pos, lightdir));

    float ao = calcAO(pos, n);

    float diff = max(0., dot(lightdir, -n)) * sh * 1.3;
    float amb = max(0.2, dot(dir, -n)) * .4;
    vec3 r = reflect(lightdir, n);
    
    float spec = pow(max(0., dot(dir, -r)) * sh, 10.) * (.5 + ao * .5);
    float k = kset(pos) * .18;
    vec3 col = mix(vec3(k * 1.1, k * k * 1.3, k * k * k), vec3(k), .45) * 2.;
    col = col * ao * (amb * vec3(.9, .85, 1.) + diff * vec3(1., .9, .9)) + spec * vec3(1, .9, .5) * .7;
    return col;

} 
//----------------------------------------------------------
// calcIntersection
//----------------------------------------------------------
float calcIntersection( in vec3 ro, in vec3 rd )
{
	const float maxd = 20.0;           // max trace distance
	const float precis = 0.001;        // precission of the intersection
    float h = precis*2.0;
    float t = 0.0;
	float res = -1.0;
    for( int i=0; i<128; i++ )          // max number of raymarching iterations is 90 .
    {
        if( h<precis||t>maxd ) break;
	    h = doModel( ro+rd*t );
        t += h;
    }
    if( t<maxd ) res = t;
    return res;
}



float calcSoftshadow( in vec3 ro, in vec3 rd )
{
    float res = 1.0;
    float t = 0.0005;                 // selfintersection avoidance distance
	float h = 1.0;
    for( int i=0; i<40; i++ )         // 40 is the max numnber of raymarching steps
    {
        h = doModel(ro + rd*t);
        res = min( res, 64.0*h/t );   // 64 is the hardness of the shadows
		t += clamp( h, 0.02, 2.0 );   // limit the max and min stepping distances
    }
    return clamp(res,0.0,1.0);
}

mat3 calcLookAtMatrix( in vec3 ro, in vec3 ta, in float roll )
{
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    return mat3( uu, vv, ww );
}



//----------------------------------------------------------
// main
// 
//----------------------------------------------------------

vec3 postprocess(vec3 rgb, vec2 xy)
{
	rgb = pow(rgb, vec3(0.57));
	#define CONTRAST 1.4
	#define SATURATION 1.4
	#define BRIGHTNESS 1.2
	rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb*BRIGHTNESS)), rgb*BRIGHTNESS, SATURATION), CONTRAST);
	//rgb = clamp(rgb+hash(xy*time)*.1, 0.0, 1.0);
	return rgb;
}





void main()
{
    vec2 p = (-resolution.xy + 2.0*gl_FragCoord.xy)/resolution.y;
    vec2 s = p* vec2(1.75, 1.0);

    vec2 m = mouse.xy/resolution.xy;
    //-----------------------------------------------------
    // camera
    //-----------------------------------------------------
    // camera movement
    vec3 ro, ta;
    doCamera( ro, ta, time, m.x );
    // camera matrix
    mat3 camMat = calcLookAtMatrix( ro, ta, 0.0 );  // 0.0 is the camera roll
	// create view ray
	vec3 rd = normalize( camMat * vec3(p.xy,1.5 + .80) ); // 2.0 is the lens length
    
    
    //-----------------------------------------------------
	// render
    //-----------------------------------------------------
	vec3 col = doBackground();
	// raymarch
    float t = calcIntersection( ro, rd );
    if( t>-0.1 )
    {
        // geometry
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal(pos);
        
        col = doLighting( pos, nor, rd, t );
      	//col *= vec3(1., .85, .8) * 2.9;
	    //col = mix(col, vec3(0.5), 1.0 - exp(-1.3 * pow(t, 1.3)));

        // materials
       // vec3 mal = doMaterial( pos, nor );

	}
	//-----------------------------------------------------
	// postprocessing
    //-----------------------------------------------------
    // gamma
	//col = pow( clamp(col,.0,1.0), vec3(.4545) );
    
    col = postprocess(col,s);
        
    fragColor = vec4( col, 1.0 );

}
















