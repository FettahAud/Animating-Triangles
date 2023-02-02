/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: The Smithsonian Institution (https://sketchfab.com/Smithsonian)
license: CC0-1.0 (http://creativecommons.org/publicdomain/zero/1.0/)
source: https://sketchfab.com/3d-models/george-washington-bust-23630d35f855409e9c00c810b1416c71
title: George Washington Bust
*/
// we want one geometry model and smaller size
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props) {
  const { nodes, materials } = useGLTF("/human.glb");
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials["ml.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_3.geometry}
          material={materials.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials["ml.001"]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/human.glb");
