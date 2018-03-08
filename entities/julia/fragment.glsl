#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const int iterations = 256;
const float PI = 3.14;

float s(in float z){
    return sin(z/24.)*cos(z/12.);
}

float sinish(float t) {
	return sin(t)*0.5+0.5;
}


vec3 getCol(vec3 z){
	return vec3(z.x);
}
	
	
vec3 getCol(float p){ 
		return vec3(p*1.299,1., p*0.114); return vec3(p*.09,1., p*0.114); 
}

mat2 scale(vec2 s){
	return mat2(s.x,0.,0.,s.y);	
}

mat2 rotate2d(float a){
	return mat2(cos(a),-sin(a),sin(a),cos(a));
}

void main() {

float col;
		
    vec2 uv = gl_FragCoord.xy / resolution.xy ;
    vec2 c = vec2(0.4,0.312);

    uv -= vec2(0.5);    	
    uv = scale(vec2(sin(time*0.03)-1.)) * uv;
    uv = rotate2d(sin(time*0.023)* PI) * uv;
    uv += vec2(0.5);
	
    vec2 z;
	
    z.x = 3.0 * (uv.x - 0.5);
    z.y = 2.0 * (uv.y - 0.5);
   	
    for(int i=0; i<iterations; i++) {
       float x = (z.x * z.x - z.y * z.y) + c.x;
	float y = (z.y * z.x + z.x * z.y) + c.y;
	    if((x * x + y * y) > 4.0) {
		    col = float(i);
		    break;
	    }
        z.x = x;
        z.y = y;
   }

	
	vec3 color = vec3(getCol(col));
	
	color = getCol(color);

       gl_FragColor = vec4(color,1.0) /100.;

}