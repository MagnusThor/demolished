#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives: enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float x(float x) {
	return abs(smoothstep(-1., 1., time - x) * 2. - 1.);
}
vec2 m;

mat2 s(float m) {
	float z = sin(m), x = cos(m);
	return mat2(x, z, -z, x);
}
float s(float x, float m, float z) {
	return -log(exp(-z * x) + exp(-z * m)) / z;
}
float x(float x, float m, float z) {
	return -log(exp(z * x) + exp(z * m)) / -z;
}
float n(vec3 m) {
	return dot(m, normalize(sign(m + 1e-07)));
}
float f(vec3 m) {
	return fract(sin(dot(vec3(12, 26, 48), m)) * 49512.);
}
const vec2 v = vec2(0, 1);
float f(vec3 m, vec3 x) {
	return mix(mix(f(m + v.xxx), f(m + v.yxx), x.x), mix(f(m + v.xyx), f(m + v.yyx), x.x), x.y);
}
float n(vec3 m, bool x) {
	vec3 z = floor(m), y = x ? vec3(.5) : fract(m);
	return mix(f(z, y), f(z + v.xxy, y), y.z);
}
float p(vec3 m) {
	return n(m, false);
}
float r(vec3 m) {
	m.y *= .5;
	float z = 0.;
	for (int x = 1; x < 6; x++) {
		float y = float(x * x);
		z += p(m * y) / y;
	}
	return z / 4.;
}
float a(vec3 m) {
	return pow(r(m) + .4, 3.) * 4.;
}
float i(vec3 m) {
	float z = m.x, y = m.y, v = m.z, c = abs(z);

	return s(s(x(-length(vec2(y + .35, v - .55)) + .05, x(x(x(-abs(y + 1.) + .35, x(x(mix(mix(s(mix(length(m) - .5, c - .4,
				smoothstep(0., -1., y) * .2), min(max(c + .35, max(abs(y - .2) - .1, abs(abs(v) - .2))), max(abs(c - .4) + .3, max(abs(y - .25),
				abs(v) - .12))), 10.), length(vec2(c - .4, y)) - .3, -.3), length(m + vec3(0., .5, .5)) - .5, -.4), -length(vec3(c - .3, y, v - .5)) + .1, 17.), -length(vec3(c - .05, y + .2, v - .5)) - .02, 17.), 6.), -length(vec2(y, v - .9)) + .3, 20.), -length(vec2(c - .7, y + .4)) + .4 +
			smoothstep(.4, -.1, v) * .1, 10.), 15.), max(length(vec2(abs(y + .35 + z * z * 5.) - .035, v - .475)) - .1 + z * z * 10., c - .4), 50.),
		max(length(vec3(c - .25, y, v - .42)) - .15, -y + .05 + .1 * cos(time * .7) - c * .4), 60.) + a(m * 10.) * .012;
}

