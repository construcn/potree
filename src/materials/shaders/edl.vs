
precision mediump float;
precision mediump int;

in vec3 position; // Use 'in' instead of 'attribute'
in vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

out vec2 vUv; // Use 'out' instead of 'varying' for outputs to the fragment shader

void main() {
    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
