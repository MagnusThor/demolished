#ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
#endif

#extension GL_EXT_shader_texture_lod : enable

#ifdef GL_ES
    precision highp float;
    precision highp int;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform sampler2D fft;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

 vec3 path(in float z){ 
     float s = sin(z/24.)*cos(z/12.); 
     return vec3(s*12., 0.,s* 1.);
}


float freqs[4];

void main(void){
        

	freqs[0] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.23, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.55, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.60, 0.0 ) ).x;

    vec3 d = normalize(vec3((gl_FragCoord.xy - resolution.xy * .5) / resolution.x, .15));
	vec3 p, c, f, g=d, o, y=vec3(1.0,3.0,0.0);
   
 	o.y = 4. + 4.8*cos((o.x=0.1)*(o.z=time * 10.0));
	o.x -= sin(time) + 1.0 ;

    for( float i=.0; i<8.; i+=.05 ) {
        f = fract(c = o += d*i*.1); 
	p = floor( c )*.4;
        if( cos(p.z) + sin(p.x) > ++p.y ) {
             c += path(c.z);
	    	g = (f.y-.04*cos((c.x+c.z)*10.)>.7?y:f.x*y.yxz) / i;
            break;
        }
    }
    gl_FragColor = vec4(g,1.0);
}




