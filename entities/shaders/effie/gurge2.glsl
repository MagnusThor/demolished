#version 300 es
#ifdef GL_ES
precision highp float;
precision highp int;
precision mediump sampler3D;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D fft;

const float width=.22;
const float scale=5.;
const float detail=.002;

out vec4 fragColor;

const mat2 m2 = mat2( 0.80, -0.60, 0.60, 0.80 );
float hash( float n ) {
    return fract(sin(n)*43758.5453123);
}
float noise( in vec2 x ) {
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*157.0;
    return mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
               mix( hash(n+157.0), hash(n+158.0),f.x),f.y);
}
vec3 hash3( float n )
{
    return fract(sin(vec3(n,n+1.0,n+2.0))*vec3(43758.5453123,22578.1459123,19642.3490423));
}
float fbm( vec2 p ) {
    float f = 0.0;
    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );
        return f/0.9375;
}

float DERRect(in vec3 z, vec4 radii){return length(max(abs(z)-radii.xyz,0.0))-radii.w;}

float DERect(in vec2 z, vec2 r){return max(abs(z.x)-r.x,abs(z.y)-r.y);}

float DEEiffie(in vec3 z){
	float d1=DERect(z.yz,vec2(0.25,0.9));//I
	float d2=min(DERect(z.xz,vec2(0.25,0.9)),min(DERect(z.xz+vec2(0.25,0.7),vec2(0.5,0.2)),DERect(z.xz+vec2(0.25,0.0),vec2(0.5,0.2))));//F
	float d3=min(DERect(z.xy,vec2(0.25,0.9)),min(DERect(z.xy+vec2(0.25,0.7),vec2(0.5,0.2)),min(DERect(z.xy+vec2(0.25,0.0),vec2(0.5,0.2)),DERect(z.xy+vec2(0.25,-0.7),vec2(0.5,0.2)))));//E
	return min(d1,min(d2,d3));
}

float DE(in vec3 z){
	return max(DERRect(z,vec4(0.95,0.95,0.95,0.05)),-DEEiffie(z));
}

