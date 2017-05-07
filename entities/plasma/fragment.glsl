#ifdef GL_ES
	precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float freq_data[32];
uniform float freq_time[32];

void main( void ) {

vec2 position = ( gl_FragCoord.xy * 2.0 -  resolution) / min(resolution.x, resolution.y);

	vec3 destColor = vec3(1.0, 0.5, 1.7);
	float f = 0.0;	
	
	float dd = freq_time[1] / 1000.0;
	
	for(float i = 0.0; i < 50.0; i++){
		float s = sin(time + i ) ;
		float c = cos(time + i );
		f +=(0.003 + dd) / abs(length(8.0* position *f - vec2(c, s)) -0.4 -abs(sin(mouse.x)));
	}
	gl_FragColor = vec4(vec3(destColor * f), 1.0);
}