float w(vec3 m) {
	return m.x = abs(m.x) - .25, m.z -= .45, length(m) - .1;
}
float d(vec3 m) {
	m.y += 1.275;
	vec3 z = abs(m) - vec3(.4, .2, 0.);
	return s(min(max(max(z.x, z.y), z.z), length(max(z, 0.)) - .32), length(vec3(z.x - .2, m.y - .4, m.z - .14)) - .2, 30.) - a(m * 2.) * .05;
}
float g(vec3 m) {
	return min(s(i(m), d(m), 8.), w(m));
}
float l(vec3 m) {
	return m.xz *= s(time * .1), (r(m * 3. * p(m * 3. + vec2(0., time * .2).xyx)) * 1.5 - length(m) + 1.2) * .5;
}
float e(vec3 m) {
	float z = sin(m.z * .1);
	m.x += z;
	return min(a(m * .7) * 2. + p(m * .3) * 6. + min(m.y * 3., 0.) * .5 - length(m.xy) + 2. + z, m.y + 2. + r(m + p(m * 2.) - time)) * .5;
}
float y(vec3 m) {
	m.xz *= s(time * .2 * step(time, 122.8));
	vec3 x = m;
	m.xz = mod(m.xz + 3.5, 7.) - 3.5;
	for (int z = 0; z < 10; z++)
		m.xz = abs(m.xz) - .8, m.xz *= s(.9), m.xy *= s(.8);
	m = reflect(m, normalize(sign(m + 1e-06)) * .2);
	return n(m) - .5 - n(x) * .11;
}
float c(vec3 m) {
	return time < 20.4 ? g(m) : time < 40.85 ? l(m) : time < 81.7 ? e(m) : time < 102. ? l(m) : time < 143. ? y(m) : g(m);
}
const vec2 z = vec2(.01, 0);
vec3 o(vec3 m) {
	return normalize(vec3(c(m + z.xyy) - c(m - z.xyy), c(m + z.yxy) - c(m - z.yxy), c(m + z.yyx) - c(m - z.yyx)));
}
vec3 u(vec3 m) {
	return vec3(pow(a(m * 4. + a(m * 15. + time)) + .3, 3.), .1, .7);
}
vec3 a(vec3 m, vec3 x, vec3 z, float y) {
	vec3 v = o(z), c = normalize(m - z), a = vec3(-.47, .67, .57);
	float f = length(z), s = max(dot(v, a), 0.), p = pow(max(dot(v, normalize(c + a)), 0.), 200.) * r(z * 1300.) * 3., l = w(z);
	return time < 20.4 || time > 143. ? l < .001 ? u(reflect(v, c)) * .25 + p * 10. : vec3(.8 + r(z * 60.) * 2., .9, .7) * s * s + p + step(3., f) * u(x) :
		min(time < 40.85 || time > 81.7 && time < 102. ? (2.7 - z) * pow(y, 1.4) : time < 102. ? vec3(1., .8 + max(-z.y * .7 - .5, 0.), .5 + length(z.xy) * .12) * pow(y, 1.4) + p : vec3(.3, .2 + length(z) * .1, .9 - length(z) * .02) * 1.5 * pow(y, 1.4) + p, 1.);
}
vec3 b(vec3 z) {
	float y = length(vec2(m.x * (time > 20.4 && time < 143. ? .65 : 1.), m.y)) * (step(time, 20.4) * .2 + .8);
	return z * smoothstep(180., 167., time) * smoothstep(0., 8., time) * x(40.85) * x(61.) * x(81.7) * x(102.) * x(107.2) * x(112.4) * x(117.6) *
		x(122.8) * x(143.) * max(1. - y * .5, 0.) * (1. - y + max(y - .9, 0.) * a((m * s(time * .2)).xyy * 20. / n(m.xyy)));
}


void main() {

	m = (gl_FragCoord.xy / resolution.xy * 2. - 1.) * vec2(resolution.x / resolution.y, 1.);

	vec3 z, y, x;
	float r, v, f = 0.;

	if (time < 20.4 || time > 143.) {
		r = smoothstep(0., 20., time - 143.), v = 1. - r * 1.5;
		z = vec3(0, .16, .65 - smoothstep(15.5, 20., time) * .058 + r * .8), y = normalize(vec3(m, -1.));
		mat2 p = s(-.5 * v), w = s(-.3 * v);
		z.yz *= w;
		y.yz *= w;
		z.xz *= p;
		y.xz *= p;
	} else if (time < 40.85 || time > 81.7 && time < 102.)
		z = vec3(0., 0., -1.1 + smoothstep(20.4, 40.85, time) * 2.3), y = normalize(vec3(time < 81.7 ? m : abs(m), -1. + (time < 81.7 ? 0. : length(m) * floor((time - 81.7) / 5.2) * .5)));
	else if (time < 102.) {
		z = vec3(m, -time + 5.), y = normalize(vec3(m, -1.75 + length(m) * .5));
		if (time < 61.)
			y.yz *= s(-1.5), y.xz *= s(time * .3);
	} else if (time < 107.2)
		z = vec3(-.5, -.8, 1), y = normalize(vec3(m, -1.3)), y.yz *= s(1.4);
	else if (time < 112.4)
		z = vec3(1., -.75 + (time - 107.2) * .1, 1. - (time - 107.2) * .2), y = normalize(vec3(m, -.7)), y.yz *= s(1.4);
	else if (time < 117.6)
		z = vec3(0, -.8 + (time - 112.4) * .2, 0), y = normalize(vec3(m, -1)).xzy;
	else if (time < 122.8)
		z = vec3(0., 1. - (time - 117.7) * .2, 0.), y = normalize(vec3(m, -1.));
	else if (time < 143.)
		z = vec3(0., 1., -5. + (time - 117.7) * .2), y = normalize(vec3(m * s(time * .2), -1. + smoothstep(0., 21., time - 122.8) * .8));

	int p;
	for (int i = 0; i < 70; i++) {
		p = i;
		x = z + y * f;
		float w = c(x);
		if (w < .0001)
			break;
		f += w;
	}
	f = float(p) / 60.;
	gl_FragColor = vec4(b(a(z, y, x, f)), 1.);
}