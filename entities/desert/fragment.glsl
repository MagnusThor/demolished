#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#extension GL_EXT_shader_texture_lod : enable
#ifdef GL_ES
precision highp float;
precision highp int;
#endif


uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform sampler2D fft;
uniform float bpm;
uniform float freq;


uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

float freqs[4];

vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }
vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }
	
float FAR;    


// Frequencies and amplitudes of the "path" function, used to shape the tunnel and guide the camera.
const float freqA = 0.15/3.75;
const float freqB = 0.25/2.75;
const float ampA = 20.0;
const float ampB = 4.0;

mat2 rot2( float th ){ vec2 a = sin(vec2(1.5707963, 0) + th); return mat2(a, -a.y, a.x); }

float hash( float n ){ return fract(cos(n)*45758.5453); }
float hash( vec3 p ){ return fract(sin(dot(p, vec3(7, 157, 113)))*45758.5453); }

float getGrey(vec3 p){ return dot(p, vec3(0.299, 0.587, 0.114)); }


float smaxP(float a, float b, float s){
    
    float h = clamp( 0.5 + 0.5*(a-b)/s, 0., 1.);
    return mix(b, a, h) + h*(1.0-h)*s;
}

vec2 path(in float z){ 
    return vec2(ampA*sin(z * freqA), ampB*cos(z * freqB) + 3.*(sin(z*0.025)  - 1.)); 
}

float map(in vec3 p){
    
    float tx = textureLod(iChannel0, p.xz/16. + p.xy/80., 0.0).x;
  
    vec3 q = p*0.25;
    float h = dot(sin(q)*cos(q.yzx), vec3(.222)) + dot(sin(q*1.5)*cos(q.yzx*1.5), vec3(.111));
    
    
    float d = p.y + h*6.;
  
    q = sin(p*0.5 + h);
    h = q.x*q.y*q.z;
      p.xy -= path(p.z);
    float tnl = 1.5 - length(p.xy*vec2(.33, .66)) + h + (1. - tx)*.25;
   return smaxP(d, tnl, 2.) - tx*.5 + tnl*.8; 

}



float logBisectTrace(in vec3 ro, in vec3 rd){


    float t = 0., told = 0., mid, dn;
    float d = map(rd*t + ro);
    float sgn = sign(d);

    for (int i=0; i<96; i++){
        if (sign(d) != sgn || d < 0.001 || t > FAR) break;
 
        told = t;
        
        t += step(d, 1.)*(log(abs(d) + 1.1) - d) + d;
        
        d = map(rd*t + ro);
    }
    if (sign(d) != sgn){
    

        dn = sign(map(rd*told + ro));
        
        vec2 iv = vec2(told, t); // Near, Far

        for (int ii=0; ii<8; ii++){ 
            mid = dot(iv, vec2(.5));
            float d = map(rd*mid + ro);
            if (abs(d) < 0.001)break;
            iv = mix(vec2(iv.x, mid), vec2(mid, iv.y), step(0.0, d*dn));
        }

        t = mid; 
        
    }
    
    //if (abs(d) < PRECISION) t += d;

    return min(t, FAR);
}


// Tetrahedral normal, courtesy of IQ.
vec3 normal(in vec3 p)
{  
    vec2 e = vec2(-1., 1.)*0.001;   
	return normalize(e.yxx*map(p + e.yxx) + e.xxy*map(p + e.xxy) + 
					 e.xyx*map(p + e.xyx) + e.yyy*map(p + e.yyy) );   
}


// Tri-Planar blending function. Based on an old Nvidia writeup:
// GPU Gems 3 - Ryan Geiss: http://http.developer.nvidia.com/GPUGems3/gpugems3_ch01.html
vec3 tex3D( sampler2D tex, in vec3 p, in vec3 n ){
   
    n = max(n*n, 0.001);
    n /= (n.x + n.y + n.z );  
    
	return (texture2D(tex, p.yz)*n.x + texture2D(tex, p.zx)*n.y + texture2D(tex, p.xy)*n.z).xyz;
}


vec3 doBumpMap( sampler2D tex, in vec3 p, in vec3 nor, float bumpfactor){
   
    const float eps = 0.001;
    vec3 grad = vec3( getGrey(tex3D(tex, vec3(p.x-eps, p.y, p.z), nor)),
                      getGrey(tex3D(tex, vec3(p.x, p.y-eps, p.z), nor)),
                      getGrey(tex3D(tex, vec3(p.x, p.y, p.z-eps), nor)));
    
    grad = (grad - getGrey(tex3D(tex,  p , nor)))/eps; 
            
    grad -= nor*dot(nor, grad);          
                      
    return normalize( nor + grad*bumpfactor );
	
}
float softShadow(in vec3 ro, in vec3 rd, in float start, in float end, in float k){

    float shade = 1.0;
    const int maxIterationsShad = 10; 

    float dist = start;
    float stepDist = end/float(maxIterationsShad);

    for (int i=0; i<maxIterationsShad; i++){
        float h = map(ro + rd*dist);
        shade = min(shade, smoothstep(0.0, 1.0, k*h/dist));
        dist += clamp(h, 0.2, stepDist*2.);
        
        if (abs(h)<0.001 || dist > end) break; 
    }
    return min(max(shade, 0.) + 0.1, 1.0); 
}

