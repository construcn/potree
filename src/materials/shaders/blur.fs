
#version 300 es

precision mediump float;

uniform mat4 projectionMatrix;

uniform float screenWidth;
uniform float screenHeight;
uniform float near;
uniform float far;

uniform sampler2D map;

in vec2 vUv;
out vec4 fragColor;

void main() {

	float dx = 1.0 / screenWidth;
	float dy = 1.0 / screenHeight;

	vec3 color = vec3(0.0, 0.0, 0.0);
	color += texture(map, vUv + vec2(-dx, -dy)).rgb;
	color += texture(map, vUv + vec2(  0, -dy)).rgb;
	color += texture(map, vUv + vec2(+dx, -dy)).rgb;
	color += texture(map, vUv + vec2(-dx,   0)).rgb;
	color += texture(map, vUv + vec2(  0,   0)).rgb;
	color += texture(map, vUv + vec2(+dx,   0)).rgb;
	color += texture(map, vUv + vec2(-dx,  dy)).rgb;
	color += texture(map, vUv + vec2(  0,  dy)).rgb;
	color += texture(map, vUv + vec2(+dx,  dy)).rgb;

	color = color / 9.0;
	
	fragColor = vec4(color, 1.0);
}