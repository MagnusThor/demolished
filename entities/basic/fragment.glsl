#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#extension GL_EXT_shader_texture_lod : enable
#ifdef GL_ES
precision highp float;
precision highp int;
#endif


uniform vec2 resolution;
uniform float time;
uniform float freq_data[32];
uniform float freq_time[32];
uniform sampler2D fft;
uniform sampler2D iChannel0;


vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }
vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }


const float PI = 3.14159;

vec3 hsv(float h,float s,float v) {
	return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}

void main()
{
    // create pixel coordinates
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	
	// quantize coordinates
	const float bands = 40.0;
	vec2 p;
	p.x = floor(uv.x*bands)/bands;
	p.y = uv.y;
	
	// read frequency data from first row of texture
	float fft  = texture2D( fft, vec2(p.x,0.0) ).x;	

	// led color
	vec3 color = hsv(p.x, 1.0 - p.y, 1.0);
	
	// led shape
	float dx = fract( (uv.x - p.x) * bands) - 0.5;
	//float led = smoothstep(0.5, 0.3, abs(d.x)) *
	//	        smoothstep(0.5, 0.3, abs(d.y));
	
	float led = smoothstep(0.5, 0.3, abs(dx));	
	
	// output final color
	//fragColor = vec4(vec3(fft),1.0);

    //fragColor = vec4(d, 0.0, 1.0);	
	
	//fragColor = vec4(vec3(led), 1.0);
	
	// mask for bar graph
	float mask = (p.y < fft) ? 1.0 : 0.0;	
	vec4 pp = texture2D(iChannel0,uv);

	gl_FragColor =  mix(vec4(color*mask*led, 1.0),pp,0.5);
}
