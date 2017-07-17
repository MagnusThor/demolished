
#ifdef GL_ES	
precision mediump float;
#endif


#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform float elapsedTime;

uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {

	vec2 uv = ( gl_FragCoord.xy / resolution.xy ) + mouse / 4.0;
	
	float alpha =  sin(time) ;
	
	vec3 col;
	
	if(elapsedTime < 2.559){
		 col = vec3(alpha);
	}else{
		 col = vec3(1.0,0.,0.0);
	}		

	gl_FragColor = vec4( col, 1.0 );

}