#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float hash( float n )
{
    return fract(sin(n*12.435)*43758.5453123);
}

bool notEmpty(ivec3 p)
{
	if (mod(float(p.z), 2.0) < 0.5)
		return length(vec2(p.xy)) > 1.1+4.0*hash(float(p.z));
	else
		return length(vec2(p.xy)) > 3.1;
}

// return location of first non-empty block
// marching accomplished with fb39ca4's non-branching dda: https://www.shadertoy.com/view/4dX3zl
vec3 intersect(vec3 ro, vec3 rd, out ivec3 ip, out ivec3 n)
{
	ivec3 mapPos = ivec3(floor(ro + 0.));
	vec3 deltaDist = abs(vec3(length(rd)) / rd);
	ivec3 rayStep = ivec3(sign(rd));
	vec3 sideDist = (sign(rd) * (vec3(mapPos) - ro) + (sign(rd) * 0.5) + 0.5) * deltaDist; 
	
	bvec3 mask;
	for (int i = 0; i < 25; i++) {
		if (notEmpty(mapPos)) continue;
		
		bvec3 b1 = lessThan(sideDist.xyz, sideDist.yzx);
		bvec3 b2 = lessThanEqual(sideDist.xyz, sideDist.zxy);
		mask.x = b1.x && b2.x;
		mask.y = b1.y && b2.y;
		mask.z = b1.z && b2.z;
		
		//All components of mask are false except for the corresponding largest component
		//of sideDist, which is the axis along which the ray should be incremented.			
		sideDist += vec3(mask) * deltaDist;
		mapPos += ivec3(mask) * rayStep;
	}
	ip = mapPos;
	n = ivec3(mask)*ivec3(sign(-rd));
	
	// intersect the cube (copied from iq :] )
	vec3 mini = (vec3(mapPos)-ro + 0.5 - 0.5*sign(rd))/rd;
	float t = max ( mini.x, max ( mini.y, mini.z ) );
	
	return ro+rd*t;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = (fragCoord.xy-resolution.xy/2.0) / resolution.yy * 8.0;
	uv.y = -uv.y;

	
	// perspective projection
	vec3 ro = vec3(0.5,0.5,time*6.0);
	vec3 rd = normalize(vec3(uv+vec2(0.01,0.01),1.0));
	
	ivec3 ip;
	ivec3 n;
	vec3 pos = intersect(ro,rd, ip,n);
	vec3 col = vec3(1.0);
	col.r = sin(float(ip.z-999)/25.0);
	col.g = sin(float(ip.z-99)/24.0);
	col.b = sin(float(ip.z)/23.0);
	col *= 0.2+0.8*hash(float(ip.z+10*ip.x+100*ip.y+99));
	
	vec3 cubeP = mod(pos-0.001,1.0);
	vec3 edgeD = 0.5-abs(cubeP-0.5);
	edgeD += abs(vec3(n));
	float closest = min(edgeD.x,min(edgeD.y,edgeD.z));
	float glow = smoothstep(0.1,0.0,closest);
	col += 0.2*glow;
	col += float(n.z)*0.5;
	col *= 8.0/pow(length(pos.z-ro.z),1.6);

	fragColor = vec4(col,1.0);
}

void main()
{
	vec4 color;
	mainImage(gl_FragColor, gl_FragCoord.xy);
}