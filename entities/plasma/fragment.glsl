#ifdef GL_ES
	precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D fft;

float freqs[4];

void main( void ) {

	freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;

vec2 position = ( gl_FragCoord.xy * 2.0 -  resolution) / min(resolution.x, resolution.y);

	vec3 destColor = vec3(1.0, 0.5, 1.7);
	float f = 0.0;	
	
	float dd = freqs[0] * 10.;

	
	for(float i = 0.0; i < 50.0; i++){
		float s = sin(time + i ) ;
		float c = cos(time + i );
		f +=(0.003 + dd) / abs(length(8.0* position *f - vec2(c, s)) -0.4 -abs(sin(mouse.x)));
	}
	gl_FragColor = vec4(vec3(destColor * f), 1.0);
}