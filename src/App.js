import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { TextureLoader } from 'three';
// Constants for distances
const AU = 15; // Distance of Earth from the Sun (in arbitrary units)
// Sun Component
function Sun() {
  const sunRef = useRef();
  const [scale, setScale] = useState(0.95);
  const [direction, setDirection] = useState(1); // 1 for increasing, -1 for decreasing  
  // Load the Sun texture
  const textureUrl = `${process.env.PUBLIC_URL}/textures/sun.jpg`;
  const sunTexture = useLoader(THREE.TextureLoader, textureUrl);
  useFrame(() => {
    setScale((prev) => {
      // Update scale based on current direction
      const newScale = prev + 0.00 * direction;
      
      // Check if we need to switch direction
      if (newScale >= 1) {
        setDirection(-1); // Switch to decreasing
        return 1; // Cap at 1
      } else if (newScale <= 0.9) {
        setDirection(1); // Switch to increasing
        return 0.9; // Cap at 0.9
      }
      
      return newScale; // Return the new scale
    });
    
    // Set the scale of the Sun
    sunRef.current.scale.set(scale, scale, scale);
  });


  return (
    <>
      <mesh ref={sunRef}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshStandardMaterial map={sunTexture} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1,6, 32, 32]} />
        <meshBasicMaterial color="orange" />
      </mesh>
    </>
  );
}


// Earth Component with Texture
function Earth() {
  const earthRef = useRef();
  const [angle, setAngle] = useState(0);
  const [earthLabelPosition, setEarthLabelPosition] = useState([0, 0, 0]); // Store label position

  const textureUrl = `${process.env.PUBLIC_URL}/textures/Earth1.jpg`;
  const earthTexture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame(() => {
    setAngle((prev) => prev + 0.01);
    if (earthRef.current) { // Ensure earthRef.current is defined
      const xPos = AU * Math.cos(angle);
      const zPos = AU * Math.sin(angle);
      earthRef.current.position.set(xPos, 0, zPos);
      
      // Update the label position based on earth's position
      setEarthLabelPosition([xPos, -2, zPos]); // Adjust label's Y position if needed
    }
  });

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial map={earthTexture} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[AU, 0.1, 16, 100]} />
        <meshBasicMaterial color="lightblue" transparent opacity={0.4} />
      </mesh>

      {/* Earth Label */}
      <Html position={earthLabelPosition}>
        <div style={{ color: 'rgb(115, 206, 235)' }}>Earth</div>
      </Html>
    </>
  );
}

//Nebula Background
function NebulaBackground() {
  const texture = useLoader(TextureLoader, process.env.PUBLIC_URL + "/textures/Nebula.png");
  
  return (
    <mesh position={[0, 0, -70]}> {/* Position the nebula in the background */}
      <planeGeometry args={[300, 300]} /> {/* Large plane for the nebula */}
      <meshBasicMaterial map={texture} side={2} /> {/* Ensure the nebula is visible from both sides */}
    </mesh>
  );
}

// L2Point Component
function L2Point() {
  const l2Ref = useRef();
  const [l2Angle, setL2Angle] = useState(0);
  const L2_RADIUS = AU + 6;

  const textureUrl = `${process.env.PUBLIC_URL}/textures/RedL2.png`;
  const l2Texture = useLoader(THREE.TextureLoader, textureUrl);

  useFrame(() => {
    setL2Angle((prev) => prev + 0.01);
    l2Ref.current.position.x = L2_RADIUS * Math.cos(l2Angle);
    l2Ref.current.position.z = L2_RADIUS * Math.sin(l2Angle);
    l2Ref.current.position.y = 0;
  });

  return (
    <>
      <mesh ref={l2Ref}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial map={l2Texture} transparent opacity={0.99} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[L2_RADIUS, 0.05, 16, 100]} />
        <meshBasicMaterial color="purple" transparent opacity={0.5} />
      </mesh>

      {/* L2 Point Label */}
      <Html position={[L2_RADIUS * Math.cos(l2Angle), -2, L2_RADIUS * Math.sin(l2Angle)]}>
        <div style={{ color: 'rgb(225, 40, 40)' }}>L2 Point</div>
      </Html>
    </>
  );
}





// JWST Component
function JWST() {
  const jwstRef = useRef();
  const [angle, setAngle] = useState(0);
  const L2_RADIUS = AU + 5;
  const JWST_DISTANCE = 3;

  const [l2Angle, setL2Angle] = useState(0);
  const [jwstPosition, setJwstPosition] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    setL2Angle((prev) => prev + 0.01);
    const l2X = L2_RADIUS * Math.cos(l2Angle);
    const l2Z = L2_RADIUS * Math.sin(l2Angle);

    const jwstX = l2X + JWST_DISTANCE * Math.cos(angle);
    const jwstY = JWST_DISTANCE * Math.sin(angle);
    const jwstZ = l2Z + JWST_DISTANCE * Math.sin(angle);

    jwstRef.current.position.set(jwstX, jwstY, jwstZ);
    setJwstPosition({ x: jwstX, y: jwstY, z: jwstZ });
    setAngle((prev) => prev + 0.02);
  });

  return (
    <>
      <mesh ref={jwstRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gold" />
      </mesh>
      <mesh position={[jwstPosition.x, jwstPosition.y, jwstPosition.z]}>
        <torusGeometry args={[JWST_DISTANCE, 0.05, 16, 100]} />
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>

      {/* JWST Label */}
      <Html position={[jwstPosition.x, jwstPosition.y + 1, jwstPosition.z]}><div style={{ color: 'rgb(255, 215, 0)' }}>JWST</div></Html>
    </>
  );
}

// AxisArrows Component
function AxisArrows() {
  const arrowLength = 10; 
  const arrowHeadLength = 1; 
  const arrowHeadWidth = 0.5; 

  const xDirection = new THREE.Vector3(1, 0, 0); 
  const yDirection = new THREE.Vector3(0, 1, 0); 
  const zDirection = new THREE.Vector3(0, 0, 1); 

  const xArrow = new THREE.ArrowHelper(xDirection, new THREE.Vector3(0, 0, 0), arrowLength, 0xff0000, arrowHeadLength, arrowHeadWidth); 
  const yArrow = new THREE.ArrowHelper(yDirection, new THREE.Vector3(0, 0, 0), arrowLength, 0x00ff00, arrowHeadLength, arrowHeadWidth); 
  const zArrow = new THREE.ArrowHelper(zDirection, new THREE.Vector3(0, 0, 0), arrowLength, 0x0000ff, arrowHeadLength, arrowHeadWidth); 

  return (
    <>
      <primitive object={xArrow} />
      <primitive object={yArrow} />
      <primitive object={zArrow} />
      <Html position={[arrowLength, 0, 0]}><div style={{ color: 'red' }}>X</div></Html>
      <Html position={[0, arrowLength, 0]}><div style={{ color: 'green' }}>Y</div></Html>
      <Html position={[0, 0, arrowLength]}><div style={{ color: 'blue' }}>Z</div></Html>
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
        gl.setClearColor('#000000'); 
      }}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <NebulaBackground />
      <Stars
       radius={70}
       depth={30}
       count={10000}
       factor={10}
       saturation={30}
       fade={true} 
        />
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
