

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
const float PI = 3.1415926535;

uniform sampler2D fft;
uniform float bpm;
uniform float freq;

float freqs[4];

float max3(float a,float b,float c)
{
	return max(a, max(b,c));
}



float rect( vec2 p, vec2 b, float smooth )
{
	vec2 v = abs(p) - b;
  	float d = length(max(v,0.0));
	return 1.0-pow(d, smooth);
}

void main( void ) {

    freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;

	vec2 unipos = (gl_FragCoord.xy / resolution);
	vec2 pos =  unipos*2.0-1.0;
	pos.x *= resolution.x / resolution.y;

	float flash = sin(time*(freq / 10.0));
	float uflash = flash*0.5+0.5;
	
	
	
	// scroll
	pos.x -= sin(time*0.5)*1.0;
	
	float d1 = rect(pos - vec2(-1.0,0.0), vec2(0.1,freqs[3]), 0.1); 
	vec3 clr1 = vec3(0.2,0.6,1.0) *d1; 
	
	float d2 = rect(pos - vec2(0.0,0.0), vec2(0.1,freqs[1]), 0.1); 
	vec3 clr2 = vec3(0.6,0.99,0.2) *d2; 

	float d3 = rect(pos - vec2(1.0,0.0), vec2(0.1,freqs[2]), uflash*0.2); 
    
	vec3 clr3 = vec3(0.99,0.6,0.2) *0.75*d3 + (0.25*flash); 

	
	
	vec3 clr = clr1+clr2+clr3;
	gl_FragColor = vec4( clr , 1.0 );

}