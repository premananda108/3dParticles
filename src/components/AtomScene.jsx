import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import Nucleus from './Nucleus'

export default function AtomScene({ protonCount, neutronCount }) {
    return (
        <div className="scene-container">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 50 }}
                gl={{ antialias: true }}
            >
                {/* Background stars */}
                <Stars
                    radius={100}
                    depth={50}
                    count={3000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={0.5}
                />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />
                <pointLight position={[0, 10, -10]} intensity={0.5} color="#ff4444" />

                {/* Environment for reflections */}
                <Environment preset="night" />

                {/* The nucleus */}
                <Nucleus protonCount={protonCount} neutronCount={neutronCount} />

                {/* Camera controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={false}
                    minDistance={3}
                    maxDistance={30}
                />
            </Canvas>
        </div>
    )
}
