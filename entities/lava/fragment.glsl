#ifdef GL_ES
	precision highp float;
	precision highp int;
#endif

uniform float time;

uniform vec2 mouse;
uniform vec2 resolution;


uniform sampler2D iChannel0;
uniform sampler2D iChannel1;


#define NEW_LAVA 1
#define TEMPERATURE 2200.0

float fbm(vec2 p);
float fizzerEmbers(inout vec3 diffuse, vec3 norm, float time, vec2 coord);

vec3 blackbody(float t)
{
    t *= TEMPERATURE;
    
    float u = ( 0.860117757 + 1.54118254e-4 * t + 1.28641212e-7 * t*t ) 
            / ( 1.0 + 8.42420235e-4 * t + 7.08145163e-7 * t*t );
    
    float v = ( 0.317398726 + 4.22806245e-5 * t + 4.20481691e-8 * t*t ) 
            / ( 1.0 - 2.89741816e-5 * t + 1.61456053e-7 * t*t );

    float x = 3.0*u / (2.0*u - 8.0*v + 4.0);
    float y = 2.0*v / (2.0*u - 8.0*v + 4.0);
    float z = 1.0 - x - y;
    
    float Y = 1.0;
    float X = Y / y * x;
    float Z = Y / y * z;

    mat3 XYZtoRGB = mat3(3.2404542, -1.5371385, -0.4985314,
                        -0.9692660,  1.8760108,  0.0415560,
                         0.0556434, -0.2040259,  1.0572252);

    return max(vec3(0.0), (vec3(X,Y,Z) * XYZtoRGB) * pow(t * 0.0004, 4.0));
}

vec3 lava(vec3 norm, float lavaHeight, vec3 p, float f0, vec2 coord, float time, float moveSpeed, vec3 diffuse, vec3 ro)
{
    float embers = fizzerEmbers(diffuse, norm, time, coord);
    
    float mask = max(0.0, 1.0 - abs(lavaHeight - p.y) * 16.0);
    
    vec2 uv = norm.yy - p.zx;
    uv.x -= mask * lavaHeight + p.y;
    
    float tex = 1.1 - texture2D(iChannel1, uv).x;
    
    float hot = smoothstep(0.2, 0.0, lavaHeight);
    float cold = smoothstep(0.0, 1.0, (p.z + time * moveSpeed + sin(p.x + time * 0.2) + 1.0) * 0.3 + 0.1);
    float glow = max(0.0, (1.0-mask)*4.0 * (0.1 - (p.y - lavaHeight) * (f0 * 1.5 - 0.5) * f0));
    float haze = length(ro-p) * 0.025 * cold;
    
    float temp = ((hot * 2.4 + 2.8) * tex - cold) * (tex+0.2);
    temp = mix(glow * 1.2, smoothstep(0.0, 1.5, temp) * 2.0, mask) + embers * 6.0;
    
    return diffuse * (1.0-mask) 
                   + blackbody(temp) * vec3(2.6, 0.8, 0.5)
                   + haze * vec3(0.5,0.1,0.05);
}


float fizzerEmbers(inout vec3 diffuse, vec3 norm, float time, vec2 coord)
{
    diffuse*=(0.5+0.5*norm.x)*2.5+vec3(1.0,0.35,0.04)*0.02;
    float embers=smoothstep(0.77+sin(time*20.0)*0.01+sin(time)*0.01,1.0,fbm(coord*10.0+vec2(cos(coord.y*0.8+time*0.7)*10.0,time*4.0)));
    embers+=smoothstep(0.77+sin(time*22.0)*0.01+sin(time*1.2)*0.01,1.0,fbm(vec2(100.0)+coord*8.0+vec2(time*8.0+cos(coord.y*0.3+time*0.3)*10.0,time*7.0)));
    return embers;
}


#define MOTIONBLUR_EMBERS 	0 // Set to 1 to enable sampled motion blur on the embers.
#define ADD_HEAT_GLOW 		0 // Set to 1 to make the rock glow red as the lava covers it.

float moveSpeed=1.75;

float cubic(float x)
{
    return (3.0 * x - 2.0 * x * x) * x;
}

vec3 rotateX(float angle, vec3 v)
{
    return vec3(v.x, cos(angle) * v.y + sin(angle) * v.z, cos(angle) * v.z - sin(angle) * v.y);
}

