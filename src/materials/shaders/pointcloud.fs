#version 300 es

precision highp float;
precision highp int;

uniform mat4 viewMatrix;
uniform mat4 uViewInv;
uniform mat4 uProjInv;
uniform vec3 cameraPosition;

uniform mat4 projectionMatrix;
uniform float uOpacity;

uniform float blendHardness;
uniform float blendDepthSupplement;
uniform float fov;
uniform float uSpacing;
uniform float near;
uniform float far;
uniform float uPCIndex;
uniform float uScreenWidth;
uniform float uScreenHeight;

in vec3 vColor;
in float vLogDepth;
in vec3 vViewPosition;
in float vRadius;
in float vPointSize;
in vec3 vPosition;

out vec4 fragColor; // Output color

float specularStrength = 1.0;

void main() {
    vec3 color = vColor;
    float depth = gl_FragCoord.z;

    #if defined(circle_point_shape) || defined(paraboloid_point_shape)
        float u = 2.0 * gl_PointCoord.x - 1.0;
        float v = 2.0 * gl_PointCoord.y - 1.0;
    #endif

    #if defined(circle_point_shape)
        float cc = u * u + v * v;
        if(cc > 1.0) {
            discard;
        }
    #endif

    #if defined(color_type_indices)
        fragColor = vec4(color, uPCIndex / 255.0);
    #else
        fragColor = vec4(color, uOpacity);
    #endif

    #if defined(paraboloid_point_shape)
        float wi = 0.0 - (u * u + v * v);
        vec4 pos = vec4(vViewPosition, 1.0);
        pos.z += wi * vRadius;
        float linearDepth = -pos.z;
        pos = projectionMatrix * pos;
        pos = pos / pos.w;
        float expDepth = pos.z;
        depth = (pos.z + 1.0) / 2.0;
        gl_FragDepth = depth; // Use gl_FragDepth directly

        #if defined(color_type_depth)
            color.r = linearDepth;
            color.g = expDepth;
        #endif

        #if defined(use_edl)
            fragColor.a = log2(linearDepth);
        #endif

    #else
        #if defined(use_edl)
            fragColor.a = vLogDepth;
        #endif
    #endif

    #if defined(weighted_splats)
        float distance = 2.0 * length(gl_PointCoord.xy - 0.5);
        float weight = max(0.0, 1.0 - distance);
        weight = pow(weight, 1.5);

        fragColor.a = weight;
        fragColor.rgb = fragColor.rgb * weight;
    #endif
}