float calculate§( in vec3 p, in vec3 n, float maxDist )
{
	float ao = 0.0, l;
	const float nbIte = 6.0;
	//const float falloff = 0.9;
    for( float i=1.; i< nbIte+.5; i++ ){
    
        l = (i + hash(i))*.5/nbIte*maxDist;
        
        ao += (l - map( p + n*l ))/(1.+ l);
    }
	
    return clamp( 1.-ao/nbIte, 0., 1.);
}
float noise3D(in vec3 p){
    
	const vec3 s = vec3(7, 157, 113);
	
	vec3 ip = floor(p); 
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    
	p -= ip; 
	
    p = p*p*(3. - 2.*p);
    
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
	
    h.xy = mix(h.xz, h.yw, p.y);
    
    return mix(h.x, h.y, p.z); // Range: [0, 1].
	
}

float fbm(in vec3 p){    
    return 0.5333*noise3D( p ) + 0.2667*noise3D( p*2.02 ) + 0.1333*noise3D( p*4.03 ) + 0.0667*noise3D( p*8.03 );
}


vec3 getSky(in vec3 ro, in vec3 rd, vec3 sunDir){


	float sun = max(dot(rd, sunDir),(freq / 20.0)); // * (freqs[0] * 2.0);

	float horiz = pow(1.0-max(rd.y, 0.0), 1.)*(.15) ; 
	vec3 col = mix(vec3(.25, .35, .5), vec3(.4, .375, .35), sun);
	col = mix(col, vec3(1, .9, .7), horiz * (.75));
    
  	col += 0.25*vec3(1, .7, .4)*pow(sun, 5.0);
	col += 0.25*vec3(1, .8, .6)*pow(sun, 64.0);
	col += 0.2*vec3(1, .9, .7)*max(pow(sun, 512.0), .3);
    col = clamp(col + hash(rd)*0.05 - 0.025, 0., 1.);

	vec3 sc = ro + rd*FAR*100.; 
    sc.y *= 3.;
    
	return mix( col, vec3(1.0,0.95,1.0), 0.5*smoothstep(0.5, 1.0, fbm(.001*sc)) * clamp(rd.y*4., 0., 1.) );
	

}
float curve(in vec3 p){

    const float eps = 0.05, amp = 4.0, ampInit = 0.5;

    vec2 e = vec2(-1., 1.)*eps; //0.05->3.5 - 0.04->5.5 - 0.03->10.->0.1->1.
    
    float t1 = map(p + e.yxx), t2 = map(p + e.xxy);
    float t3 = map(p + e.xyx), t4 = map(p + e.yyy);
    
    return clamp((t1 + t2 + t3 + t4 - 4.*map(p))*amp + ampInit, 0., 1.);
}




