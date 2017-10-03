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

float freqs[4];

float map(vec3 p) {
	vec3 n = vec3(0, 1,-0.75);
	float k1 = 3.0;
	float k2 = (sin(p.x * k1) + sin(p.z * k1)) * (0.2) ;
	float k3 = (sin(p.y * k1) + sin(p.z * k1)) * 0.8;
	float w1 = 4.0 - dot(abs(p), normalize(n)) + k2;
	float w2 = 4.0 - dot(abs(p), normalize(n.yzx)) + k3;
	float s1 = length(mod(p.xy + vec2(sin((p.z + p.x) * 2.0) * 0.3, cos((p.z + p.x) * 1.0) * 0.5), 2.0) - 1.0) - 0.2;
	float s2 = length(mod(0.5+p.yz + vec2(sin((p.z + p.x) * 2.0) * 0.3, cos((p.z + p.x) * 1.0) * 0.3), 2.0) - 1.0) - 0.2;
	return min(w1, min(w2, min(s1, s2)));
}

vec2 rot(vec2 p, float a) {
	return vec2(
		p.x * cos(a) - p.y * sin(a),
		p.x * sin(a) + p.y * cos(a));
}



void main() {

	freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;
  
	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) * 2.0 - 1.0;

	uv.x *= resolution.x /  resolution.y;

	vec3 dir = normalize(vec3(uv, 1.0));
	
		dir.xz = rot(dir.xz, time *  0.0125);
		dir = dir.yzx;
		dir.xz = rot(dir.xz, time * 0.025);
		
		dir = dir.yzx;

	vec3 pos = vec3(0, 0,time);
	vec3 col = vec3(0.0);
	
	float t = 0.0;
    float tt = 0.0;
	for(int i = 0 ; i < 50; i++) {
		tt = map(pos + dir * t);
		if(tt < 0.001) break;
		t += tt * 0.45;
	}
	vec3 ip = pos + dir * t;
	col = vec3(t * 0.2	);
	//col = sqrt(col);
	gl_FragColor = vec4(0.05*t+abs(dir) * col + max(0.0, map(ip - 0.1) - tt), 1.0); 
}