vec3 rotateY(float angle, vec3 v)
{
    return vec3(cos(angle) * v.x + sin(angle) * v.z, v.y, cos(angle) * v.z - sin(angle) * v.x);
}

float hash(float n)
{
    n=mod(n,1024.0);
    return fract(sin(n)*43758.5453);
}

float noise(vec2 p)
{
    return hash(p.x + p.y*57.0);
}

float smoothNoise2(vec2 p)
{
    vec2 p0 = floor(p + vec2(0.0, 0.0));
    vec2 p1 = floor(p + vec2(1.0, 0.0));
    vec2 p2 = floor(p + vec2(0.0, 1.0));
    vec2 p3 = floor(p + vec2(1.0, 1.0));
    vec2 pf = fract(p);
    return mix( mix(noise(p0), noise(p1), pf.x),mix(noise(p2), noise(p3), pf.x), pf.y);
}

float cellnoise(vec2 p)
{
    vec2 fp=fract(p);
    vec2 ip=p-fp;
    float nd=1e3;
    vec2 nc=p;
    for(int i=-1;i<2;i+=1)
        for(int j=-1;j<2;j+=1)
        {
            vec2 c=ip+vec2(i,j)+vec2(noise(ip+vec2(i,j)),noise(ip+vec2(i+10,j)));
            float d=distance(c,p);
            if(d<nd)
            {
                nd=d;
                nc=c;
            }
        }

    return nd;
}

float heightField(vec2 p)
{
    float f=0.0;
    for(int i=0;i<3;i+=1)
        f+=smoothNoise2(p*exp2(float(i+2)))/exp2(float(i));
    return smoothstep(0.0,0.7,1.0-smoothstep(0.0,0.9,cellnoise(p)))*0.4+f*0.04;
}


float fbm(vec2 p)
{
    float f=0.;
    for(int i=0;i<4;i+=1)
        f+=smoothNoise2(p*exp2(float(i)))/exp2(float(i+1));
    return f;
}

float bumpHeight(vec2 p)
{
    float f=0.0;
    p*=4.0;
    for(int i=0;i<5;i+=1)
        f+=smoothNoise2(p*exp2(float(i)))/exp2(float(i+1));
    return f*0.15;
}

vec3 bumpNormal(vec2 p)
{
    vec2 eps=vec2(1e-5,0.0);
    float bumpScale=10.0;
    float c=bumpHeight(p);
    float d0=(bumpHeight(p+eps.xy))-c;
    float d1=(bumpHeight(p+eps.yx))-c;
    return normalize(cross(vec3(eps.y,d1,eps.x),vec3(eps.x,d0,eps.y)));
}

vec3 heightFieldNormal(vec2 p)
{
    vec2 eps=vec2(1e-1,0.0);
    float bumpScale=10.0;
    float c=heightField(p);
    float d0=(heightField(p+eps.xy))-c;
    float d1=(heightField(p+eps.yx))-c;
    vec3 n0 = normalize(cross(vec3(eps.y,d1,eps.x),vec3(eps.x,d0,eps.y)));
    vec3 bn = bumpNormal(p);
    return normalize(n0+(bn-n0*dot(n0,bn))*0.2);
}

vec3 tonemap(vec3 c)
{
    return c/(c+vec3(0.6));
}

float evalLavaHeight(vec2 p)
{
    return mix(-0.5,0.2,cubic(clamp(1.0-(-p.y-time*moveSpeed)+sin(p.x+time*0.2),0.0,1.0)));
}