void main(){	

  
   freqs[0] = texture2D( fft, vec2( 0.01, 0.0 ) ).x;
	freqs[1] = texture2D( fft, vec2( 0.07, 0.0 ) ).x;
	freqs[2] = texture2D( fft, vec2( 0.15, 0.0 ) ).x;
	freqs[3] = texture2D( fft, vec2( 0.30, 0.0 ) ).x;


    // Set FAR

    FAR =  65.0 ;

	// Screen coordinates.
	vec2 u = (gl_FragCoord.xy - resolution.xy*0.5)/resolution.y;
	
	// Camera Setup.
	vec3 lookAt = vec3(0.0, 0.0, time*8.);  // "Look At" position.
	vec3 ro = lookAt + vec3(0.0, 0.0, -0.1); // Camera position, doubling as the ray origin.
 
	// Using the Z-value to perturb the XY-plane.
	// Sending the camera and "look at" vectors down the tunnel. The "path" function is 
	// synchronized with the distance function.
	lookAt.xy += path(lookAt.z) ;//+ (mouse.xy/2.0);
 
	ro.xy += path(ro.z);

    // Using the above to produce the unit ray-direction vector.
    float FOV = 3.14159/3.; // FOV - Field of view.
    vec3 forward = normalize(lookAt-ro);
    vec3 right = normalize(vec3(forward.z, 0., -forward.x )); 

    vec3 up = cross(forward, right);

    // rd - Ray direction.
    vec3 rd = normalize(forward + FOV*u.x*right + FOV*u.y*up);
    
    // Swiveling the camera about the XY-plane (from left to right) when turning corners.
    // Naturally, it's synchronized with the path in some kind of way.
	rd.xy = rot2( path(lookAt.z).x/64. )*rd.xy;
    	
    // Usually, you'd just make this a unit directional light, and be done with it, but I
    // like some of the angular subtleties of point lights, so this is a point light a
    // long distance away. Fake, and probably not advisable, but no one will notice.
    vec3 lp = vec3(FAR*0.5, FAR, FAR) + vec3(0, 0, ro.z);
 
	// Raymarching, using Nimitz's "Log Bisection" method. Very handy on stubborn surfaces. :)
	float t = logBisectTrace(ro, rd);
    
    // Standard sky routine. Worth learning. For outdoor scenes, you render the sky, then the
    // terrain, then mix together with a fog falloff. Pretty straight forward.
    vec3 sky = getSky(ro, rd, normalize(lp - ro));
    
    // The terrain color. Can't remember why I set it to sky. I'm sure I had my reasons.
    vec3 col = sky;
    
    // If we've hit the ground, color it up.
    if (t < FAR){
    
        vec3 sp = ro+t*rd; // Surface point.
        vec3 sn = normal( sp ); // Surface normal.

        // Light direction vector. From the sun to the surface point. We're not performing
        // light distance attenuation, since it'll probably have minimal effect.
        vec3 ld = lp-sp;
        ld /= max(length(ld), 0.001); // Normalize the light direct vector.

        
        // Texture scale factor.        
        const float tSize1 = 1./6.;
        
        // Bump mapping with the sandstone texture to provide a bit of gritty detailing.
        // This might seem counter intuitive, but I've turned off mip mapping and set the
        // texture to linear, in order to give some grainyness. I'm dividing the bump
        // factor by the distance to smooth it out a little. Mip mapped textures without
        // anisotropy look too smooth at certain viewing angles.
        sn = doBumpMap(iChannel1, sp*tSize1, sn, .007/(1. + t/FAR));//max(1.-length(fwidth(sn)), .001)*hash(sp)/(1.+t/FAR)
        
        float shd = softShadow(sp, ld, 0.05, FAR, 8.); // Shadows.
        float curv = curve(sp)*.9 +.1; // Surface curvature.
        float ao = calculateAO(sp, sn, 4.); // Ambient occlusion.
        
        float dif = max( dot( ld, sn ), 0.0); // Diffuse term.
        float spe = pow(max( dot( reflect(-ld, sn), -rd ), 0.0 ), 5.); // Specular term.
        float fre = clamp(1.0 + dot(rd, sn), 0.0, 1.0); // Fresnel reflection term.

       

        // Schlick approximation. I use it to tone down the specular term. It's pretty subtle,
        // so could almost be aproximated by a constant, but I prefer it. Here, it's being
        // used to give a hard clay consistency... It "kind of" works.
		float Schlick = pow( 1. - max(dot(rd, normalize(rd + ld)), 0.), 5.0);
		float fre2 = mix(.2, 1., Schlick);  //F0 = .2 - Hard clay... or close enough.
       
        // Overal global ambience. Without it, the cave sections would be pretty dark. It's made up,
        // but I figured a little reflectance would be in amongst it... Sounds good, anyway. :)
        float amb = fre*fre2 + .1;
        
        // Coloring the soil - based on depth. Based on a line from Dave Hoskins's "Skin Peeler."
        col = clamp(mix(vec3(.8, 0.5,.3), vec3(.5, 0.25, 0.125),(sp.y+1.)*.15), vec3(.5, 0.25, 0.125), vec3(1.));
        
        // Give the soil a bit of a sandstone texture. This line's made up.
        col =  smoothstep(-.5, 1., tex3D(iChannel1, sp*tSize1, sn))*(col + .25);
        
        // Tweaking the curvature value a bit, then using it to color in the crevices with a 
        // brownish color... in a lame attempt to make the surface look dirt-like.
        curv = smoothstep(0., .7, curv);
        col *= vec3(curv, curv*0.95, curv*0.85);
 
        
        // A bit of sky reflection. Not really accurate, but I've been using fake physics since the 90s. :)
        col += getSky(sp, reflect(rd, sn), ld)*fre*fre2*.5;
        
        
        // Combining all the terms from above. Some diffuse, some specular - both of which are
        // shadowed and occluded - plus some global ambience. Not entirely correct, but it's
        // good enough for the purposes of this demonstation.        
        col = (col*(dif + .1) + fre2*spe)*shd*ao + amb*col;
       
        
    }
    
    
    // Combine the terrain with the sky using some distance fog. This one is designed to fade off very
    // quickly a few units out from the horizon. Account for the clouds, change "FAR - 15." to zero, and 
    // the fog will be way more prominent. You could also use "1./(1 + t*scale)," etc.
    col = mix(col, sky, sqrt(smoothstep(FAR - 15., FAR, t)));
    

    //col = pow(col*1.1, vec3(1.1));

    
    // Standard way to do a square vignette. Note that the maxium value value occurs at "pow(0.5, 4.) = 1./16," 
    // so you multiply by 16 to give it a zero to one range. This one has been toned down with a power
    // term to give it more subtlety.
    u = gl_FragCoord.xy / resolution.xy;
	
    col *= pow( 16.0*u.x*u.y*(1.0-u.x)*(1.0-u.y) , .0625);

    // Done.
	gl_FragColor = vec4(clamp(col, 0., 1.), 1.0 );
}
