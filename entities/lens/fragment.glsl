#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform float timeTotal;
uniform float elapsedTime;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D backbuffer;

const float ySpeed = 1.25;
const float radius = 0.008;
const float bph = 1.0;
const float bps = 2.0;

vec3 lens(vec2 uv){
	 vec3 color = vec3(0.);
	
	 for(int i=0;i<64;i++){
        float pha = tan(float(i)*6.+1.0)* .5 + .5;
          float siz = pow(cos(float(i)*2.4+4.0)*.5 + ySpeed,4.);

         float pox = cos(float(i)*2.55+3.1)*resolution.x / resolution.y;

        float rad = radius + sin(float(i)) * 0.12+0.29;

        vec2 pos = vec2(pox+sin(time/50.+pha+siz),-abs(bph)-rad+(bps+2.0*rad)
            *mod(pha+0.1*(time/5.)*(0.2+0.8*siz),1.0)) * vec2(1.0,1.0);

            float dis = length(uv-pos);        

            vec3 col = mix(
                        vec3(0.1,0.1,0.1),vec3(0.2,0.3,0.6),0.2+0.2*sin(float(i)*sin(time*pox*0.03)+1.9));

                color += col.xyz * (1. -smoothstep(rad*(0.65+0.20*sin(pox*time)),rad,dis))*(1.0-cos(pox*time));
        
   }
	return color;
}

void main(void){
	
    vec2 q = gl_FragCoord.xy / resolution.xy;
	
    vec2 uv =-1.0 + 2.0*q;
	
    uv.x *= resolution.x / resolution.y;
	
	  if (q.y < .12 || q.y >= .88) {
		gl_FragColor=vec4(0.,0.,0.,1.);
		return;
	}

vec3 color = lens(uv);
   

   gl_FragColor = vec4(color,.0);
      
   
  

}