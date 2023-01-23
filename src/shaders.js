export const vert = /*glsl*/ `
varying vec2 vUv;
attribute float aRandom;
uniform float uTime;

void main() {
    vUv = uv;

    vec3 pos = position;

    pos += aRandom*(.5 *sin(uTime) + .5)*normal;
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
