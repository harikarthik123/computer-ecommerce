import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

function RoomShell() {
	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
				<planeGeometry args={[24, 24]} />
				<meshStandardMaterial color="#0f172a" />
			</mesh>

			<mesh position={[0, 3, -12]}>
				<boxGeometry args={[24, 6, 0.2]} />
				<meshStandardMaterial color="#1e293b" />
			</mesh>
			<mesh position={[0, 3, 12]}>
				<boxGeometry args={[24, 6, 0.2]} />
				<meshStandardMaterial color="#1e293b" />
			</mesh>
			<mesh position={[-12, 3, 0]}>
				<boxGeometry args={[0.2, 6, 24]} />
				<meshStandardMaterial color="#1e293b" />
			</mesh>
			<mesh position={[12, 3, 0]}>
				<boxGeometry args={[0.2, 6, 24]} />
				<meshStandardMaterial color="#1e293b" />
			</mesh>

			{/* Demo obstacles */}
			<mesh position={[-4, 1, -2]} castShadow>
				<boxGeometry args={[3, 2, 2]} />
				<meshStandardMaterial color="#334155" />
			</mesh>
			<mesh position={[3, 1, 4]} castShadow>
				<boxGeometry args={[4, 2, 2.5]} />
				<meshStandardMaterial color="#475569" />
			</mesh>
			<mesh position={[1, 1, -6]} castShadow>
				<boxGeometry args={[2.5, 2, 2.5]} />
				<meshStandardMaterial color="#3f3f46" />
			</mesh>
		</group>
	);
}

function CameraUnit({ cam, active }) {
	return (
		<group position={cam.position} rotation={cam.rotation}>
			<mesh castShadow>
				<boxGeometry args={[0.45, 0.25, 0.25]} />
				<meshStandardMaterial color={active ? "#06b6d4" : "#94a3b8"} emissive={active ? "#083344" : "#111827"} />
			</mesh>
			<mesh position={[0, 0, -0.45]}>
				<coneGeometry args={[0.28, 0.8, 18, 1, true]} />
				<meshStandardMaterial
					color={active ? "#22d3ee" : "#64748b"}
					transparent
					opacity={active ? 0.35 : 0.2}
					side={2}
				/>
			</mesh>
			<mesh position={[0, 0, 0.14]}>
				<sphereGeometry args={[0.06, 16, 16]} />
				<meshStandardMaterial color={active ? "#22d3ee" : "#f8fafc"} emissive={active ? "#164e63" : "#111827"} />
			</mesh>
		</group>
	);
}

function SceneCore({ cameras, activeId }) {
	return (
		<>
			<ambientLight intensity={0.5} />
			<directionalLight position={[8, 12, 6]} intensity={1.1} castShadow />
			<pointLight position={[-8, 6, -8]} intensity={0.6} />

			<RoomShell />
			{cameras.map((cam) => (
				<CameraUnit key={cam.id} cam={cam} active={cam.id === activeId} />
			))}
		</>
	);
}

export function CameraPlacementViewer({ cameras, activeCameraId }) {
	return (
		<div className="h-[420px] w-full overflow-hidden rounded-2xl border border-cyan-200/20 bg-slate-950">
			<Canvas shadows>
				<PerspectiveCamera makeDefault position={[15, 11, 15]} fov={48} />
				<SceneCore cameras={cameras} activeId={activeCameraId} />
				<OrbitControls enablePan enableZoom maxDistance={34} minDistance={7} />
			</Canvas>
		</div>
	);
}

export function CameraPOVViewer({ cameras, cameraConfig }) {
	const cameraRef = useRef(null);

	useEffect(() => {
		if (!cameraRef.current) return;

		const target = cameraConfig.povTarget || [0, 1.6, 0];
		cameraRef.current.lookAt(target[0], target[1], target[2]);
		cameraRef.current.updateProjectionMatrix();
	}, [cameraConfig]);

	const cameraPos = cameraConfig.position || [0, 3, 10];

	return (
		<div className="h-44 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
			<Canvas>
				<PerspectiveCamera
					ref={cameraRef}
					makeDefault
					position={cameraPos}
					fov={72}
					near={0.1}
					far={100}
				/>
				<SceneCore cameras={cameras} activeId={cameraConfig.id} />
			</Canvas>
		</div>
	);
}

