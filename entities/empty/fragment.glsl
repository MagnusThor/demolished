
#ifdef GL_ES	
precision mediump float;
#endif


#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform float elapsedTime;

uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;

	float color = 3.0 - (3.*length(2.*uv));
	
	vec3 coord = vec3(atan(sin(time),uv.y)/6.2832+.5, length(uv)*.4, .5);
	
	
	gl_FragColor = vec4(coord,0.);

}