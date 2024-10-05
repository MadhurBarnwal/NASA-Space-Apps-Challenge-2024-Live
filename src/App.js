import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

function Sun() {
  const sunRef = useRef();
  const [scale, setScale] = useState(1);

  useFrame(() => {
    // Pulsate the scale of the sun to create a glowing effect
    setScale((prev) => (prev >= 1.2 ? 1 : prev + 0.01));
    sunRef.current.scale.set(scale, scale, scale);
  });

  return (
    <>
      {/* Glowing outer sphere */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.6} />
      </mesh>

      {/* Solid inner sun */}
      <mesh>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="orange" />
      </mesh>
    </>
  );
}

function Earth() {
  const earthRef = useRef();
  const [angle, setAngle] = useState(0);

  useFrame(() => {
    setAngle((prev) => prev + 0.01);
    earthRef.current.position.x = 15 * Math.cos(angle);
    earthRef.current.position.z = 15 * Math.sin(angle);
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

function JWST() {
  const jwstRef = useRef();
  const [angle, setAngle] = useState(0);

  useFrame(() => {
    setAngle((prev) => prev + 0.02);
    jwstRef.current.position.x = 15 + 3 * Math.cos(angle);
    jwstRef.current.position.z = 3 * Math.sin(angle);
  });

  return (
    <mesh ref={jwstRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gold" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }}
      gl={{ alpha: false }}
      camera={{ position: [0, 20, 30], fov: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000'); // Set background to black
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />

      {/* Enhanced stars */}
      <Stars 
        radius={70}
        depth={50}
        count={3000}
        factor={7}
        saturation={20}
        fade={true}
      />
      
      {/* Sun, Earth, and JWST */}
      <Sun />
      <Earth />
      <JWST />
    </Canvas>
  );
}

export default App;