float DE2(vec3 p){
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


float sinNoise3d(in vec3 p){
	float s=0.5,r=0.0;
	for(int i=0;i<3;i++){
		p+=p+sin(p.yzx*0.8+sin(p.zxy*0.9));
		s*=0.5;
		r+=sin(p.z+1.5*sin(p.y+1.3*sin(p.x)))*s;
	}
	return r;
}
float volLiteMask(vec3 rd){
	vec3 ar=abs(rd);
	vec2 pt;
	float d=200.0;
	if(ar.x>ar.y && ar.x>ar.z)pt=rd.yz/ar.x;
	else{
		if(ar.y>ar.z)pt=rd.xz/ar.y;
		else {
			pt=rd.xy/ar.z;
			d=DE2(rd);//,vec2(0.5,0.2));
		}
		d=min(d,min(DERect(pt+vec2(0.25,0.7),vec2(0.5,0.2)),DERect(pt+vec2(0.25,0.0),vec2(0.5,0.2))));
	}
	d=min(d,DERect(pt,vec2(0.25,0.9)));
	return (d<0.0)?1.0:0.0;
}
float rand(vec2 c){return fract(sin(c.x+2.4*sin(c.y))*34.1234);}
mat3 lookat(vec3 fw){
	fw=normalize(fw);vec3 rt=normalize(cross(-fw,vec3(0.0,1.0,0.0)));return mat3(rt,cross(rt,fw),fw);
}
vec4 scene(vec3 ro, vec3 rd) {
	float t=0.0,d=0.0;
	for(int i=0;i<48;i++){
		t+=d=DE2(ro+rd*t);
		if(t>10.0 || d<0.01)break;
	}
	float lt=pow(dot(rd,normalize(-ro)),10.0);
	float t2=0.2*rand(gl_FragCoord.xy);
	vec3 sum=vec3(0.0);
	for(int i=0;i<48;i++){
		t2+=0.2+t2*t2*0.01;
		//if((t2>t && d<0.2) || t2>100.0)break;
        if(t2>t && d<0.2)break;
        t2=min(t2,10.0);
        //t2 = sin(time*0.02);
        if(t2>9.0)t2-=0.75+0.25*sin(float(i*2));
		vec3 vr=normalize(ro+rd*t2);
		if(vr==vr)sum+=(vr*0.5+0.5)*volLiteMask(vr)*(0.1+0.2*sinNoise3d((ro+rd*t2)));
	}
	vec3 col=clamp(lt*sum,0.0,4.0);
	return vec4(col,t);
}



vec3 snoise3( in float x )
{
    float p = floor(x);
    float f = fract(x);

    f = f*f*(3.0-2.0*f);

    return -1.0 + 2.0*mix( hash3(p+0.0), hash3(p+1.0), f );
}

float freqs[16];

vec3 distanceLines( vec3 a, vec3 b, vec3 o, vec3 d )
{
	vec3 ba = b - a;
	vec3 oa = o - a;
	
	float oad  = dot( oa,  d );
	float dba  = dot(  d, ba );
	float baba = dot( ba, ba );
	float oaba = dot( oa, ba );
	
	vec2 th = vec2( -oad*baba + dba*oaba, oaba - oad*dba ) / (baba - dba*dba);
	
	th.x = max(   th.x, 0.0 );
	th.y = clamp( th.y, 0.0, 1.0 );
	
	vec3 p = a + ba*th.y;
	vec3 q = o + d*th.x;
	
	return vec3( length( p-q ), th );
}




vec3 castRay( vec3 ro, vec3 rd, float linesSpeed )
{
	vec3 col = vec3(0.0);
	
		
	float mindist = 10000.0;
	vec3 p = vec3(0.2);
	float h = 0.0;
	float rad = 0.04 + 0.15*freqs[0];
	float mint = 0.0;
    for( int i=0; i<128; i++ )
	{
		vec3 op = p;
		
		op = p;
		p  = 1.25*1.0*normalize(snoise3( 64.0*h + linesSpeed*0.015*time ));
		
		vec3 dis = distanceLines( op, p, ro, rd );
		
		vec3 lcol = 0.6 + 0.4*sin( 10.0*6.2831*h + vec3(0.0,0.6,0.9) );
		
		float m = pow( texture( fft, vec2(h*0.5,0.25) ).x, 2.0 )*(1.0+2.0*h);
		
		float f = 1.0 - 4.0*dis.z*(1.0-dis.z);
		float width = 1240.0 - 1000.0*f;
		width *= 0.25;
		float ff = 1.0*exp(-0.06*dis.y*dis.y*dis.y);
		ff *= m;
		col += 0.3*lcol*exp( -0.3*width*dis.x*dis.x )*ff;
		col += 0.5*lcol*exp( -8.0*width*dis.x*dis.x )*ff;
		h += 1.0/128.0;
	}


    return col;
}


vec3 clouds(vec2 st){
	
	
	vec3 color = vec3(0);
	
	vec2 q = vec2(0.);
	q.x = fbm( st + 0.00*time);
	q.y = fbm( st + vec2(1.0));
	
	vec2 r = vec2(0.);
	r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.25*time );
	r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.126*time);
	
	float f = fbm(st+r);
	
	color = mix(vec3(0.101961,0.619608,0.666667),
		vec3(0.666667,0.666667,0.498039),
		clamp((f*f)*4.0,0.0,1.0));
	
	color = mix(color,
		vec3(0,0,0.164706),
		clamp(length(q),0.0,1.0));
	
	color = mix(color,
		vec3(0.666667,1,1),
		clamp(length(r.x),0.0,1.0));
	
	return color;
}



vec3 postprocess(vec2 uv,vec3 col){
return col;   
	col.gb *=  uv.y * .6; 
	col.g = 0.0+0.6*smoothstep(-0.1,0.9,col.g*2.0);
	col = 0.001+pow(col, vec3(1.2))*1.5;
	//col = clamp(1.06*col-0.03, 0., 1.);   
    col *= mod(gl_FragCoord.y, 4.0)<2.0 ? 0.6 : 1.0;

	return col;
}





