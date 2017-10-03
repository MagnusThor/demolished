#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


uniform sampler2D fft;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;


vec4 map(vec2 u){
//     u += vec2(49,5) ;//time + vec2(49,5) ;
//    return  pow(1.-texture2D(iChannel0,u).x,0.5) + texture2D(iChannel1,u*1.3) * .5; 
 	u += time + vec2(49,5); 
	return pow(1.-texture2D(iChannel0,u).x,3.) 	+ texture2D(iChannel1,u*1.3) * .1;

}

vec2 path(in float z){
    float s = sin(z/24.)*cos(z/12.);
    return vec2(1.5 + s*12., 0.);
}

// float sdBox(vec3 p,vec3 b){
//     vec3 d = abs(p) - b;
//     return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
// }

// vec3 map(in vec3 p){
//     float d = sdBox(p,vec3(1.0));
//     return vec3(d,0.,0.);
// }


float cells(vec2 uv){  // Trimmed down.
    uv = mix(sin(uv + vec2(1.57, 0)), sin(uv.yx*1.4 + vec2(1.57, 0)), .75);
    return uv.x*uv.y*.3 + .7;

}

float smin( float a, float b, float k )
{
    float h = clamp(.5 + .5 * (b-a) / k,0.,1.);
   //float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

const float BEAT = 8.;

float fbm(vec2 uv)
{
    
    float f = 200.0;
    vec2 r = (vec2(.9, .45));    
    vec2 tmp;
    float T = 100.0 + time * 1.3;
    T += sin(time * BEAT) * .1;
    // layers of cells with some scaling and rotation applied.
    for (int i = 1; i < 8; ++i)
    {
        float fi = float(i);
        uv.y -= T * .5;
        uv.x -= T * .4;
        tmp = uv;
        
        uv.x = tmp.x * r.x - tmp.y * r.y; 
        uv.y = tmp.x * r.y + tmp.y * r.x; 
        float m = cells(uv);
        f = smin(f, m, .07);
    }
    return 1. - f;
}

// float sphere(vec2 p){   
//         return length(p) * 0.5;
// }

void main(void){

    vec2 uv = gl_FragCoord.xy ; 
    uv = uv / resolution.y  - vec2(.5,-.8);
    uv /= 18.-uv.y / .1;

    vec2 s = gl_FragCoord.xy / resolution.y * mouse;

    float B = sin(time * BEAT);

    uv = mix(uv, uv * sin(B), .035);
    
    vec2 _uv = uv * 25.;
    float f = fbm(_uv);
    vec4 o = vec4(0.);

    for (float i=1.; i > 0.; i -= .002 )
            o = map(o.x < i ? uv /= .9987 : uv);

	o = exp2 (-uv.y *.3) * (o*9.5-map(uv+.001).x*9.-.7)+.9;

    gl_FragColor =  mix(o,vec4(fbm(s)),0.4); 

    //vec4(fbm(uv));// o; // ,vec4(fbm(_uv)),0.5);   
    gl_FragColor.rgb *= vec3(0., .5 + B * .05, 0.1 + B * .05);
    // gl_FragColor =  map(uv) ;
}