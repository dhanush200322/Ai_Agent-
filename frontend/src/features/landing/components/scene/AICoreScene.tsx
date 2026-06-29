"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#D4AF37"
          emissive="#8A6A16"
          emissiveIntensity={2}
          wireframe
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={1}
        />
      </Sphere>
      
      {/* Inner solid core */}
      <Sphere args={[1.2, 32, 32]}>
        <meshStandardMaterial color="#000000" emissive="#050505" />
      </Sphere>
    </Float>
  );
}

function OrbitRings() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef1.current) {
      ringRef1.current.rotation.x = state.clock.elapsedTime * 0.5;
      ringRef1.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.x = state.clock.elapsedTime * -0.3;
      ringRef2.current.rotation.z = state.clock.elapsedTime * 0.4;
    }
    if (ringRef3.current) {
      ringRef3.current.rotation.y = state.clock.elapsedTime * 0.6;
      ringRef3.current.rotation.z = state.clock.elapsedTime * -0.2;
    }
  });

  return (
    <>
      <mesh ref={ringRef1}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshStandardMaterial color="#F7D774" emissive="#D4AF37" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[3.2, 0.015, 16, 100]} />
        <meshStandardMaterial color="#8A6A16" emissive="#8A6A16" emissiveIntensity={1} />
      </mesh>
      <mesh ref={ringRef3}>
        <torusGeometry args={[4, 0.01, 16, 100]} />
        <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={1.5} />
      </mesh>
    </>
  );
}

function NodesConnection() {
  // Simple particle system for data flow
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 4;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F7D774" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export function AICoreScene() {
  return (
    <div className="w-full h-full pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8A6A16" />

        <group position={[0, 0, 0]}>
          <CoreSphere />
          <OrbitRings />
          <NodesConnection />
          
          <Sparkles count={500} scale={12} size={2} speed={0.4} color="#D4AF37" opacity={0.6} />
          <Stars radius={10} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        </group>

        {/* Orbit controls limited to a small arc for subtle interaction */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={0.5}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          <Noise opacity={0.05} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
