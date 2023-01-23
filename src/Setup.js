import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";

export default function Setup() {
  const spotLight = useRef();
  useEffect(() => {
    spotLight.current.shadow.camera.near = 0.1;
    spotLight.current.shadow.camera.far = 9;
  });
  return (
    <>
      <OrbitControls />
      <ambientLight intensity={0.5} color="#ffffff" />
      <spotLight
        ref={spotLight}
        castShadow
        args={[0xffffff, 1, 0, Math.PI / 3, 0.3]}
        position={[2, 5, 0]}
        shadow-bias={0.0001}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
}
