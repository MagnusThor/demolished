#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
#extension GL_EXT_shader_texture_lod : enable
#ifdef GL_ES
precision highp float;
precision highp int;
#endif

attribute vec3 position;
attribute vec2 surfacePosAttrib;
varying vec2 surfacePosition;

void main() {

				surfacePosition = surfacePosAttrib;
				gl_Position = vec4( position,1.0 );

				
				
}