vec3 _sample(vec2 coord)
{
    vec3 ro=vec3(0.0,3.0,-2.0-time*moveSpeed+cos(time*1.0)*0.05);
    vec3 rd=rotateY(3.1415926+sin(time*0.1),rotateX(1.0+sin(time*0.4)*0.05,normalize(vec3(coord,-1.3))));
 float t0=(0.5-ro.y)/rd.y;
    float t1=(0.0-ro.y)/rd.y;

    const int n=14;

    float lavaHeight=sin(time) * 3.0;

    vec3 prevp=ro+rd*t0,p=prevp;
    float ph=heightField(prevp.xz);

    // Raymarch through the heightfield with a fixed number of steps.
    for(int i=1;i<n;i+=1)
    {
        float pt=mix(t0,t1,float(i-1)/float(n));
        float t=mix(t0,t1,float(i)/float(n));
        p=ro+rd*t;
        lavaHeight=evalLavaHeight(p.xz);
        float h=max(lavaHeight,heightField(p.xz));
        if(h>p.y)
        {
            // Refine the intersection point.
            float lrd=length(rd.xz);
            vec2 v0=vec2(lrd*pt, prevp.y);
            vec2 v1=vec2(lrd*t, p.y);
            vec2 v2=vec2(lrd*pt, ph);
            vec2 dv=vec2(h-v2.y,v2.x-v1.x);
            float inter=dot(v2-v0,dv)/dot(v1-v0,dv);
            p=mix(prevp,p,inter);

            // Re-evaluate the lava height using the refined intersection point.
            lavaHeight=evalLavaHeight(p.xz);
            break;
        }
        prevp=p;
        ph=h;
    }

    vec3 norm=heightFieldNormal(p.xz);
    
    // Base colour for the rocks.
    float f0=sqrt(fbm(p.xz*0.5));
    vec3 diffuse=mix(vec3(0.1,0.2,0.1)*0.5,mix(vec3(0.1),vec3(1.0,0.8,0.6)*0.3,f0),max(0.0,norm.y))*mix(0.7,0.2,p.y)*mix(0.3,1.0,fbm(p.xz*3.0));

#if NEW_LAVA
    return lava(norm, lavaHeight, p, f0, coord, time, moveSpeed, diffuse, ro);
#else
    // Cheating by simply adding light from the lava into the diffuse albedo.
    diffuse+=vec3(1.0,0.35,0.04)*clamp((1.0-norm.y)*0.1+pow(max(0.0,(1.0-abs(lavaHeight-p.y)*4.0)),2.0),0.0,1.0)*0.4;
    diffuse=mix(1.5*vec3(1.0,0.35,0.04),diffuse,clamp((p.y-lavaHeight)*16.0,0.0,1.0));
    
#if ADD_HEAT_GLOW
    vec3 glow=smoothstep(0.0,3.0,p.z+time*moveSpeed)*max(0.0,1.0-p.y*1.5)*pow(3.0*vec3(0.4,0.21,0.1)*(0.6*fbm(p.xz+vec2(time*0.5,0.0))+0.6*fbm(p.xz+vec2(-time*0.5,0.0))),vec3(3.0));
#else
    vec3 glow=vec3(0.0);
#endif
    
    // Some small bright bits for fake embers to suggest fire.
#if MOTIONBLUR_EMBERS
    vec3 embers=vec3(0.0);
    for(int j=0;j<8;j+=1)
    {
        float mb_time=time+float(j)*6e-2/8.0;
	    embers+=vec3(1.0,0.35,0.04)*smoothstep(0.77+sin(mb_time*20.0)*0.01+sin(mb_time)*0.01,1.0,fbm(coord*10.0+vec2(cos(coord.y*0.8+mb_time*0.7)*10.0,mb_time*4.0)));
    	embers+=vec3(1.0,0.35,0.04)*smoothstep(0.77+sin(mb_time*22.0)*0.01+sin(mb_time*1.2)*0.01,1.0,fbm(vec2(100.0)+coord*8.0+vec2(mb_time*8.0+cos(coord.y*0.3+mb_time*0.3)*10.0,mb_time*7.0)));
    }
    embers/=8.0*0.5;
#else
    vec3 embers=vec3(1.0,0.35,0.04)*smoothstep(0.77+sin(time*20.0)*0.01+sin(time)*0.01,1.0,fbm(coord*10.0+vec2(cos(coord.y*0.8+time*0.7)*10.0,time*4.0)));
    embers+=vec3(1.0,0.35,0.04)*smoothstep(0.77+sin(time*22.0)*0.01+sin(time*1.2)*0.01,1.0,fbm(vec2(100.0)+coord*8.0+vec2(time*8.0+cos(coord.y*0.3+time*0.3)*10.0,time*7.0)));
#endif
    
     return diffuse*(0.5+0.5*norm.x)*2.5+vec3(1.0,0.35,0.04)*0.02+embers+glow;
#endif
}

void main(void)
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    uv = (uv - vec2(0.5)) * 2.0;
    uv.x *= resolution.x / resolution.y;
    
    gl_FragColor.rgb=_sample(uv+vec2(cos(smoothNoise2(vec2(-time*10.0+uv.y*10.0,uv.x)))*0.01,0.0));
   // gl_FragColor.rgb= tonemap(fragColor.rgb)*1.2;
    
}













