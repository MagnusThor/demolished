#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;


uniform sampler2D fft;
uniform float bpm;
uniform float freq;


float freqs[4];

vec4 strobe(in vec2 p,out float t){
	
	float border = 0.9;
	float r = 1.0 * 0.12;
	
	vec4 col = vec4(1.0, 1.0, 1.0, 1.0);
	
	float dist =  sqrt(dot(p, p));
	
	t = 1.0 + smoothstep(r, r +border, dist) 
                - smoothstep(r-border, r, dist);
	
	return col;
}
 
void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;

	vec3 bar = vec3 ( 0.3, 0.5, 0.5 );
	
	bar  *= abs( 1.0 / (sin( uv.y + sin(uv.x+time)* 0.4 ) * 40.0) );
	
	freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;

  

   

	if(freq   > 9.0 ){
		float t = 0.0;
	vec4 circle_color = strobe(uv,t); 
		gl_FragColor = mix(circle_color,vec4( bar, 1.0 ),t);
	}
	else{
		gl_FragColor = vec4( bar, 1.0 );
	}
		
	

}