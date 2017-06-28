

float vignette(vec2 uv)
{
	float vig = uv.x*uv.y * 15.0; 
   	return pow(vig, 0.25);
}

void main( void )
{
	
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	uv *=  1.0 - uv.yx; 
	float f = vignette (uv);
}

