#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


const float width=.22;
const float scale=5.;
const float detail=.002;

float DERRect(in vec3 z, vec4 radii){return length(max(abs(z)-radii.xyz,0.0))-radii.w;}

float DERect(in vec2 z, vec2 r){return max(abs(z.x)-r.x,abs(z.y)-r.y);}

float DEEiffie(in vec3 z){
	float d1=DERect(z.yz,vec2(0.25,0.9));//I
	float d2=min(DERect(z.xz,vec2(0.25,0.9)),min(DERect(z.xz+vec2(0.25,0.7),vec2(0.5,0.2)),DERect(z.xz+vec2(0.25,0.0),vec2(0.5,0.2))));//F
	float d3=min(DERect(z.xy,vec2(0.25,0.9)),min(DERect(z.xy+vec2(0.25,0.7),vec2(0.5,0.2)),min(DERect(z.xy+vec2(0.25,0.0),vec2(0.5,0.2)),DERect(z.xy+vec2(0.25,-0.7),vec2(0.5,0.2)))));//E
	return min(d1,min(d2,d3));
}


float DE(vec3 p){
	float t=0.4;
	float dotp=dot(p,p);
	p=p/dotp*scale;
	p=sin(p+vec3(sin(1.+t)*2.,-t,-t*2.));
	float d=length(p.yz)-width;
	d=min(d,length(p.xz)-width);
	d=min(d,length(p.xy)-width);
	d=min(d,length(p*p*p)-width*.3);
	return d*dotp/scale;
}

float map(vec3 z){
	float d =  max(DERRect(z,vec4(0.95,0.95,0.95,0.05)),-DEEiffie(z));
	return min(DE(z),d);
}

vec3 normal(vec3 pos, float normalDistance) {
	normalDistance = max(normalDistance*0.5, 1.0e-7);
	vec3 e = vec3(0.0,normalDistance,0.0);
	vec3 n = vec3(map(pos+e.yxx)-map(pos-e.yxx),
		map(pos+e.xyx)-map(pos-e.xyx),
		map(pos+e.xxy)-map(pos-e.xxy));
	n = normalize(n);
	return n;
}

float trace(vec3 ro,vec3 rd) {
	
	const float maxd = 30.0;          
	const float precis = 0.001;       
	    float h = precis*2.0;
	    float t = 0.0;
		float res = -1.0;
	    for( int i=0; i<60; i++ )          
	    {
		if( h<precis||t>maxd ) break;
		    h = map( ro+rd*t );
		t += h;
	    }
	    if( t<maxd ) res = t;
	    return res;
	
}

vec3 lightdir=-vec3(.1,.5,1.);


float light(in vec3 p, in vec3 dir,float d) {
	vec3 ldir=normalize(lightdir);
	vec3 n=normal(p,detail);
	float sh=1.;
	float diff=max(0.,dot(ldir,-n))+.1*max(0.,dot(normalize(dir),-n));
	vec3 r = reflect(ldir,n);
	float spec=max(0.,dot(dir,-r))*sh;
	return diff+pow(spec,20.)*.1;	
		
}

mat3 lookAtMatrix( in vec3 ro, in vec3 ta, in float roll )
{
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    return mat3( uu, vv, ww );
}


void camPath( out vec3 camPos, out vec3 camTar, in float time)
{
    float an = 0.2*time;
    camPos = vec3(1.5*sin(an),1.0,3.5*cos(an));
    camTar = vec3(0.0,0.0,0.0);
}

void main( void ) {
	
	vec2 uv = gl_FragCoord.xy / resolution.xy*2.-1.;
	uv.y*=resolution.y/resolution.x;

 
	float col ;
	vec3 ro , ta;
	
	camPath(ro,ta, time);
	
	mat3 camMat = lookAtMatrix( ro, ta, 0.0 ); 
	
	vec3 rd = normalize(camMat * vec3(uv.xy,1.0));
	vec3 hit, hitNormal;
	float t = trace( ro, rd );
	
	
	vec3 p=ro+t*rd;
	
	
	if (t>detail) {
		col=light(p-detail*rd, rd,t); 
	} else { 
		col=0.;
	}
	
    	vec3 final = vec3(col);
	
	gl_FragColor = vec4(final,1.0);
	
	

}