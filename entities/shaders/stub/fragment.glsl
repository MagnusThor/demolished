uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D fft;

#include "entities/shared/helpers.glsl";
#include "entities/shared/primitives.glsl";
#include "entities/shared/manipulation.glsl";
#include "entities/shared/combination.glsl";

out vec4 fragColor;

float freqs[16];

void main(){
  
  vec2 uv=(-resolution.xy+2.*gl_FragCoord.xy)/resolution.y;
  
  vec3 col=vec3(0.);
  
  for(int i=0;i<16;i++){
    vec4 aa=texture(fft,vec2(-.934+.5*float(i)/15.128,-.574));
    freqs[i]=clamp(1.9*pow(aa.x,3.),0.,1.);
    
  }
  float f=fCircle(vec3(uv.xy,.5),freqs[3]);
  //float f = 1.0;
    
  col=vec3(f);
  
  fragColor=vec4(col,1.);
}

