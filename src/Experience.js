import * as THREE from "three";
import { useEffect, useRef } from "react";

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
      step: 0.001,
      onChange: (val) => {
        if (shadowShader) {
          shadowShader.uniforms.uProgress.value = val;
        }
        if (objShader) {
          objShader.uniforms.uProgress.value = val;
        }
      },
    },
  });

  let shadowShader;
  let objShader;

  const geo = new THREE.IcosahedronGeometry(1, 10).toNonIndexed();
  // const geo = new THREE.SphereGeometry(1, 32, 32).toNonIndexed();

  let len = geo.attributes.position.count;

  const randoms = new Float32Array(len);
  const centers = new Float32Array(len * 3);

  for (let i = 0; i < len; i += 3) {
    const r = Math.random();

    randoms[i] = r;
    randoms[i + 1] = r;
    randoms[i + 2] = r;

    const x = geo.attributes.position.array[i * 3];
    const y = geo.attributes.position.array[i * 3 + 1];
    const z = geo.attributes.position.array[i * 3 + 2];

    const x1 = geo.attributes.position.array[i * 3 + 3];
    const y1 = geo.attributes.position.array[i * 3 + 4];
    const z1 = geo.attributes.position.array[i * 3 + 5];

    const x2 = geo.attributes.position.array[i * 3 + 6];
    const y2 = geo.attributes.position.array[i * 3 + 7];
    const z2 = geo.attributes.position.array[i * 3 + 8];

    let center = new THREE.Vector3(x, y, z)
      .add(new THREE.Vector3(x1, y1, z1))
      .add(new THREE.Vector3(x2, y2, z2))
      .divideScalar(3);

    centers.set([center.x, center.y, center.z], i * 3);
  }
  geo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
  geo.setAttribute("aCenter", new THREE.BufferAttribute(centers, 1));

  const customShader = (shader) => {
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
    attribute vec3 aCenter;
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
      // transformed += aRandom*uProgress*normal;
      // transformed = rotate(transformed, vec3(0., 1., 0.), uProgress*3.14*3.);

      transformed = (transformed - aCenter)*uProgress + aCenter;
    `
    );
  };

  useFrame((state) => {
    if (shadowShader) {
      shadowShader.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (objShader) {
      // console.log(objShader);
      objShader.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  useEffect(() => {
    customShaderMat.current.onBeforeCompile = (shader) => {
      customShader(shader);
      objShader = shader;
    };
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
                customShader(shader);
                shadowShader = shader;
              },
            },
          ]}
        />
        <CustomShaderMaterial
          ref={customShaderMat}
          color="#ff0000"
          baseMaterial={THREE.MeshStandardMaterial}
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
