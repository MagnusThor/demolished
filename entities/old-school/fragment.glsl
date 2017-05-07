#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float freq_data[32];
uniform float freq_time[32];


void main( void ) {

	vec2 p = ( gl_FragCoord.xy / resolution.xy ) - 0.5;
	float sx = (freq_time[10] / 1.) * (p.x  + (0.2)) * sin( 24.0 * p.x - 10. * time);
	float dy = 1./ ( 50. * abs(p.y - sx));
	dy += 0.1 / (20. * length(p - vec2(p.x, 0.)));
	gl_FragColor = vec4( (p.x + 0.5) * dy, 0.5 * dy, dy * 2.0, 1.0 );




}