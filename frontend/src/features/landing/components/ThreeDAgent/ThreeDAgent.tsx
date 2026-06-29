"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Torus, Points, PointMaterial, Trail, Html } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const coreRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005;
      coreRef.current.rotation.x += 0.002;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={coreRef} args={[1.5, 64, 64]}>
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#4F8CFF"
          emissiveIntensity={2}
          wireframe
          transparent
          opacity={0.8}
        />
      </Sphere>
      {/* Inner Solid Core */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial 
          color="#0EA5E9"
          emissive="#0EA5E9"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
}

function OrbitRing({ radius, speed, color, nodes, label }: { radius: number, speed: number, color: string, nodes: number, label: string }) {
  const ringRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += speed;
      ringRef.current.rotation.x += speed * 0.2;
    }
  });

  return (
    <group ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
      <Torus args={[radius, 0.02, 16, 100]}>
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </Torus>
      {Array.from({ length: nodes }).map((_, i) => {
        const angle = (i / nodes) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, y, 0]}>
            <Trail width={0.5} color={color} length={2} decay={1} local>
              <Sphere args={[0.15, 16, 16]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
              </Sphere>
            </Trail>
            {i === 0 && (
              <Html distanceFactor={15} center>
                <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded border border-white/10 text-[10px] text-white/80 uppercase tracking-wider whitespace-nowrap">
                  {label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Particles() {
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 5;
      const z = (Math.random() - 0.5) * 8;
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(theta);
      pos[i * 3 + 2] = z;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.z -= 0.0005;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial transparent color="#8B5CF6" size={0.05} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

function CameraRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.pointer.x * Math.PI) / 10, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (state.pointer.y * Math.PI) / 10, 0.05);
    }
  });
  return <group ref={group}>{children}</group>;
}

export const ThreeDAgent = () => {
  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4F8CFF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
        
        <CameraRig>
          <group position={[3, 0, 0]}>
            <Core />
            <OrbitRing radius={3} speed={0.003} color="#4F8CFF" nodes={3} label="Knowledge Node" />
            <OrbitRing radius={4.5} speed={-0.002} color="#0EA5E9" nodes={4} label="Agent Node" />
            <OrbitRing radius={6} speed={0.0015} color="#8B5CF6" nodes={5} label="Workflow Node" />
            <Particles />
          </group>
        </CameraRig>
      </Canvas>
    </div>
  );
};
