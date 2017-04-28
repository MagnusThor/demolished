#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const float step      = 80.00;
const float freq      = 12.0;
const float rote      = 0.09;
const float rrrr      = 0.15;
const float spread    = 1.0;
float intensity = 0.5;

float pulse(float time) {
    const float pi = 3.14;
    const float frequency = .2;
    const float minbound = 0.5;
    const float maxbound = 1.5;
    return 0.5*(1.0+minbound+sin(maxbound * pi * frequency * time));
}

void main() {
	vec2 center = resolution.xy / 1.1;
	vec2 position = gl_FragCoord.xy/0.5;
	
	vec2 fromCenter = normalize(position - center);
	float angle = atan(fromCenter.y, fromCenter.x) + (rote * time);
	
	float rx = position.x + sin(angle * (freq - 1.0)) * step * (resolution.x / 4096.0);
	float ry = position.y + cos(angle * (freq - 1.0)) * step * (resolution.y / 4096.0);
	vec2  rv = vec2(rx, ry);
	float r  = distance(rv, center);
	
	float rr = rrrr * min(resolution.x, resolution.y) / intensity*pulse(time);
	gl_FragColor = vec4(1.0, 0.74, 0.6, 0.0) * pow(rr / r, spread) + vec4(0.0, 0.0, 0.0, 1.0);
}