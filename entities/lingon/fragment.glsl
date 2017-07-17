#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


vec2 hash22(vec2 p) { 

    float n = sin(dot(p, vec2(41, 289)));
    return fract(vec2(262144, 32768)*n); 
    
   
}

float Voronoi(vec2 p)
{	
    vec2 ip = floor(p); 
    p = fract(p); 
   
    float d = 1.;
    for (float i = -1.; i < 1.1; i++){
	    for (float j = -1.; j < 1.1; j++){
	    
     	    vec2 cellRef = vec2(i, j); 
            
            vec2 offset = hash22(ip + cellRef); 
            vec2 r = cellRef + offset - p; 
            float d2 = dot(r, r); 
            
            d = min(d, d2); 
        }
    }
	return d;
}
    




void main(){

   vec2 uv = ( gl_FragCoord.xy * 2.0 -  resolution) / min(resolution.x, resolution.y);

   float t = time, s, a, b, e;
    
    
    float th = sin(time*0.1)*sin(time*0.13)*4.;
    float cs = cos(th), si = sin(th);
    uv *= mat2(cs, -si, si, cs);


    vec3 sp = vec3(uv, 0); 
    vec3 ro = vec3(0, 0, -1); 
    vec3 rd = normalize(sp-ro); 
    vec3 lp = vec3(cos(time)*0.375, sin(time)*0.1, -1.);
 
    const float L = 8.;
    const float gFreq = 0.5;
    float sum = 0.; 
    
    
    th = 3.14159265*0.7071/L;
    cs = cos(th), si = sin(th);
    mat2 M = mat2(cs, -si, si, cs);
    
    
    vec3 col = vec3(0);
    
    
    float f=0., fx=0., fy=0.;
    vec2 eps = vec2(4./resolution.y, 0.);
    
    vec2 offs = vec2(0.1);
    
    
   for (float i = 0.; i<L; i++){
		s = fract((i - t*2.)/L);
        e = exp2(s*L)*gFreq; 
        
        a = (1.-cos(s*6.283))/e;  
        f += Voronoi(M*sp.xy*e + offs) * a; // Sample value multiplied by the amplitude.
        fx += Voronoi(M*(sp.xy-eps.xy)*e + offs) * a; // Same for the nearby sample in the X-direction.
        fy += Voronoi(M*(sp.xy-eps.yx)*e + offs) * a; // Same for the nearby sample in the Y-direction.
        
        sum += a;
        
        M *= M;

	}
    
    sum = max(sum, 0.001);
    
    f /= sum;
    fx /= sum;
    fy /= sum;
   
 
    float bumpFactor = 0.2;
    fx = (fx-f)/eps.x; // Change in X
    fy = (fy-f)/eps.x; // Change in Y.
    vec3 n = normalize( vec3(0, 0, -1) + vec3(fx, fy, 0)*bumpFactor );           
   
    
    
   	vec3 ld = lp - sp;
	float lDist = max(length(ld), 0.001);
	ld /= lDist;
    
    

    float atten = 1.25/(1. + lDist*0.15 + lDist*lDist*0.15);
	

	float diff = max(dot(n, ld), 0.);  
    diff = pow(diff, 2.)*0.66 + pow(diff, 4.)*0.34; 
    float spec = pow(max(dot( reflect(-ld, n), -rd), 0.), 16.); 


      vec3 objCol = vec3(f*f, pow(f, 16.), pow(f, 8.)*.5);
    

    col = (objCol * (diff + .5) + vec3(.4, .6, 1.)*spec*1.5) * atten;


    // Done. 
	gl_FragColor = vec4(sqrt(min(col, 1.)), 1.);
}