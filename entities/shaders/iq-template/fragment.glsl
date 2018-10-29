uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D iChannel0;
out vec4 fragColor;

#include "entities/shared/common.glsl";
#include "entities/shared/geometry.glsl";

// Temlate based on https://www.shadertoy.com/view/ldfSWs by IQ
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
    camTar = vec3(0.000,0.000,0.000);
}
//------------------------------------------------------------------------
// Background 
//
// The background color. In this case it's just a black color.
//------------------------------------------------------------------------
vec3 doBackground( void )
{
    return vec3( 0.0, 0.0, 0.0);
}
//------------------------------------------------------------------------
// Modelling 
//------------------------------------------------------------------------

const float width=.22;
const float scale=5.;
const float detail=.002;

 float doModel( vec3 p )
{
 	// sampleThingy comes from entities/shared/geometry.glsl
    return sampleThingy(p);    
}
//------------------------------------------------------------------------
// Material 
//
// Defines the material (colors, shading, pattern, texturing) of the model
// at every point based on its position and normal. In this case, it simply
// returns a constant yellow color.
//------------------------------------------------------------------------
vec3 doMaterial( in vec3 pos, in vec3 nor )
{
    return vec3(0.2,0.07,0.01);
}
//------------------------------------------------------------------------
// Lighting
//------------------------------------------------------------------------
float calcSoftshadow( in vec3 ro, in vec3 rd );


float ao(vec3 p, vec3 n) {
	float o = 0.0, s = 0.005, w = 1.0;
	for(int i = 0; i < 15; i++) {
	float d = doModel(p + n*s);
		o += (s - d)*w;
		w *= 0.9;
		s += s/float(i + 1);
	}
	return 1.0 - clamp(o, 0.0, 1.0);	
}


vec3 doLighting( in vec3 pos, in vec3 nor, in vec3 rd, in float dis, in vec3 mal )
{
    vec3 lin = vec3(0.0);
    // key light
    //-----------------------------
    vec3  lig = normalize(vec3(1.0,0.7,0.9));
    float dif = max(dot(nor,lig),0.0);
    float sha=calcSoftshadow( pos+0.01*nor, lig );
 
    float ao = ao(pos,nor);
    vec3 ref = reflect(lig,nor);
    
	float amb= max(1.2,dot(rd,-nor));

    
    float diff=max(0.,dot(lig,-nor))*sha*1.3;
	float spec=pow(max(0.,dot(rd,-ref))*sha,10.)*(.5+ao*.5);
    
    lin += dif*vec3(4.00,4.00,4.00)*sha;
    // ambient light
    //-----------------------------
    lin += vec3(0.50,0.50,0.50);
    // surface-light interacion
    //-----------------------------
    vec3 col = mal*lin;
    
    col *= col*ao*(amb*vec3(.9,.85,1.));
    // fog    
    //-----------------------------
	col *= exp(-0.01*dis*dis);

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
    for( int i=0; i<90; i++ )          // max number of raymarching iterations is 90 .
    {
        if( h<precis||t>maxd ) break;
	    h = doModel( ro+rd*t );
        t += h;
    }
    if( t<maxd ) res = t;
    return res;
}

vec3 calcNormal( in vec3 pos )
{
    const float eps = 0.002;             // precision of the normal computation

    const vec3 v1 = vec3( 1.0,-1.0,-1.0);
    const vec3 v2 = vec3(-1.0,-1.0, 1.0);
    const vec3 v3 = vec3(-1.0, 1.0,-1.0);
    const vec3 v4 = vec3( 1.0, 1.0, 1.0);

	return normalize( v1*doModel( pos + v1*eps ) + 
					  v2*doModel( pos + v2*eps ) + 
					  v3*doModel( pos + v3*eps ) + 
					  v4*doModel( pos + v4*eps ) );
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
void main()
{
    vec2 p = (-resolution.xy + 2.0*gl_FragCoord.xy)/resolution.y;
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
	vec3 rd = normalize( camMat * vec3(p.xy,2.0) ); // 2.0 is the lens length
    //-----------------------------------------------------
	// render
    //-----------------------------------------------------
	vec3 col = doBackground();
	// raymarch
    float t = calcIntersection( ro, rd );
    if( t>-0.5 )
    {
        // geometry
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal(pos);

        // materials
        vec3 mal = doMaterial( pos, nor );

        col = doLighting( pos, nor, rd, t, mal );
	}
	//-----------------------------------------------------
	// postprocessing
    //-----------------------------------------------------
    // gamma
	col = pow( clamp(col,0.0,1.0), vec3(0.4545) );
	   
    fragColor = vec4( col, 1.0 );

}


