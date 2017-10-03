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

float udRoundbox(vec3 p,vec3 b, float r){
    return length(max(abs(p)-b,0.0))-r;
}
float sphere(in vec3 p){
        return length(p)-0.5;
}
void main(void){

    vec2 uv = gl_FragCoord.xy / resolution.y + mouse;

    vec3 center = vec3(uv.x,uv.y,.5);

     vec3 box = vec3(0.1,0.1,0.1);

    //  vec2 unipos = (gl_FragCoord.xy / resolution);
	//  vec2 pos =  unipos*2.0-1.0;
    // 	pos.x *= resolution.x / resolution.y;

    // float t = udRoundbox(pos,box,0.5);

 //   vec3 col = vec3(0.6,0.99,0.2) * sphere(vec3(uv.x,uv.y,1.)); //*udRoundbox(pos,box,0.5);;
    // float c = sphere(resolution.xy*0.5);
    // float t = clamp(c,0.0,1.0);
    // vec3 color = vec3(1.,0.,0.);
    float b = udRoundbox(center,box,0.1);
    if(b < .5){
        gl_FragColor = vec4(1.0);
    }
  
    

}