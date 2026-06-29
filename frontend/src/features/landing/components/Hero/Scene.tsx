"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Instances, Instance, Box, Sphere, Cylinder, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

// 1. Ambient Particle Field
const ParticleField = ({ count = 400 }) => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
        ],
        scale: Math.random() * 0.03 + 0.01,
      });
    }
    return temp;
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <Instances limit={count} range={count}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#0EA5E9" transparent opacity={0.3} />
        {particles.map((data, i) => (
          <Instance key={i} position={data.position as [number, number, number]} scale={data.scale} />
        ))}
      </Instances>
    </group>
  );
};

// 2. The AI Working Robot
const WorkingRobot = () => {
  const robotGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  const panelRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Robot floating & looking around
    if (robotGroupRef.current) {
      // Gentle hover
      robotGroupRef.current.position.y = Math.sin(t) * 0.2;
      // Head tracks slightly towards the mouse
      if (headRef.current) {
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, (state.pointer.x * Math.PI) / 6, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -(state.pointer.y * Math.PI) / 8, 0.1);
      }
    }

    // Hands typing animation
    if (leftHandRef.current && rightHandRef.current) {
      leftHandRef.current.position.y = -0.5 + Math.sin(t * 8) * 0.05;
      leftHandRef.current.position.z = 0.8 + Math.cos(t * 5) * 0.05;
      
      rightHandRef.current.position.y = -0.5 + Math.cos(t * 7) * 0.05;
      rightHandRef.current.position.z = 0.8 + Math.sin(t * 6) * 0.05;
    }

    // Holographic panel scanning
    if (panelRef.current) {
      panelRef.current.position.y = -0.2 + Math.sin(t * 2) * 0.02;
    }
  });

  return (
    <group position={[3, 0, 0]} ref={robotGroupRef}>
      {/* --- ROBOT BODY --- */}
      <group>
        {/* Main Torso */}
        <Cylinder args={[0.5, 0.4, 1.2, 32]} position={[0, -0.6, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </Cylinder>
        
        {/* Core Light */}
        <Sphere args={[0.15, 32, 32]} position={[0, -0.4, 0.45]}>
          <meshBasicMaterial color="#0EA5E9" />
        </Sphere>
        <pointLight position={[0, -0.4, 0.5]} color="#0EA5E9" intensity={2} distance={2} />

        {/* Head */}
        <group position={[0, 0.4, 0]}>
          {/* Neck */}
          <Cylinder args={[0.1, 0.1, 0.3, 16]} position={[0, -0.2, 0]}>
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
          </Cylinder>
          
          <Sphere ref={headRef} args={[0.4, 64, 64]}>
            <MeshTransmissionMaterial 
              backside
              samples={4}
              thickness={0.5}
              chromaticAberration={0.5}
              anisotropy={0.3}
              distortion={0.2}
              distortionScale={0.5}
              temporalDistortion={0.1}
              color="#6366F1"
              resolution={256}
            />
            {/* Eye / Visor Light */}
            <Box args={[0.4, 0.1, 0.2]} position={[0, 0.1, 0.3]}>
              <meshBasicMaterial color="#0EA5E9" />
            </Box>
          </Sphere>
        </group>

        {/* Floating Hands */}
        <Box ref={leftHandRef} args={[0.15, 0.1, 0.2]} position={[-0.6, -0.5, 0.8]} rotation={[0.2, 0.2, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </Box>
        <Box ref={rightHandRef} args={[0.15, 0.1, 0.2]} position={[0.6, -0.5, 0.8]} rotation={[0.2, -0.2, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </Box>
      </group>

      {/* --- HOLOGRAPHIC WORKSTATION --- */}
      <group ref={panelRef} position={[0, -0.2, 1.2]} rotation={[-0.3, 0, 0]}>
        {/* Main Screen */}
        <Box args={[1.8, 1, 0.02]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#0EA5E9" transparent opacity={0.15} wireframe />
        </Box>
        {/* Side Panels */}
        <Box args={[0.6, 0.8, 0.02]} position={[-1.2, 0, 0.2]} rotation={[0, 0.4, 0]}>
          <meshBasicMaterial color="#6366F1" transparent opacity={0.2} wireframe />
        </Box>
        <Box args={[0.6, 0.8, 0.02]} position={[1.2, 0, 0.2]} rotation={[0, -0.4, 0]}>
          <meshBasicMaterial color="#6366F1" transparent opacity={0.2} wireframe />
        </Box>
        
        {/* Data Stream Particles on Screen */}
        <Instances limit={20} range={20} position={[0, 0, 0.05]}>
          <boxGeometry args={[0.1, 0.02, 0.01]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          {Array.from({ length: 20 }).map((_, i) => (
            <Instance 
              key={i} 
              position={[(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 0.8, 0]} 
            />
          ))}
        </Instances>
      </group>
    </group>
  );
};

export default function Scene() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#6366F1" />
        
        <ParticleField count={400} />
        
        {/* Wrapper to allow mouse interaction tracking */}
        <group>
          <WorkingRobot />
        </group>

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
