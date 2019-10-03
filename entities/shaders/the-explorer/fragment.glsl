out vec4 fragColor;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D iChannel0;

// ***********************************************************
// Alcatraz / The explorer 4k Intro
// by Jochen "Virgill" Feldkötter
//
// 4kb executable: http://www.pouet.net/prod.php?which=75741
//
// ***********************************************************

// use mouse for light direction
//#define mouse    

int scene = 0;

// 0 = empty				color:			particles: off 
// 1 = falling objects		color:red		particles: off 
// 2 = wobble floor			color:red		particles: on
// 3 = room with stone		color:blue		particles: on
// 4 = kleinian fractal		color:red		particles: on	
// 5 = wtf scene		 	color:blue		particles: off

int scene_idx,lightscene_idx;	// init   // empty                   // falling objects        // wobble floor           // room with stone        // kleinian fractal       // wtf scene 
float lightscenesx[37] = float[37] (2.3,  2.3,0.0,0.0,6.9,4.6,2.3,   0.0,3.0,0.0,4.0,7.5,3.4,  8.0,8.5,5.0,5.0,5.0,5.0,  0.0,8.5,5.0,5.0,8.0,8.5,  8.5,8.5,4.2,5.0,4.0,4.3,  6.9,8.0,2.0,2.5,3.6,4.6);
float lightscenesy[37] = float[37] (0.0,  0.0,2.3,0.0,0.0,2.3,0.0,   2.0,1.0,1.0,3.0,0.0,0.5,  0.0,0.0,3.0,3.0,4.0,3.0,  0.8,1.0,5.0,3.5,0.0,1.0,  8.0,7.5,1.5,3.5,1.5,2.5,  0.0,0.0,0.0,0.0,0.0,0.0);
float lightduration = 4.; 
float sceneduration = 24.; 
vec2  lightscene,lightscene_old,lightscene_interpolated;
vec3 lightpos;
vec3 lightdir = vec3(0,0,1);
float scatter,test;

// noise
float rnd(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.98,78.23))) * 43758.54);
}

// box sdf
float sdBox(vec3 p,vec3 b)
{
  vec3 d = abs(p)-b;
  return min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.));
}

// 3D noise function (shane)
float noise(vec3 p)
{
	vec3 ip = floor(p);
    p -= ip; 
    vec3 s = vec3(7,157,113);
    vec4 h = vec4(0.,s.yz,s.y+s.z)+dot(ip,s);
    p = p*p*(3.-2.*p); 
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
    h.xy = mix(h.xz,h.yw,p.y);
    return mix(h.x,h.y,p.z); 
}

// cone sdf
float sdCone( vec3 p, vec2 c )
{
    return dot(c,vec2(length(p.xy),p.z));
}


// rotation
void pR(inout vec2 p,float a) 
{
	p = cos(a)*p+sin(a)*vec2(p.y,-p.x);
}


// wtf fractal (shane)
const float md = .6;
const float fl = 1.;
float mapy(vec3 p) 
{
	p.x = mod(p.x+1.,2.) - 1.0;
	vec4 q = vec4(p,1.);
	vec4 o = q;
	
for(int i = 0; i < 10; i++) {
		pR(q.yz,1.55);
		q.xyz = clamp(q.xyz, -fl, fl)*2. - q.xyz;
		float r = dot(q.xyz, q.xyz);
		q *= clamp(max(md/r, .6), 0.0, 1.);
		q = (3./md)*q-o;

	}

	return (length(q.xyz))/q.w-0.005;
}
///////////////////////////////////////////////////////////////////////////////////////