void main()
{
    vec2 uv = (2.0*gl_FragCoord.xy-resolution.xy)/min(resolution.y,resolution.x);


	vec2 q = gl_FragCoord.xy/resolution.xy;
    	vec2 p = -1.0+2.0*q;
	p.x *= resolution.x/resolution.y;
    
    
	if (q.y < .12 || q.y >= .88) {
		fragColor=vec4(0.,0.,0.,1.);
		return;
	}
		
	float time = time;
    float datetime = time;

	for( int i=0; i<16; i++ ){
        vec4 aa = texture( fft, vec2( 0.05 + 0.5*float(i)/16.0, 0.25));
        freqs[i] = clamp( 1.9*pow( aa.x, 3.0 ), 0.0, 1.0 );
        
    }	vec3 ta = vec3( 0.0, 0.0, 0.0 );

	float isFast = smoothstep( 35.8, 35.81, time);
	isFast  -= smoothstep( 61.8, 61.81, time );
	isFast  += smoothstep( 78.0, 78.01,time );
	isFast  -= smoothstep(103.0,103.01, time );
	isFast  += smoothstep(140.0,140.01, datetime);
	isFast  -= smoothstep(204.0,204.01, datetime);
	
    float camSpeed = 1.0 + 40.0*isFast;	


	float beat = floor( max((datetime-35.7+0.4)/0.81,0.0) );
	time += beat*9.512*isFast;
	camSpeed *= mix( 1.0, sign(sin( beat*1.0 )), isFast );

	
float linesSpeed =  smoothstep( 22.7, 22.71, datetime);	
	  linesSpeed -= smoothstep( 61.8, 61.81, datetime );
	  linesSpeed += smoothstep( 78.0, 78.01, datetime );
	  linesSpeed -= smoothstep(140.0,140.01, datetime );

	
	ta  = 0.2*vec3( cos(0.1*time), 0.0*sin(0.1*time), sin(0.07*time) );

	vec3 ro = vec3( 1.0*cos(camSpeed*0.05*time+6.28), 0.0, 1.0*sin(camSpeed*0.05*time+6.2831) );
	float roll = 0.25*sin(camSpeed*0.01*time);
	
	// camera tx
	vec3 cw = normalize( ta-ro );
	vec3 cp = vec3( sin(roll), cos(roll),0.0 );
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
	vec3 rd = normalize( p.x*cu + p.y*cv + 1.2*cw );

	float curve  = smoothstep( 61.8, 71.0, datetime );
	      curve -= smoothstep(103.0,113.0, datetime );
    rd.xy += curve*0.025*vec2( sin(34.0*q.y), cos(34.0*q.x) );
	rd = normalize(rd);
	
	
	ro *= 1.0 - linesSpeed*0.5*freqs[1];
    vec3 col = castRay( ro, rd, 1.0 + 20.0*linesSpeed );
    col = col*col*2.4;
	
    

    if(datetime < 10.5) 
        col += clouds(p);
    
 
   
    
    
    
    float tt = mod(time-0.04*uv.x+0.01*uv.y,1.5)/1.5;
    float ss = beat;// pow(tt,.2)*0.5 + 0.5;
	
    ss = 1.0 + ss*0.5*sin(tt*6.2831*3.0 + uv.y*0.5)*exp(-tt*4.0);
    uv *= vec2(0.5,1.5) + ss*vec2(0.5,-0.5);

    uv *=  0.8 ;
    uv.y = -0.1 - uv.y*1.2 + abs(uv.x)*(1.0-abs(uv.x)) ;
	
   
    float r = length(uv);
	float d = 0.5;
    
	float s = 0.75 + 0.75*uv.x;
	s *= 1.0-0.4*r;
	s = 0.3 + 0.7*s;
	s *= 0.5+0.5*pow( 1.0-clamp(r/d, 0.0, 1.0 ), 0.1 );
	vec3 heart = vec3(1.0,0.5*r,0.3)*s;
    col =  mix( col, heart, smoothstep( -0.01, 0.01, d-r) );
    col *= 0.15+0.85*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.15 );
    
    
    
    if(datetime > 20.05){
        vec4 scn=scene(ro,rd);
        fragColor = scn;
        
    }else{
         vec3 final = postprocess(q,col);
   
         fragColor=vec4( final, 1.0 );
    }
       
}
    
    






