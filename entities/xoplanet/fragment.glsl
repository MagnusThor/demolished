#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

uniform float time;

uniform vec2 mouse;
uniform vec2 resolution;


uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

vec4 T(vec2 u){
	u += time*0.1 / vec2(49,5);
	return pow(1.-texture2D(iChannel1,u).x,0.5) 	+ texture2D(iChannel0,u*1.3)  * 0.18;
}

void main( void ) {
	vec2 uv = gl_FragCoord.xy;

	vec2 s = uv * vec2(1.75,1.0);
	uv = uv / resolution.y  - vec2(.5,-.8);
	uv /= 18.-uv.y / .1;

	vec4 o = vec4(0.);
	 for (float i=1.; i > 0.; i -= .002 )
					o = T(o.x < i ? uv /= .9987 : uv);
					
	o = exp2 (-uv.y *-0.028) * (o*9.404-T(uv+.001).x*9.-.7)+.9;
	gl_FragColor = o;
}