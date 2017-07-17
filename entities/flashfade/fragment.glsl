#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main( void ) {
  vec2 p = (gl_FragCoord.xy / resolution.xy - vec2(0.5, 0.5)) * 2.0;

  float t = mod(time, 3.0);

  float x = p.x * p.x;
  float y = p.y;

  float c = 1.0;
  float v = t * t * t * t * t * 2.3;
  float w = abs(y) + x / 100.0;
  if (v > 1.0) {
    c = (1.5 - t) * 2.0;
  } else if (v > w) {
    c = 1.0;
  } else {
    c = v * v / w / w;
  }

  float r = sin(x) * cos(x) * x * 0.2;

  gl_FragColor.a = 1.0;
  gl_FragColor.rgb = vec3(c-r, c-r, c);
}