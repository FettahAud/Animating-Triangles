import * as THREE from "three";
import { useRef } from "react";

import { useFrame } from "@react-three/fiber";

import CustomShaderMaterial from "three-custom-shader-material";

import * as sphereShader from "./shaders";
import { patchShaders } from "gl-noise/build/glNoise.m";

export default function Experience() {
  const sphere = useRef();
  const customShaderMat = useRef();
  const plane = useRef();

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
                shader.uniforms.uTime = { value: 0, linked: true, mixed: true };
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <common>",
                  `
                #include <common>
                attribute float aRandom;
                uniform float uTime;
                `
                );
                shader.vertexShader = shader.vertexShader.replace(
                  "#include <begin_vertex>",
                  `#include <begin_vertex>

                    transformed += aRandom*(.5 *sin(uTime) + .5)*normal;
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
            uTime: { value: 0, linked: true, mixed: true },
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
