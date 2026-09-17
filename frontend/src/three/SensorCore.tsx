import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { Group, Mesh } from "three";

function Core() {
  const shell = useRef<Group>(null);
  const ringA = useRef<Mesh>(null);
  const ringB = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const pointerX = state.pointer.x * 0.22;
    const pointerY = state.pointer.y * 0.16;
    if (shell.current) {
      shell.current.rotation.y += delta * 0.2;
      shell.current.rotation.x += (pointerY - shell.current.rotation.x) * 0.04;
      shell.current.rotation.z += (-pointerX - shell.current.rotation.z) * 0.04;
    }
    if (ringA.current) ringA.current.rotation.z -= delta * 0.34;
    if (ringB.current) ringB.current.rotation.x += delta * 0.22;
  });

  return (
    <group ref={shell}>
      <pointLight color="#00f5d4" position={[2.4, 2.2, 2.8]} intensity={5} distance={7} />
      <pointLight color="#ff6b6b" position={[-2.6, -1.4, 1.6]} intensity={3} distance={6} />
      <Float speed={1.4} rotationIntensity={0.18} floatIntensity={0.24}>
        <mesh>
          <icosahedronGeometry args={[0.95, 5]} />
          <meshPhysicalMaterial
            color="#dff9ff"
            metalness={0.18}
            roughness={0.18}
            transmission={0.4}
            thickness={0.7}
            emissive="#00f5d4"
            emissiveIntensity={0.18}
          />
        </mesh>
        <mesh ref={ringA} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.42, 0.012, 12, 160]} />
          <meshBasicMaterial color="#00f5d4" />
        </mesh>
        <mesh ref={ringB} rotation={[0.65, 0.2, 0.25]}>
          <torusGeometry args={[1.78, 0.009, 12, 180]} />
          <meshBasicMaterial color="#ffb703" />
        </mesh>
        <mesh rotation={[0.2, 0.1, -0.25]}>
          <torusGeometry args={[2.08, 0.006, 10, 180]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
      </Float>
      <Sparkles count={90} scale={[5.5, 3.3, 3.3]} size={3.8} speed={0.42} color="#dff9ff" />
    </group>
  );
}

export default function SensorCore() {
  return (
    <div className="sensor-canvas" aria-hidden="true">
      <Canvas dpr={[1, 1.7]} camera={{ position: [0, 0.25, 5.3], fov: 42 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Core />
        </Suspense>
      </Canvas>
    </div>
  );
}

