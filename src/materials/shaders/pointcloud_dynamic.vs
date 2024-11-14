#version 300 es

precision highp float;
precision highp int;

#define PI 3.141592653589793

in vec3 position;

// DYNAMIC LIST OF ATTRIBUTES IN USE
#define NUM_ATTRIBUTES 1

in float attribute_0;

uniform float uAttribute_w[NUM_ATTRIBUTES];      // composite weight
uniform vec3  uAttribute_gbc[NUM_ATTRIBUTES];    // gamma, brightness, contrast
uniform vec2  uAttribute_range[NUM_ATTRIBUTES];  // 

// filter

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 uViewInv;

uniform sampler2D gradient;
uniform sampler2D classificationLUT;

out vec3 vColor;

float getContrastFactor(float contrast) {
	return (1.0 + contrast) / (1.0 - contrast);
}

vec4 getColor(float value, int index) {
	vec2 range = uAttribute_range[index];
	vec3 gbc = uAttribute_gbc[index];
	float gamma = gbc.x;
	float brightness = gbc.y;
	float contrast = gbc.z;

	float w = (value - range.x) / (range.y - range.x);
	w = pow(w, gamma);
	w = w + brightness;
	w = (w - 0.5) * getContrastFactor(contrast) + 0.5;
	w = clamp(w, 0.0, 1.0);

	return vec4(w, w, w, 1.0);
}

vec4 getColor(vec4 value, int index) {
	vec4 color = value;

	vec3 gbc = uAttribute_gbc[index];
	float gamma = gbc.x;
	float brightness = gbc.y;
	float contrast = gbc.z;

	color = pow(color, vec3(gamma));
	color = color + brightness;
	color = (color - 0.5) * getContrastFactor(contrast) + 0.5;
	color = clamp(color, 0.0, 1.0);

	return color;
}

vec4 getColor() {
	return vec4(1.0, 1.0, 1.0, 1.0); // Placeholder implementation
}

void main() {
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

	gl_Position = projectionMatrix * mvPosition;

	gl_PointSize = 2.0;

	// COLOR
	vColor = getColor().rgb;
}
