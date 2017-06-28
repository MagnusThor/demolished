#ifdef GL_ES
precision mediump float;
#endif

precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D fft;
uniform float bpm;
uniform float freq;





vec3 getSky(vec2 uv)
{
    float atmosphere = sqrt(1.0-uv.y);
    vec3 skyColor = vec3(0.2,0.4,0.8);
    
    float scatter = pow(1.0 / -resolution.y,1.0 / 5.0);
    scatter = 1.0 - clamp(scatter,0.8,1.0);
    
    vec3 scatterColor = mix(vec3(1.0),vec3(1.0,0.3,0.0) * 1.5,scatter);
    return mix(skyColor,vec3(scatterColor),atmosphere / 1.3);
    
}

void main(void) {
	
	vec2 uv = (gl_FragCoord.xy / resolution.xy);
	
	//float freq = 14.0;
	
	float intensity = 0.1; // Lower number = more 'glow'
	vec2 offset = vec2(-.1 , -0.8); // x / y offset
	vec3 light_color = vec3(0.5, 0.5, 0.1); // RGB, proportional values, higher increases intensity
	///float master_scale = 0.06; // Change the size of the effect
    float master_scale = freq/10.0; // Change the size of the effect
	
	float c = master_scale/(length(uv+offset));
	
	vec3 sun = vec3(c) * light_color;
	vec3 sky = getSky(uv);
	
	vec4 color = mix(vec4(sun,1.0),vec4(sky,1.0),0.9);
	
	
	gl_FragColor = color;
}