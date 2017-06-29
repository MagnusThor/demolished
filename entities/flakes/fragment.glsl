#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform sampler2D fft;
uniform float bpm;
uniform float freq;

const float z = 100.0;

void main(void)
{
	vec2 uv = gl_FragCoord.xy;
	
	vec2 pq = vec2((uv.x+uv.y)/z, (uv.x-uv.y)/z);	
	
	float t = time/ freq;
	
	vec2 ph1 = sign(mod(pq,4.0)-1.99999);
	float ph= ph1.x*ph1.y;

	vec2 xy = mod(pq,2.0)-1.0;
	float f = atan(xy.y,xy.x);
	f+= t*ph;
	float c = sign(tan(f*8.0))*ph;
	
	gl_FragColor = vec4(c,c,c,1.0);
}