#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float freq_data[32];
uniform float freq_time[32];

vec4 pal(float t) {
	return vec4(
		sin(t/2.0)+cos(t/5.76+14.5)*0.5+0.5,
		sin(t/2.0)+cos(t/4.76+14.5)*0.5+0.4,
		sin(t/2.0)+cos(t/3.76+14.5)*0.5+0.3,
		1.0);
}

void main( void ) {
	vec2 pos = gl_FragCoord.xy / resolution;
	float aspect = resolution.x / resolution.y  + freq_time[7] ;
	

	float rand = mod(fract(sin(dot(pos + time, vec2(12.9898,100.233))) * 43758.5453), 1.0) * 0.0;
	rand += .8 * (1. - (length((pos - (1.0 -mouse)) * vec2(aspect, 1.)) * 8.));
        rand *= 1.8 * (1. - (length((pos - mouse) * vec2(aspect, 1.)) * (2.0+sin(time*1.0)*2.0)));

	//gl_FragColor = vec4( sin(rand*4.0), cos(rand*0.3), sin(10.0+rand*10.0), 1.0);
	gl_FragColor=pal(rand*4.0);
}