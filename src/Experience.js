import * as THREE from "three";
import { useRef } from "react";

import { useFrame } from "@react-three/fiber";

import CustomShaderMaterial from "three-custom-shader-material";

import * as sphereShader from "./shaders";
import { patchShaders } from "gl-noise/build/glNoise.m";
import { useControls } from "leva";

export default function Experience() {
  const sphere = useRef();
  const customShaderMat = useRef();
  const plane = useRef();

  const { progress } = useControls({
    progress: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      onChange: (val) => {
        customShaderMat.current.uniforms.uProgress.value = val;
        if (myShader) {
          myShader.uniforms.uProgress.value = val;
        }
      },
    },
  });

  let myShader;

  const geo = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();

  let len = geo.attributes.position.count;

  const randoms = new Float32Array(len * 3);

  for (let i = 0; i < len; i += 3) {
    const r = Math.random();

    randoms[i] = r;
    randoms[i + 1] = r;
    randoms[i + 2] = r;
  }
  geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

  useFrame((state) => {
    customShaderMat.current.uniforms.uTime.value = state.clock.getElapsedTime();
    if (myShader) {
      myShader.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <>
      <mesh ref={sphere} geometry={geo} position={[0, 1.1, 0]} castShadow>
        <meshDepthMaterial
          attach="customDepthMaterial"
          baseMaterial={THREE.MeshDepthMaterial}
          args={[
            {
              depthPacking: THREE.RGBADepthPacking,
              onBeforeCompile(shader) {
                shader.uniforms.uColor = {
                  value: new THREE.Color(0.0, 0.0, 0.0),
                };
                shader.uniforms.uTime = { value: 0 };
                shader.uniforms.uProgress = { value: progress };
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <common>",
                  `
                #include <common>
                attribute float aRandom;
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
                `
                );
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <begin_vertex>",
                  `#include <begin_vertex>
                    transformed = rotate(transformed, vec3(0., 1., 0.), uProgress);
                    transformed += aRandom*uProgress*normal;
                `
                );
                myShader = shader;
              },
            },
          ]}
        />
        <CustomShaderMaterial
          ref={customShaderMat}
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={patchShaders(sphereShader.vert)}
          side={THREE.DoubleSide}
          uniforms={{
            uColor: { value: new THREE.Color(0.0, 0.0, 0.0) },
            uTime: { value: 0 },
            uProgress: { value: progress },
          }}
        />
      </mesh>
      <mesh
        ref={plane}
        position-y={-1.1}
        rotation-x={-Math.PI * 0.5}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[15, 15, 100, 100]} />
        <meshStandardMaterial />
      </mesh>
    </>
  );
}
