
  uniform float time;
  uniform vec2 mouse;
  uniform vec2 resolution;

  uniform sampler2D iChannel0;
  uniform sampler2D iChannel1;
  uniform sampler2D iChannel2;
  uniform sampler2D iChannel3;
  uniform sampler2D fft;

  out vec4 fragColor;

  float sp(vec3 p,float s){
        return length(p) * s;
  }

  float freqs[16];

  void main(){

    vec2 p = (-resolution.xy + 2.0*gl_FragCoord.xy)/resolution.y;
      
    vec3 col = vec3(0.);	
    
    
      
      for( int i=0; i<16; i++ ){
          vec4 aa = texture( fft, vec2( -0.934 + 0.5*float(i)/15.128, -0.574));
          freqs[i] = clamp( 1.9*pow( aa.x, 3.0 ), 0.0, 1.0 );
          
      }
      float s = sp(vec3(p.xy,0.5),freqs[3]);

      
    col = vec3(s);
    
      
    
    fragColor = vec4(col,1.0);
  }













