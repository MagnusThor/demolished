uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D iChannel0;

vec3 mcol=vec3(0.);

float randSeed;
void randomize(vec2 c){randSeed=fract(sin(dot(c,vec2(113.421,17.329)))*3134.1234);}
float rand(){return fract(sin(randSeed++)*3143.45345);}

//vec3 lightdir=normalize(vec3(.1,-.15,-1.));
//const vec3 origin=vec3(-1.,.2,0.);

float DE(vec3 p){
	const vec3 CSize=vec3(.63248,.78632,.875);
	float DEfactor=1.;
	for(int i=0;i<5;i++){
		p=2.*clamp(p,-CSize,CSize)-p;
		float k=max(.70968/dot(p,p),1.);
		p*=k;DEfactor*=k;
	}
	if(mcol.r>=0.)mcol+=abs(p);
	float rxy=length(p.xy);
	return max(rxy-.92784,abs(rxy*p.z)/length(p))/DEfactor;
}

float map(vec3 p){
	return DE(p);
}

vec3 normal(in vec3 p){
	//    vec2 e = vec2(0.005, -0.005);
	vec2 e=vec2(1.,-1.)*.5773*.0005;
	return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));
}

vec3 calcNormal(in vec3 pos){
	return normal(pos);
}
// float shadow(in vec3 ro,in vec3 rd){
// 	float res=.0;
// 	float t=.05;
// 	float h;
// 	for(int i=0;i<4;i++)
// 	{
// 		h=DE(ro+rd*t);
// 		res=min(6.*h/t,res);
// 		t+=h;
// 	}
// 	return max(res,0.);
// }

mat2 rot(float a){
	return mat2(cos(a),sin(a),-sin(a),cos(a));
}

// vec4 formula(vec4 p){
// 	p.xz=abs(p.xz+1.)-abs(p.xz-1.)-p.xz;
// 	p=p*2./clamp(dot(p.xyz,p.xyz),.15,1.)-vec4(.5,.5,.8,0.);
// 	p.xy*=rot(.5);
// 	return p;
// }

// vec2 colorize(vec3 p){
// 	p.z=abs(2.-mod(p.z,4.));
// 	float es,l=es=0.;
// 	float ot=1000.;
// 	for(int i=0;i<15;i++){
// 		p=formula(vec4(p,0.)).xyz;
// 		float pl=l;
// 		l=length(p);
// 		es+=exp(-10./abs(l-pl));
// 		ot=min(ot,abs(l-3.));
// 	}
// 	return vec2(es,ot);
// }

mat3 calcLookAtMatrix(in vec3 ro,in vec3 ta,in float roll)
{
	vec3 ww=normalize(ta-ro);
	vec3 uu=normalize(cross(ww,vec3(sin(roll),cos(roll),0.)));
	vec3 vv=normalize(cross(uu,ww));
	return mat3(uu,vv,ww);
}
void doCamera(out vec3 camPos,out vec3 camTar,in float time)
{
	float an=.3*time+10.;
	camPos=vec3(2.772*sin(an),.424,.820*cos(an));
	camTar=vec3(1.,.000,-.03);
}
float calcIntersection(in vec3 ro,in vec3 rd)
{
	const float maxd=20.;
	const float precis=.001;
	float h=precis*2.;
	float t=0.;
	float res=-1.;
	for(int i=0;i<128;i++){
		if(h<precis||t>maxd)break;
		h=map(ro+rd*t);
		t+=h;
	}
	if(t<maxd)res=t;
	return res;
}

vec3 path(float t){
	return vec3(cos(t),sin(t),-.65+abs(sin(t*.7))*.25)*(2.+sin(t*1.7)*.5)+vec3(0.,0.,1.);
}

vec3 post(vec3 rgb){
	return rgb;
}

vec4 scene(vec3 ro,vec3 rd,float slider,float time,float pxl){
	
	randomize(gl_FragCoord.xy+time);
	
	vec3 LP=path(time+1.),p;
	LP.z+=slider;
	ro.z-=slider;
	
	float d=map(ro)*.8,t=d*rand(),nt=d,od=1.,ft=0.;
	
	vec4 col=vec4(0.,0.,0.,1.);
	
	vec4 am,tm=vec4(-1.);
	
	for(int i=0;i<99;i++){
		
		if(nt>t+ft){
			p=ro+rd*(t+ft);
			p+=(LP-p)*(-p.z)/(LP.z-p.z);		
		}else{
			p=ro+rd*t;
		}
		
		d=map(p);
		
		if(nt>t+ft){
			float dL=.05*length(ro+rd*(t+ft)-LP);
			
			col.rgb+=col.a*vec3(1.,1.,.7)*exp(-dL*40.)*smoothstep(0.,.01,d);
			
			if(t+ft+dL>nt){
				ft=0.;
				t=nt;
				if(t>20.)break;
			}else ft+=dL;
		}else{
			if(d<od&&tm.w<0.){
				float alpha=clamp(d/(pxl*t),0.,1.);
				if(alpha<.95){
					am=vec4(alpha,am.xyz);tm=vec4(t,tm.xyz);
					col.a*=alpha;
				}
			}
			od=d;
			nt=t+d*(.6+.2*rand());
		}
	}
	
	vec3 tcol=vec3(0.);
	
	for(int i=0;i<4;i++){
		
		if(tm.x<0.)continue;

		mcol=vec3(0.);

		p=ro+rd*tm.x;
		
		vec3 N=normal(p),L=LP-p;
		
		vec3 scol;
		
		mcol=sin(mcol)*.3+vec3(.8,.6,.4);
		float ls=exp(-dot(L,L)*.2);
		p+=L*(-p.z)/L.z;
		
		L=normalize(L);
		
		scol=ls*mcol*max(0.,dot(N,L));
		
		float v=max(0.,dot(N,-rd));
		
		scol+=exp(-t)*mcol*v;
		d=smoothstep(0.,.005,map(p));
		scol+=ls*vec3(2.,2.,1.7)*max(0.,dot(N,L))*d;
		
		if(rd.z<0.&&d>0.)scol+=ls*vec3(4.,3.,1.4)*pow(max(0.,dot(reflect(rd,N),L)),5.)*(1.-.25*v)*d;
		
		tcol=mix(scol,tcol,am.x);
		
		am=am.yzwx;
		tm=tm.yzwx;
	}
	
	col.rgb=clamp(col.rgb+tcol,0.,1.);
	
	return vec4(post(col.rgb),t);

}

out vec4 fragColor;

void main(void){
	
	float tm;
	float glow,eglow,totdist=glow=.3;
	vec2 p=(gl_FragCoord.xy/resolution.xy)+mouse/4.;
	
	vec3 ro,ta;
	doCamera(ro,ta,time*.1);
	
	tm=mod(time,18.85);
	
	mat3 camMat=calcLookAtMatrix(ro,ta,0.);
	
	vec3 rd=normalize(camMat*vec3(p.xy,1.5+2.));
	
	vec4 final=scene(ro,rd,.3,tm*.12,3./resolution.y);
	
	fragColor=final;
	
}

