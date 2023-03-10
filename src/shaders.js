export const vert = /*glsl*/ `
varying vec2 vUv;
attribute float aRandom;
attribute float aCenter;
uniform float uTime;
uniform float uProgress;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
    }
    
    vec3 rotate(vec3 v, vec3 axis, float angle) {
      mat4 m = rotationMatrix(axis, angle);
      return (m * vec4(v, 1.0)).xyz;
    }

void main() {
    vUv = uv;

    vec3 pos = position;

    pos += aRandom*uProgress*normal;
    
    // pos = rotate(pos, vec3(0.0, 1.0, 0.0), uProgress*3.14*3.);

    pos = (pos - aCenter)*uProgress + aCenter;

    csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const frag = /*glsl*/ `
uniform vec3 uColor;
varying vec2 vUv;
void main() {
    csm_FragColor = vec4(vUv, 1.0, 1.0);
}
`;
