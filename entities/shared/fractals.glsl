float sampleThingy( vec3 p )
{
 
    float t=-0.4;
	float dotp=dot(p,p);
	p=p/dotp*5.;
	p=sin(p+vec3(sin(1.+t)*2.,-t,-t*2.));
	float d=length(p.yz)-0.22;
	d=min(d,length(p.xz)-0.22);
	d=min(d,length(p.xy)-0.22);
	d=min(d,length(p*p*p)-0.22*0.3);
	return d*dotp/5.;
}