float map(vec3 p, int vol) 
{
    float d = 1.;
	vec3 r = p;
 
// sphere ship
    float ship = length(r-lightpos)-0.1; 

// cone light
	vec3 schein=(r-lightpos);
#ifdef mouse
    pR(schein.zx,iMouse.x*-0.03);
    pR(schein.yz,iMouse.y*0.03);
#else
    pR(schein.zx,-lightscene_interpolated.y);
    pR(schein.yz,lightscene_interpolated.x); 
#endif    
	float s= sdCone(schein,normalize(vec2(1,1)))/length(schein*schein)+0.2*noise(10.*p+2.*sin(.2*time))+0.1*noise(p*23.+sin(0.3*time))+0.2*rnd(p.xy);
	scatter += max(-s,0.)*0.07;
     

// scene: falling objects
	if (scene==1)
	{
        vec3 c= vec3(1.5);
        p.y+=.4*time;
        vec3 q = mod(p,c)-.5*c;

        d=max(length(q)-0.1,p.z-3.);
        d-=.2*noise(6.*p)+0.005*noise(80.*p);
        d=min(d,p.z+4.);
    } 
    
// scene: wobble floor
    if (scene==2)
    {
    	d=p.y-0.01*noise(50.*p)+0.4*noise(2.*p+0.2*time)+0.09*noise(7.*p);
    }
   
// scene: room with stone	d = p.y-log(1.*pow(length(p.xz),1.)+0.2);
		d = min(d,length(p)-0.4-0.04*noise(p*70.)-0.5*noise(p*4.+time)-0.02*noise(p*114.+time));
		d +=0.05*noise(p*10.)-0.009*noise(p*-40.)+noise(p*2.);;
	if (scene==3)
    {
	
	}    
    
// scene: kleinian fractal
    if (scene==4)
    {
		vec4 q = vec4(p,1.);
		q*=.5;
        q.x +=.5;
		q.z+=1.;
		for(int i=0;i<8;i++) 
    	{
			q.xyz=-1.+2.*fract(.5+.5*q.xyz);
			q=1.3*q/max(dot(q.xyz,q.xyz),.1);
		}
		d=max(0.9*abs(q.y)/q.w,length(p)-3.5)-0.002*noise(50.*p); // with bounding circle
 		test =1.-1./(q.w);//	highlight fractal area
    }
    
     
// scene: wtf
	if (scene==5)
	{
        p.z+=3.5;
        p.y-=0.1*(time-120.);
        p.z-=0.1*(time-120.);
            d = .5*mapy(p);
    }   

    return min(ship,d);
}



//***************************************************************************************************
// normal calculation
//***************************************************************************************************

vec3 calcNormal(vec3 pos)
{
    float eps = 0.002, d = map(pos,0);
    if (scene==4) eps = 0.2;
    if (scene==5) eps = 0.02;
	return normalize(vec3(map(pos+vec3(eps,0,0),0)-d,map(pos+vec3(0,eps,0),0)-d,map(pos+vec3(0,0,eps),0)-d));
}



// ray marching loop (added noise to make it noisy)
float castRay(in vec3 ro, in vec3 rd, in float maxt, in vec2 co) {
    float precis = 0.001;
    float h = precis * 2.0;
    float t = -3.5+rnd(co+0.01*time)*7.;
    for(int i = 0; i < 200; i++) 
    {
    	if(abs(h) < precis || t > maxt) continue;
        h = map(ro+rd*t,1);
        t += 0.25*h;
    }
    return t;
    

}



//***************************************************************************************************
// Main
//***************************************************************************************************

