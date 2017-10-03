#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable


uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


const float PI = 3.14159265358979323844;
float ray_scale = 1.0;//(1. / max(resolution.x, resolution.y));

mat3 camera(vec3 e, vec3 la) {
    vec3 roll = vec3(0, 1, 0.);
    vec3 f = normalize(la - e);
    vec3 r = normalize(cross(roll, f));
    vec3 u = normalize(cross(f, r));

    return mat3(r, u, f);
}

float de(vec3 p) {
    float r = 0., power = 8., dr = 1.;
    vec3 z = p;
    for (int i = 0; i < 12; i++) {
        r = length(z);
        if (r > 2.) break;
        float theta = acos(z.z / r)+ fract(time/20.) * 6.3;
        float phi = atan(z.y, z.x);

        dr = pow(r, power - 1.) * power * dr + 1.;
        float zr = pow(r, power);
        theta = theta * power;
        phi = phi * power;
        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += p;


    }

    return .5 * log(r) * r / dr;

}
float intersect( in vec3 ro, in vec3 rd) {
    const float maxd = 7.0;

    float precis = 0.001;
    float h = 1.0;
    float t = 1.0;
    for (int i = 0; i < 1256; i++) {
        if ((h < precis) || (t > maxd)) break;
        h = de(ro + rd * t);
        t += h;
    }

    if (t > maxd) t = -1.0;
    return t;
}



float raymarch( in vec3 from, in vec3 dir) {

    float l = 0.;
    float d = 0.;
    float e = 0.00001;
    float it = 0.;

    for (int i = 0; i < 12; i++) {
        d = de(from);

        from += d * dir;
        l += d;
        if (d < e) break;

        e = ray_scale * l;
        it++;
    }
    float f = 1. - (it / float(12));
    return f;
}

vec3 sky(vec3 ray) {
    return mix(vec3(.8), vec3(0), exp2(-(1.0 / max(ray.y, .01)) * vec3(.4, .6, 1.0)));
}

float map(vec3 p) {
    return de(p);
}

vec3 calcNormal( in vec3 pos) {
    vec3 eps = vec3(0.005, 0.0, 0.0);
    return normalize(vec3(
        map(pos + eps.xyy) - map(pos - eps.xyy),
        map(pos + eps.yxy) - map(pos - eps.yxy),
        map(pos + eps.yyx) - map(pos - eps.yyx)));
}



float softshadow( in vec3 ro, in vec3 rd, in float mint, in float tmax) {
    float res = 1.0;
    float t = mint;
    for (int i = 0; i < 16; i++) {
        vec2 p = vec2(map(ro + rd * t));
        float h = p.x;
        res = min(res, 8.0 * h / t);
        t += clamp(h, 0.02, 0.10);
        if (h < 0.001 || t > tmax) break;
    }
    return clamp(res, 0.0, 1.0);
}

float calcAO( in vec3 pos, in vec3 nor) {
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 0; i < 5; i++) {
        float hr = 0.01 + 0.12 * float(i) / 4.0;
        vec3 aopos = nor * hr + pos;

        vec2 p = vec2(map(aopos));

        float dd = p.x;
        occ += -(dd - hr) * sca;
        sca *= 0.95;
    }
    return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}



float aspect_ratio = resolution.y / resolution.x;

void main(void) {



    vec2 tx = (gl_FragCoord.xy / resolution.xy) - 0.5;


    float a = time * .05;
    float sa = sin(a);
    float ca = cos(a);

    float fov = 2.0;

    vec3 dir = vec3(tx.x * fov, tx.y * fov * aspect_ratio, 1.);


    dir.xy = vec2(dir.x * ca - dir.y * sa, dir.x * sa + dir.y * ca);
    dir.xz = vec2(dir.x * ca - dir.z * sa, dir.x * sa + dir.z * ca);

    vec3 cam = vec3(0.0, 0., -2.5);
    cam.xz = vec2(cam.x * ca - cam.z * sa, cam.x * sa + cam.z * ca);


    vec3 ro = cam;
    vec3 rd = dir;

    vec3 col = vec3(0.9);

    float t = intersect(ro, rd);

    if (t > .0) {
        vec3 pos = ro + t * rd;
        vec3 nor = calcNormal(pos);

        vec3 ref = reflect(rd, nor);

        float occ = calcAO(pos, nor);

        vec3 lig = normalize(vec3(-0.4, 0.7, -0.6));
        float amb = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);
        float dif = clamp(dot(nor, lig), 0.0, 1.0);
        float bac = clamp(dot(nor, normalize(vec3(-lig.x, 0.0, -lig.z))), 0.0, 1.0) * clamp(1.0 - pos.y, 0.0, 1.0);
        float dom = smoothstep(-0.1, 0.1, ref.y);
        float fre = pow(clamp(1.0 + dot(nor, rd), 0.0, 1.0), 2.0);
        float spe = pow(clamp(dot(ref, lig), 0.0, 1.0), 16.0);

        dif *= softshadow(pos, lig, 0.02, 2.5);
        dom *= softshadow(pos, ref, 0.02, 2.5);

        vec3 lin = vec3(0.0);
        lin += 1.30 * dif * vec3(1.00, 0.80, 0.55);
        lin += 2.00 * spe * vec3(1.00, 0.90, 0.70) * dif;
        lin += 0.40 * amb * vec3(0.40, 0.60, 1.00) * occ;
        lin += 0.50 * dom * vec3(0.40, 0.60, 1.00) * occ;
        lin += 0.50 * bac * vec3(0.25, 0.25, 0.25) * occ;
        lin += 0.25 * fre * vec3(1.00, 1.00, 1.00) * occ;
        col = col * lin;

        col = mix(col, vec3(0.8, 0.9, 1.0), 1.0 - exp(-0.0002 * t * t * t));

        gl_FragColor = vec4(col, 1.);
    }

}