
precision lowp float;

uniform float time;
uniform vec2 resolution;
uniform int subEffectId;

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

const mat2 m2 = mat2( 0.80, -0.60, 0.60, 0.80 );

float fbm( vec2 p ) {
    float f = 0.0;
    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );
    
    return f/0.9375;
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
    
   /*
	col.gb *=  uv.y * .6; 
	col.g = 0.0+0.6*smoothstep(-0.1,0.9,col.g*2.0);
	col = 0.001+pow(col, vec3(1.2))*1.5;
	*/
	//col = clamp(1.06*col-0.03, 0., 1.);   
    col *= mod(gl_FragCoord.y, 4.0)<2.0 ? 0.6 : 1.0;

	return col;
}
float sun(float x,float y,float t){
   float xx  =x+1.25;
   float yy = y-0.5;
   return 0.5/sqrt(xx*xx+yy*yy);
}


void main( void ) 
{

	vec2 uv = ( gl_FragCoord.xy / resolution.xy );
	vec2 p = -1.0 + 2.0*uv;
	p.x *= resolution.x / resolution.y;
	
	if (uv.y < .12 || uv.y >= .88) {
		gl_FragColor=vec4(0.,0.,0.,1.);
		return;
	}
	
	vec3 color =  vec3(0);
		 color = clouds(p);	
	
	vec3 sundot = vec3(2.0,2.0,1.2)*(sun(p.x,p.y,time)/10.0);
	
    p.x += 1.5;
	float r = 0.2 + 0.1*cos( atan(p.y,p.x)*10.0 + 30.0*p.x + 1.5 * sin(time));
	color *= smoothstep( r, r+0.01, length( p ) );
	r = 0.015;
	r += 0.002*sin(120.0*uv.y);
	r += exp(-20.0*uv.y);
 	color *= 1.0 - (1.0-smoothstep(r,r+0.002, abs(p.x-0.25*sin(2.0*p.y))))*(1.0-smoothstep(0.0,0.1,p.y));
	
	color = postprocess(p,sundot + color);
	
	
	vec4 final = vec4( color, 1.0 ) ;
		
	gl_FragColor = final ;

}