void main() 
{

// scene handling   
   	lightscene_idx 	= int(floor((time+.8)/lightduration));
    scene 			= int(floor(time/sceneduration));
   	lightscene 		= vec2(lightscenesx[lightscene_idx+1],lightscenesy[lightscene_idx+1]);     
   	lightscene_old	= vec2(lightscenesx[lightscene_idx],lightscenesy[lightscene_idx]);     
	lightscene_interpolated = mix(lightscene,lightscene_old, exp(-64.*pow(fract((time+.8)/lightduration),4.)))*0.7;

	// camera setup (iq)   
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= resolution.x / resolution.y;
    float theta = time * 3.141592 * 0.20;
    float x = 5.0 * cos(theta*0.5);
    float z = 5.0 * sin(theta*0.5);
    
    vec3 ro = vec3(0.5*x, 4.0, 5.3);
    if (scene==5||scene==0) ro = vec3(0.0, 8.0, -0.0001);  
    
    vec3 ta = vec3(0.0, 0.25, 0.0);
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(0.0, 1.0, 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv = normalize(cross(cu, cw));
    vec3 rd = normalize(p.x * cu + p.y * cv + 7.5 * cw);

    float ypos=0.8;
    if (scene==1||scene==3||scene==5) ypos=0.;
    
    lightpos = vec3(ypos,0.7 + 0.2 * sin(theta*2.0),1.-0.2*sin(0.2*time)); 
    if (scene==5||scene==0) lightpos = vec3(0,2,0); 
    
    
#ifdef mouse
    pR(lightdir.yz,iMouse.y*-0.03);
    pR(lightdir.zx,iMouse.x*0.03);
#else
    pR(lightdir.yz,-lightscene_interpolated.x);
    pR(lightdir.zx,lightscene_interpolated.y);
#endif    
    
// feedbak noise (with buffer a)
   	uv.x-=0.005*noise(uv.yxx*32.-time)-0.0025;
   	uv.y+=0.005*noise(uv.yxx*32.+time)-0.0025; 
    vec3 bufa= vec3(0); texture(iChannel0,uv).xyz;
    

 // render
    vec3 col = vec3(0);
   	float t= castRay(ro, rd, 15.0,uv);    
	float depth = clamp(t/5.-1.3,0.,1.);
	if (t>15.) t=-1000000.;
    vec3 pos = ro + rd * t;
    vec3 nor = calcNormal(pos);
    
    
// colors    
    vec3 basecol = vec3(2./1., 1./4., 1./16.);
    if (scene==3||scene==5) basecol = vec3(1./16., 1./4., 2./1.);
    
    
// treat light as conelight
    float ncol=0.;
    float cone=1.;
    vec3 L = normalize(lightpos - pos);				// vector to light position (from surcface)
    float NdotL = dot(nor,L);
    float conedot = dot(lightdir, normalize(L));
    float conecos = 0.7071;
    float cold = NdotL; 									// diffuse
    float cols = pow(clamp(dot(nor,normalize(L+normalize(ro - pos))), 0.0, 1.0), 60.0);	// specular  

    if (NdotL > 0.0 && conedot > conecos)  			// 45 degrees, corresponding to cone param (1,1)
    {        
         cone =  pow((conedot-conecos)/(1.-conecos),4.);// pow for cone light distribution
         ncol = (cold + cols) * cone;					// combine  
		 col+=clamp((test),0.,1.)*scatter*cone*vec3(0.2,0.05,0.);
    }    
  


    

// particles   
    float d;
    for (int i; i<36; i++)
    {
    	float fi =float(i);
    	vec2 pos = vec2(.5+.2*sin(fi+.5*time+ cos(.01*time*fi))+ .2*sin(-fi),  
                        .5+.2*cos(fi+.2*time+ sin(.02*time*fi)))+.2*cos( fi);
    	d += clamp(1.-(length(350.*(.8+.5*sin(fi*time))*(pos - uv))),0.,1.);
   	}
    if (scene==2||scene==3||scene==4) col+=d*ncol*(basecol+vec3(0,.5,0))*2.;

    
    
// color for light (+ feedback noise)
	col+=0.3*scatter*vec3(1.,0.8,.6)+0.6*bufa;
// color for material
    col+= 0.6*basecol*exp(6.*(-1.+ncol)); 
	

    
  float fade =min (3.*abs(sin((3.1415*time/sceneduration))),1.); 
 if (time>140.) fade=0.;
	fragColor = vec4(col*fade,depth);
}







