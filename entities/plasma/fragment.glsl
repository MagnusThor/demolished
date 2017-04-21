#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float freq;

#define iResolution resolution
#define iMouse (mouse * resolution)
#define iGlobalTime time


#define EULER 2.7182818284590452353602874
// its from here https://github.com/achlubek/venginenative/blob/master/shaders/include/WaterHeight.glsl 
float wave(vec2 uv, vec2 emitter, float speed, float phase, float timeshift){
	float dst = distance(uv, emitter);
	return pow(EULER, sin(dst * phase - (iGlobalTime + timeshift) * speed)) / EULER;
}
vec2 wavedrag(vec2 uv, vec2 emitter){
	return normalize(uv - emitter);
}

#define DRAG_MULT 4.0

float getwaves(vec2 position){
    position *= 0.1;
	float iter = 0.0;
    float phase = 6.0;
    float speed = 2.0;
    float weight = 1.0;
    float w = 0.0;
    float ws = 0.0;
    for(int i=0;i<7;i++){
        vec2 p = vec2(sin(iter), cos(iter)) * 30.0;
        float res = wave(position, p, speed, phase, 0.0);
        float res2 = wave(position, p, speed, phase, 0.006);
        position -= wavedrag(position, p) * (res - res2) * weight * DRAG_MULT;
        w += res * weight;
        iter += 12.0;
        ws += weight;
        weight = mix(weight, 0.0, 0.2);
        phase *= 1.2;
        speed *= 1.02;
    }
    return w / ws;
}
float getwavesHI(vec2 position){
    position *= 0.1;
	float iter = 0.0;
    float phase = 6.0;
    float speed = 2.0;
    float weight = 1.0;
    float w = 0.0;
    float ws = 0.0;
    for(int i=0;i<27;i++){
        vec2 p = vec2(sin(iter), cos(iter)) * 30.0;
        float res = wave(position, p, speed, phase, 0.0);
        float res2 = wave(position, p, speed, phase, 0.006);
        position -= wavedrag(position, p) * (res - res2) * weight * DRAG_MULT;
        w += res * weight;
        iter += 12.0;
        ws += weight;
        weight = mix(weight, 0.0, 0.2);
        phase *= 1.2;
        speed *= 1.02;
    }
    return w / ws;
}

float H = 0.0;
vec3 normal(vec2 pos, float e, float depth){
    vec2 ex = vec2(e, 0);
    H = getwavesHI(pos.xy) * depth;
    vec3 a = vec3(pos.x, H, pos.y);
    return normalize(cross(normalize(a-vec3(pos.x - e, getwavesHI(pos.xy - ex.xy) * depth, pos.y)), 
                           normalize(a-vec3(pos.x, getwavesHI(pos.xy + ex.yx) * depth, pos.y + e))));
}
mat3 rotmat(vec3 axis, float angle)
{
	axis = normalize(axis);
	float s = sin(angle);
	float c = cos(angle);
	float oc = 1.0 - c;
	
	return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s, 
	oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s, 
	oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
} 
vec3 getRay(vec2 uv){
    uv = (uv * 2.0 - 1.0)* vec2(iResolution.x / iResolution.y, 1.0);


    float aa = cos((freq/ 100) * time);

	vec3 proj = normalize(vec3(uv.x, uv.y, 1.0) + vec3(uv.x, uv.y, -1.0) * pow(length(uv), 2.0) * 0.05);	 
	vec3 ray = rotmat(vec3(0.0, -1.0, 0.0), aa * 2.0 - 1.0) * rotmat(vec3(1.0, 0.0, 0.0), 0.5 * -(mouse.y * 2.0 - 1.0)) * proj;
    return ray;
}

float rand2sTimex(vec2 co){
    return fract(sin(dot(co.xy * iGlobalTime,vec2(12.9898,78.233))) * 43758.5453);
}
float raymarchwater2(vec3 camera, vec3 start, vec3 end, float depth){
    float stepsize = 1.0 / 5.0;
    float iter = 0.0;
    vec3 pos = start;
    float h = 0.0;
    float rd = stepsize * rand2sTimex(end.xz);
    for(int i=0;i<6;i++){
        pos = mix(start, end, iter);
        h = getwaves(pos.xz) * depth - depth;
        if(h > pos.y) {
            return distance(pos, camera);
        }
        iter += stepsize;
    }
    return -1.0;
}

float raymarchwater(vec3 camera, vec3 start, vec3 end, float depth){
    float stepsize = 1.0 / 15.0;
    float iter = 0.0;
    vec3 pos = start;
    float h = 0.0;
    float rd = stepsize * rand2sTimex(end.xz);
    for(int i=0;i<16;i++){
        pos = mix(start, end, iter + rd);
        h = getwaves(pos.xz) * depth - depth;
        if(h > pos.y) {
            return raymarchwater2(camera, mix(start, end, iter - stepsize + rd), mix(start, end, iter + rd), depth);
        }
        iter += stepsize;
    }
    return -1.0;
}

float intersectPlane(vec3 origin, vec3 direction, vec3 point, vec3 normal)
{ 
    return clamp(dot(point - origin, normal) / dot(direction, normal), -1.0, 9991999.0); 
}

vec3 getatm(vec3 ray){
 	return mix(vec3(0.9), vec3(0.0, 0.2, 0.5), sqrt(abs(ray.y)));
    
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
 	
	float waterdepth = 2.1;
	vec3 wfloor = vec3(0.0, -waterdepth, 0.0);
	vec3 wceil = vec3(0.0, 0.0, 0.0);
	vec3 orig = vec3(0.0, 2.0, 0.0);
	vec3 ray = getRay(uv);
	float hihit = intersectPlane(orig, ray, wceil, vec3(0.0, 1.0, 0.0));
    if(ray.y >= -0.01){
        vec3 C = getatm(ray) * 2.0;
        //tonemapping
        C = normalize(C) * sqrt(length(C));
     	fragColor = vec4( C,1.0);   
        return;
    }
	float lohit = intersectPlane(orig, ray, wfloor, vec3(0.0, 1.0, 0.0));
    vec3 hipos = orig + ray * hihit;
    vec3 lopos = orig + ray * lohit;
	float dist = raymarchwater(orig, hipos, lopos, waterdepth);
    vec3 pos = orig + ray * dist;

	vec3 N = normal(pos.xz, 0.01, waterdepth);
    vec2 velocity = N.xz * (1.0 - N.y);
    N = mix(vec3(0.0, 1.0, 0.0), N, 1.0 / (dist * dist * 0.01 + 1.0));
    vec3 R = reflect(ray, N);
    float fresnel = (0.04 + (1.0-0.04)*(pow(1.0 - max(0.0, dot(-N, ray)), 5.0)));
	
    vec3 C = fresnel * getatm(R) * 2.0 + fresnel;
	
    // water sprays, TimoKinnunen comment on 2017-Apr-2
  	C += smoothstep(.05,.2, length(velocity));
    //tonemapping
    C = normalize(C) * sqrt(length(C));
    
	fragColor = vec4(C,1.0);
}
void main( void ) {

	vec2 position = ( gl_FragCoord.xy  ) ;
 	vec4 c = vec4(0.0);
	mainImage(c, position);
	gl_FragColor = c;

}