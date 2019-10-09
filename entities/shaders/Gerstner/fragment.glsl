uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D fft;

out vec4 fragColor;



//#define TWOD
#define NOISE 
#define ITER    10
#define EPS   1e-3
#define STEPS  256
#define FAR    20.

mat2 rot( float a)
{

    return mat2( cos( a ), -sin( a ),
                 sin( a ),  cos( a )
               );

}

float hash( float a )
{

    return fract( sin( a * 42165.15 ) * 54513.51 );

}

float hash( vec2 uv )
{

    return fract( sin( uv.x * 452.153 + uv.y * 542.515 ) * 215.15 );

}

float noise( vec2 uv )
{
    
    vec2 id = floor( uv );
    vec2 lv = fract( uv );
    lv *= lv * lv * ( 3.0 - 2.0 * lv );
    
    float bl = hash( id );
    float br = hash( id + vec2( 1, 0 ) );
    float b = mix( bl, br, lv.x );
    
    float tl = hash( id + vec2( 0, 1 ) );
    float tr = hash( id + vec2( 1 ) );
    float t = mix( tl, tr, lv.x );
    
    return mix( b, t, lv.y ); 

}

float ger( vec2 uv )
{
    
    float ste = 1.5;
    float amp = 0.7;
    float wav = 1.9;
    float spe = 1.5;
    uv.x *= 0.1;
    uv.y *= 0.3;
    #ifdef NOISE
    uv.x += 1.0 * amp * cos( uv.x - time * spe + ( uv.x + uv.y ) + noise( uv + time ) );
    uv.y += ste * amp * sin( uv.y - time * spe * 0.5 + ( uv.x + uv.y ) + noise( uv + 5.0 + time ) );
    #else
    uv.x += 1.0 * amp * cos( uv.x - time * spe + ( uv.x + uv.y ) );
    uv.y += ste * amp * sin( uv.y - time * spe * 0.5 + ( uv.x + uv.y ) );
    #endif
    float c = 0.3 * sin( wav * ( amp ) * ( uv.x + uv.y ) + time );
    
    return c;

}

float fbm( vec2 uv )
{

    float res = 0.0, amp = 1.0, fre = 1.0, div = 0.0, tim = time;
    
    for( int i = 0; i < ITER; ++i )
    {
    
        res += amp * ger( ( uv + tim ) * fre );
        div += amp;
        tim *= 0.7;
        amp *= 0.5;
        fre *= 2.0;
    
    }
    
    res /= div;
    
    return res;

}

float wav( vec2 uv )
{

    return 5.0 * fbm( uv );

}

float wavO( vec2 uv )
{

    return 5.0 * ger( uv );

}

float map( vec3 p )
{

    return p.y + wav( p.xz );

}

vec3 nor( vec3 p )
{

    vec2 e = vec2( EPS, 0.0 );
    
    return normalize( vec3( map( p + e.xyy ) - map( p - e.xyy ),
                            map( p + e.yxy ) - map( p - e.yxy ),
                            map( p + e.yyx ) - map( p - e.yyx )
                          )
                    );

}

float ray( vec3 ro, vec3 rd, out float d )
{

    float t = 0.0; d = 0.0;
    
    for( int i = 0; i < STEPS; ++i )
    {
    
        vec3 p = ro + rd * t;
        d = 0.3 * map( p );
        
        if( d < EPS || t > FAR ) break;
        
        t += d;
    
    }
    
    return t;

}

vec3 ren( vec3 ro, vec3 rd )
{

    float d = 0.0, t = ray( ro, rd, d );
    vec3 col = vec3( 0 );
    vec3 p =  ro + rd * t;
    vec3 n = nor( p );
    vec3 lig = normalize( vec3( 0.0, 0.5, 1.0 ) );
    
    float amb = 0.5 + 0.5 * n.y;
    float ambO = 0.5 + 0.5 * -n.y;
    float dif = max( 0.0, dot( lig, n ) );
    float spe = pow( clamp( dot( lig, reflect( rd, n ) ), 0.0, 1.0 ), 16.0 ); 
    
    float tex = wav( p.xz );
    
    col += 0.5 * vec3( 24, 49, 89 ) / 256.0;
    
    vec3 fint = mix( vec3( 0.2 ), vec3( 0 ), tex );
    vec3 foa = mix( vec3( 0.5 ), vec3( 0 ), wav( p.xz * 7.0 ) );
    
    col += 0.3 * dif;
    col += 0.3 * amb;
    col += 0.1 * spe;
    
    col += -0.05 + fint;
    col += -0.05 + foa;
    
    //col = mix( vec3( 0 ), vec3( 1 ), col );
    //col -= 1.0;

    //if( col.r >= 0.1 ) col += 0.2;
    
    col *= 0.5 / ( 1.0 + t * t * 0.1 );
    
    col *= sqrt( col );
    
    return col;

}

void main()
{
    
    vec2 uv = ( -resolution.xy + 2.0 * gl_FragCoord.xy ) / resolution.y;
    
    vec3 ro = vec3( 0, 3.0, -time );
    vec3 rd = normalize( vec3( uv, -1 ) );
    ro.y -= wavO( ro.xz );
    
    ro.x += noise( ro.xz ) * 0.5;
    rd.x += noise( ro.xz ) * 0.5;
    
    vec3 col = vec3( 0 );
    
    #ifdef TWOD
    
    col = mix( vec3( 0, 0.5, 0.6 ), vec3( 0 ), fbm( uv * 50.0 ) );
    
    #else
    
    float d = 0.0, t = ray( ro, rd, d );
    
    col = d < EPS ? ren( ro, rd ) : vec3( 0 );
    
    #endif

    // Output to screen
    fragColor = vec4(col,1.0);
}





