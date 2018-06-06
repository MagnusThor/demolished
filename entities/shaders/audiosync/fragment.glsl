
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;
uniform sampler2D fft;

out vec4 fragColor;


void main()
{
	vec2 tuv = gl_FragCoord.xy / resolution.xy;
	vec2 uv = gl_FragCoord.xy / resolution.yy-vec2(.9,.5);
	
	float acc = .0;
	float best = .0;
	float best_acc = .0;
	
	for (float i = .0; i<0.5; i+=.008)
	{
		acc+=texture(fft,vec2(i,.0)).x-.5;
		if (acc>best_acc)
		{
			best_acc = acc;
			best = i;
		}
	}
	
	vec3 colorize = vec3(.2);
	
	for (float i = .0; i< 1.0; i+=.05)
	{
		colorize[int(i*3.0)]+=texture(fft,vec2(i,0.0)).y*pow(i+.5,.9);
	}
	
	colorize = normalize(colorize);
	
	float offset = best;
	float boost = texture(fft,vec2(2.0)).x;
	float power = pow(boost,2.0);
	
	vec3 color = vec3(.0);
	
	vec2 buv = uv*(1.0+power*power*power*.25);
	buv += vec2(pow(power,12.0)*.1,time*.05);
	
	vec2 blocks = mod(buv,vec2(.1))-vec2(.05);
	vec2 blocksid = sin((buv - mod(buv,vec2(.1)))*412.07);
	float blockint = texture(iChannel3,blocksid,-48.0).y;
	float oint = blockint = 
		-    texture(fft,vec2(blockint-.02,.0)).x
		+2.0*texture(fft,vec2(blockint,.0)).x
		-    texture(fft,vec2(blockint+.02,.0)).x;
	blockint = pow(blockint*blockint,2.80)*111.0;
	color += 
		
	   +2.0*blockint*max(.0,min(1.0,(.04+oint*0.05-max(abs(blocks.x),abs(blocks.y)))*500.0))*colorize;
	
	
	color -= length(uv)*.1;
	
	vec4 aa = texture(fft,gl_FragCoord.xy/1.0);
	color += aa.xyz*.01;
	color = pow(max(vec3(.0),color),vec3(.6));
	
	
	fragColor = vec4(color,1.0);
}













