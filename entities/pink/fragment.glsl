/// The drunk walk....  @Harley
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 resolution;

uniform sampler2D fft;
uniform float bpm;
uniform float freq;


float tri(in float x) {
	return abs(fract(x)-.5);
}

float square(in float x) {
	return fract(x) > 0.5 ? 1.0 : 0.0;
}

vec3 tri3(in vec3 p) {
	return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));
}

float triNoise3d(in vec3 p, in float spd) {
	float z = 1.4;
	float rz = 0.;
	vec3 bp = p;
	for (float i=0.; i<=1.; i++ ) {
        	vec3 dg = tri3(bp*5.);
        	p += (dg+time*spd);

        	bp *= 1.8;
		z *= 1.9;
		p *= 1.2;
        	
        	rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
        	bp += 4.14;
	}
	return rz;
}

float hash2(in vec2 p) {
	return fract(tan(dot(p, vec2(1.24, 13.78))) * 478.26);
}

float smin(in float a, in float b, in float k) {
	float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
	return mix(b, a, h) - k * h * (1.0 - h);
}

float path(in float z) {
	return sin(z/1.1*1.0-sin(time))*cos(z/9.0) + (z*0.03) * 1.0;
}

float sdCappedCylinder( vec3 p, vec2 h ) {
	vec2 d = abs(vec2(length(p.xz),p.y)) - h * (freq / 12.0);
	return min(max(d.x,d.y*d.y),0.0) + length(max(d,0.0));
}

float map(in vec3 p) {
	float tn = triNoise3d(p * 0.3,0.0) * 0.09;
	float d = p.y + tn;
	vec2 g = abs(p.xy - vec2(path(p.z), 0.0)) * vec2(1.0, 5.0);
	float road = max(g.x, g.y) - 0.8 + tn;
	
	vec3 q = p;
	q.xz = mod(p.xz - vec2(path(p.z), 0.0), 2.4) / 2.4 - 0.5;
	float b = hash2(floor((p.xz - vec2(path(p.z), 0.0)) * 1.0 / 2.4));
	float cyl = sdCappedCylinder(q, vec2(0.5, 3.0 * (1.0 + 2.0 * b)) * 0.1) - triNoise3d(p * 2.0*sin(time*0.001), 0.0) * 0.03;
	d = smin(d, road, 1.0);
	d = smin(d, cyl, 0.2);
	return d;
}

vec3 calcNormal(vec3 p) {
    vec2 e = vec2(-1.0, 1.0) * 0.003;
    return normalize(
        e.xyy * map(p + e.xyy) +
        e.yxy * map(p + e.yxy) +
        e.yyx * map(p + e.yyx) +
        e.xxx * map(p + e.xxx)
    );
}

float shadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float t = mint;
    float res = 1.0;
    for(int i = 0; i < 10; i++) {
        if(t > maxt) continue;
        float h = map(ro + rd * t);
        t += h;
        res = min(res, k * h / t);
    }
    return res;
}

vec3 camPos(float t) {
	return vec3(0.0, (sin(t * 2.0) * cos(0.5) + 0.5) * 0.01, t);
}

void main() { 
	vec2 p = gl_FragCoord.xy / resolution;
	p = 2.0 * p - 1.0;
	p.x *= resolution.x / resolution.y;
	
	vec3 ro = -camPos(-time) + vec3(0.0, 1.2, 1.4);
	vec3 target = -camPos(-time - 5.0) + vec3(1.0, -.3, 1.0);
	
	target.x += path(target.z);
	ro.x += path(ro.z);
	
	vec3 cw = normalize(target - ro);
	vec3 cup = vec3(sin(1.2), cos(1.0), 2.0);
	vec3 cu = normalize(cross(cw, cup));
	vec3 cv = normalize(cross(cu, cw));
	vec3 rd = normalize(p.x * cu + p.y * cv + 2.5 * cw);
	
	float t = 0.0;
	float e = 0.01;
	float h = e *2.0;
	for(int i = 0; i < 120; i++) {
	if(h < e || t > 20.0) continue;
		h = map(ro + rd * t);
		t += h;
	}
	
	//float col = p.y + 0.2 * 0.35 / length(p);
	float col = p.y;
	vec3 color = vec3(1.0);
	vec3 col_r = vec3(0.25, .0, 0.2);
	vec3 col_y = vec3(0.9, 0.6, 1.2);
	float depth = 15.0;
	float d = 0.5;
	float spe = 0.1;
	float bak = 0.3;
	if(t < 20.0) {
		vec3 pos = ro + rd * t;
		vec3 lig_pos = vec3(target.x, 5.0, 150.0 + time);
		vec3 lig = normalize(lig_pos - pos);
		vec3 nor = calcNormal(pos);
		float dif = clamp(dot(nor, lig), 0.0, 1.0);
		bak = 1.0 + dot(rd, nor);
		spe = pow(clamp(dot(rd, reflect(lig, nor)), 0.9, 1.0), 40.0);
		//float sh = shadow(pos, lig, 0.01, 20.0, 6.0);
		float depth = 1.55 - t / 20.0;
		d = pow(1.0 - t / 20.0, 2.0);
		col = ((dif + spe) + bak * 0.51) * depth;
	}
	color = 0.01 + mix(col_r, col_y, pow(d, 5.0)) * col + (spe * vec3(1.0, 0.0, 1.0)) * d * 0.3 + (bak*bak * vec3(0.5, 0.2, 0.0)) * d;
	gl_FragColor = vec4(color, 1.0);
}