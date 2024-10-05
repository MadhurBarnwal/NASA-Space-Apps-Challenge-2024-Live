import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

const AU = 15; // Distance of Earth from the Sun (in arbitrary units)
const JWST_DISTANCE = 3; // Distance from Earth to JWST (in arbitrary units)

// Sun Component
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
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="yellow" transparent opacity={0.6} />
      </mesh>

      {/* Solid inner sun */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="orange" />
      </mesh>
    </>
  );
}

// Earth Component with Texture
function Earth() {
  const earthRef = useRef();
  const [angle, setAngle] = useState(0);
  
  // Load Earth texture
  const textureUrl = `${process.env.PUBLIC_URL}/textures/Earth1.jpg`; // Correct texture path
  const earthTexture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame(() => {
    setAngle((prev) => prev + 0.01); // Increment the angle for Earth's orbit
    earthRef.current.position.x = AU * Math.cos(angle); // X position
    earthRef.current.position.y = 0; // Keep Y constant
    earthRef.current.position.z = AU * Math.sin(angle); // Z position
  });

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial map={earthTexture} /> {/* Use the earthTexture here */}
      </mesh>

      {/* Earth Orbit in XZ plane */}
      <mesh rotation={[Math.PI / 2, 0, 0]}> {/* Rotated to XZ plane */}
        <torusGeometry args={[AU, 0.1, 16, 100]} />
        <meshBasicMaterial color="lightblue" transparent opacity={0.4} />
      </mesh>
    </>
  );
}


// L2Point Component
function L2Point() {
  const l2Ref = useRef();
  const [l2Angle, setL2Angle] = useState(0);
  const L2_RADIUS = AU + 5; // L2 is farther from the Sun than Earth (AU + 5 units)

  // Load L2 texture
  const textureUrl = `${process.env.PUBLIC_URL}/textures/RedL2.png`; // Path to the L2 texture
  const l2Texture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame(() => {
    // Increment the angle for L2's orbit
    setL2Angle((prev) => prev + 0.01); // Slower than Earth's orbit speed

    // L2's position in XZ plane
    l2Ref.current.position.x = L2_RADIUS * Math.cos(l2Angle); // X position
    l2Ref.current.position.z = L2_RADIUS * Math.sin(l2Angle); // Z position
    l2Ref.current.position.y = 0; // Y remains constant (XZ plane)
  });

  return (
    <>
      {/* L2 Point with texture */}
      <mesh ref={l2Ref}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial map={l2Texture} transparent opacity={0.8} /> {/* Use the loaded texture */}
      </mesh>

      {/* L2 Orbit (Dashed) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}> {/* Rotate the torus by 90 degrees to align with XZ plane */}        
        <torusGeometry args={[L2_RADIUS, 0.05, 16, 100]} />
        <meshBasicMaterial color="purple" transparent opacity={0.4} />
      </mesh>
    </>
  );
}

// JWST Component
function JWST() {
  const jwstRef = useRef();
  const [angle, setAngle] = useState(0);
  const L2_RADIUS = AU + 5; // L2 is farther from the Sun than Earth
  const JWST_DISTANCE = 3; // Distance from L2 to JWST

  // Use a single angle state to manage L2's orbit
  const [l2Angle, setL2Angle] = useState(0);

  // Define state for JWST's position
  const [jwstPosition, setJwstPosition] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    // Update the angle for L2's orbit
    setL2Angle((prev) => prev + 0.01); // Speed of L2’s revolution around the Sun

    // Calculate L2's position
    const l2X = L2_RADIUS * Math.cos(l2Angle); // L2 X position
    const l2Z = L2_RADIUS * Math.sin(l2Angle); // L2 Z position

    // JWST's local orbit around L2 in the XY plane
    const jwstX = l2X + JWST_DISTANCE * Math.cos(angle); // Orbiting L2 on X axis
    const jwstY = JWST_DISTANCE * Math.sin(angle); // Keep Y changing for the JWST orbit
    const jwstZ = l2Z + JWST_DISTANCE * Math.sin(angle); // Orbiting L2 on Z axis

    // Update JWST's position
    jwstRef.current.position.set(jwstX, jwstY, jwstZ);
    
    // Update state for rendering
    setJwstPosition({ x: jwstX, y: jwstY, z: jwstZ });

    // Increment the angle for JWST's orbit around L2
    setAngle((prev) => prev + 0.02); // JWST's speed in its local orbit
  });

  return (
    <>
      {/* JWST */}
      <mesh ref={jwstRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gold" />
      </mesh>

      {/* JWST Orbit (Dashed Lines) */}
      <mesh position={[jwstPosition.x, jwstPosition.y, jwstPosition.z]}>
        <torusGeometry args={[JWST_DISTANCE, 0.05, 16, 100]} />
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

// AxisArrows Component
function AxisArrows() {
  const arrowLength = 10; // Length of the arrows
  const arrowHeadLength = 1; // Head length of the arrow
  const arrowHeadWidth = 0.5; // Width of the arrow head

  const xDirection = new THREE.Vector3(1, 0, 0); // X direction
  const yDirection = new THREE.Vector3(0, 1, 0); // Y direction
  const zDirection = new THREE.Vector3(0, 0, 1); // Z direction

  // Create arrow helpers
  const xArrow = new THREE.ArrowHelper(xDirection, new THREE.Vector3(0, 0, 0), arrowLength, 0xff0000, arrowHeadLength, arrowHeadWidth); // X Axis in red
  const yArrow = new THREE.ArrowHelper(yDirection, new THREE.Vector3(0, 0, 0), arrowLength, 0x00ff00, arrowHeadLength, arrowHeadWidth); // Y Axis in green
  const zArrow = new THREE.ArrowHelper(zDirection, new THREE.Vector3(0, 0, 0), arrowLength, 0x0000ff, arrowHeadLength, arrowHeadWidth); // Z Axis in blue

  return (
    <>
      <primitive object={xArrow} />
      <primitive object={yArrow} />
      <primitive object={zArrow} />

      {/* Axis Labels */}
      <Html position={[arrowLength, 0, 0]}>
        <div style={{ color: 'red' }}>X</div>
      </Html>
      <Html position={[0, arrowLength, 0]}>
        <div style={{ color: 'green' }}>Y</div>
      </Html>
      <Html position={[0, 0, arrowLength]}>
        <div style={{ color: 'blue' }}>Z</div>
      </Html>
    </>
  );
}

// App Component
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
      <Stars />
      <OrbitControls />
      <Sun />
      <Earth />
      <L2Point />
      <JWST />
      <AxisArrows />
    </Canvas>
  );
}

export default App;
