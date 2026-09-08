import { Box } from "./kit";

const PINK = "#ff4d9a";
const LIME = "#b8ff3c";
const ORANGE = "#ff8a3d";
const VIOLET = "#9b5cff";
const CYAN = "#3de7ff";
const CREAM = "#fff6d8";
const INK = "#1a1020";

/** Bold new-age dino café + lunch vend — west atrium. */
export function DinoLoveLounge() {
  return (
    <group>
      <DinoCafe />
      <LunchVend />
      <FunkyAccents />
    </group>
  );
}

function DinoCafe() {
  return (
    <group position={[-12.2, 0, 12.1]}>
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} position={[0.6, 0.03, -0.4]}>
        <circleGeometry args={[3.6, 36]} />
        <meshStandardMaterial color="#2a1430" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} position={[0.6, 0.04, -0.4]}>
        <ringGeometry args={[2.9, 3.45, 40]} />
        <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0.15]} position={[0.6, 0.045, -0.4]}>
        <ringGeometry args={[1.6, 1.95, 32]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.45} />
      </mesh>

      <CafeBar />
      <NeonSign text="EGGPRESSO" position={[0.4, 2.55, -0.15]} color={PINK} />
      <NeonSign text="DINO LOVE" position={[0.4, 2.15, -0.15]} color={LIME} scale={0.72} />

      <DrinksDispenser position={[-2.35, 0, 0.35]} rotY={0.4} />

      <CafeTable position={[1.55, 0, -1.85]} top={ORANGE} />
      <CafeTable position={[-0.55, 0, -2.15]} top={VIOLET} />
      <BoldChair position={[1.15, 0, -1.35]} rotY={0.4} color={CYAN} />
      <BoldChair position={[2.05, 0, -1.35]} rotY={-0.35} color={PINK} />
      <BoldChair position={[-0.95, 0, -1.65]} rotY={0.5} color={LIME} />
      <BoldChair position={[-0.05, 0, -1.7]} rotY={-0.45} color={ORANGE} />

      <EggStool position={[1.85, 0, 0.55]} color={CYAN} />
      <EggStool position={[1.15, 0, 0.75]} color={PINK} />
      <EggStool position={[0.45, 0, 0.55]} color={LIME} />

      <HeartBalloon position={[2.8, 1.9, -0.6]} color={PINK} />
      <HeartBalloon position={[-2.6, 2.1, -1.4]} color={VIOLET} />
    </group>
  );
}

function CafeBar() {
  return (
    <group position={[1.8, 0, 0.1]}>
      <Box position={[0, 0.48, 0]} size={[2.6, 0.96, 0.85]} color={INK} metal={0.15} rough={0.45} />
      <Box position={[0, 0.98, 0]} size={[2.7, 0.08, 0.92]} color={PINK} metal={0.25} rough={0.35} />
      <Box position={[0, 0.22, 0.44]} size={[2.5, 0.08, 0.06]} color={LIME} emissive={LIME} eInt={0.7} />
      <Box position={[-0.7, 1.22, 0.05]} size={[0.55, 0.42, 0.4]} color="#2a2c34" metal={0.45} />
      <mesh position={[-0.7, 1.52, 0.05]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 12]} />
        <meshStandardMaterial color="#1c1e22" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 1.18, 0.1]}>
        <cylinderGeometry args={[0.05, 0.06, 0.16, 10]} />
        <meshStandardMaterial color={CREAM} roughness={0.4} />
      </mesh>
      <mesh position={[0.35, 1.18, 0.05]}>
        <cylinderGeometry args={[0.05, 0.06, 0.16, 10]} />
        <meshStandardMaterial color={CREAM} roughness={0.4} />
      </mesh>
      <mesh position={[0.85, 1.28, 0]}>
        <boxGeometry args={[0.7, 0.55, 0.12]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.35} />
      </mesh>
      <DinoSilhouette position={[0.85, 1.28, 0.08]} />
    </group>
  );
}

function LunchVend() {
  return (
    <group position={[-15.6, 0, 6.4]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.4, 0.03, 0.2]}>
        <planeGeometry args={[5.2, 4.6]} />
        <meshStandardMaterial color="#241028" roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.4, 0.04, 0.2]}>
        <ringGeometry args={[1.7, 2.15, 28]} />
        <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.4} />
      </mesh>

      <NeonSign text="FEED THE PACK" position={[1.5, 2.65, -1.35]} color={ORANGE} scale={0.78} />
      <NeonSign text="LUNCH · LOVE · LEFTOVERS" position={[1.5, 2.28, -1.35]} color={CYAN} scale={0.55} />

      <VendingMachine position={[-0.15, 0, -1.15]} rotY={0} accent={PINK} label="#FF" />
      <VendingMachine position={[1.15, 0, -1.15]} rotY={0} accent={LIME} label="BITE" />
      <VendingMachine position={[2.45, 0, -1.15]} rotY={0} accent={VIOLET} label="YUM" />

      <DrinksDispenser position={[3.55, 0, -0.35]} rotY={-0.55} />

      <LunchTable position={[0.55, 0, 1.15]} top={LIME} />
      <LunchTable position={[2.35, 0, 1.25]} top={CYAN} />

      <BoldChair position={[0.1, 0, 0.7]} rotY={0.2} color={PINK} />
      <BoldChair position={[1.0, 0, 0.7]} rotY={-0.2} color={ORANGE} />
      <BoldChair position={[0.1, 0, 1.65]} rotY={Math.PI - 0.2} color={VIOLET} />
      <BoldChair position={[1.0, 0, 1.65]} rotY={Math.PI + 0.2} color={CYAN} />

      <BoldChair position={[1.9, 0, 0.8]} rotY={0.25} color={LIME} />
      <BoldChair position={[2.8, 0, 0.8]} rotY={-0.25} color={PINK} />
      <BoldChair position={[1.9, 0, 1.75]} rotY={Math.PI - 0.15} color={ORANGE} />
      <BoldChair position={[2.8, 0, 1.75]} rotY={Math.PI + 0.15} color={VIOLET} />

      <PlantPot position={[-0.7, 0, 1.8]} color={PINK} />
      <PlantPot position={[3.5, 0, 1.9]} color={LIME} />
    </group>
  );
}

function FunkyAccents() {
  return (
    <group>
      <NeonArch position={[-7.6, 0, 14.2]} rotY={0.15} />
      <mesh position={[-4.8, 3.8, 8.2]} rotation={[0, 0.4, 0]}>
        <torusGeometry args={[0.55, 0.06, 8, 24]} />
        <meshStandardMaterial color={PINK} emissive={PINK} emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[-5.4, 4.2, 7.6]} rotation={[0.3, -0.2, 0.4]}>
        <torusGeometry args={[0.35, 0.05, 8, 20]} />
        <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={0.8} />
      </mesh>
      <Box position={[-17.55, 2.4, 9.2]} size={[0.08, 2.8, 3.6]} color={VIOLET} emissive={VIOLET} eInt={0.25} />
      <Box position={[-17.52, 2.4, 9.2]} size={[0.04, 2.5, 0.12]} color={PINK} emissive={PINK} eInt={0.7} />
      <Box position={[-17.52, 2.4, 10.4]} size={[0.04, 2.5, 0.12]} color={LIME} emissive={LIME} eInt={0.7} />
      <Box position={[-17.52, 2.4, 8.0]} size={[0.04, 2.5, 0.12]} color={CYAN} emissive={CYAN} eInt={0.7} />
    </group>
  );
}

function DrinksDispenser({
  position,
  rotY = 0,
}: {
  position: [number, number, number];
  rotY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 0.95, 0]} size={[0.85, 1.9, 0.7]} color={INK} metal={0.2} rough={0.4} />
      <Box position={[0, 1.95, 0]} size={[0.92, 0.12, 0.76]} color={CYAN} emissive={CYAN} eInt={0.55} />
      <Box position={[0, 1.35, 0.32]} size={[0.7, 0.85, 0.08]} color="#102028" metal={0.35} />
      {([-0.22, 0, 0.22] as const).map((x, i) => (
        <group key={x}>
          <mesh position={[x, 1.55, 0.38]}>
            <cylinderGeometry args={[0.05, 0.05, 0.12, 8]} />
            <meshStandardMaterial
              color={[PINK, LIME, ORANGE][i]}
              emissive={[PINK, LIME, ORANGE][i]}
              emissiveIntensity={0.7}
            />
          </mesh>
          <mesh position={[x, 1.15, 0.36]}>
            <cylinderGeometry args={[0.06, 0.05, 0.14, 8]} />
            <meshStandardMaterial color={CREAM} roughness={0.35} />
          </mesh>
        </group>
      ))}
      <Box position={[0, 0.35, 0.2]} size={[0.7, 0.08, 0.45]} color={VIOLET} emissive={VIOLET} eInt={0.4} />
      <NeonSign text="SIP" position={[0, 2.2, 0.05]} color={CYAN} scale={0.55} />
    </group>
  );
}

function VendingMachine({
  position,
  rotY = 0,
  accent,
  label,
}: {
  position: [number, number, number];
  rotY?: number;
  accent: string;
  label: string;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 1.1, 0]} size={[1.05, 2.2, 0.75]} color={INK} metal={0.18} rough={0.42} />
      <Box position={[0, 1.25, 0.34]} size={[0.85, 1.35, 0.06]} color="#0e1820" metal={0.4} />
      {[0.55, 0.95, 1.35, 1.75].map((y, row) =>
        ([-0.22, 0, 0.22] as const).map((x, col) => (
          <Box
            key={`${row}-${col}`}
            position={[x, y, 0.38]}
            size={[0.18, 0.14, 0.1]}
            color={[PINK, LIME, ORANGE, CYAN, VIOLET, CREAM][(row * 3 + col) % 6]}
            metal={0.1}
            rough={0.5}
          />
        )),
      )}
      <Box position={[0, 0.28, 0.2]} size={[0.7, 0.22, 0.35]} color={accent} emissive={accent} eInt={0.45} />
      <Box position={[0, 2.28, 0]} size={[1.1, 0.1, 0.8]} color={accent} emissive={accent} eInt={0.6} />
      <NeonSign text={label} position={[0, 2.45, 0.05]} color={accent} scale={0.5} />
    </group>
  );
}

function CafeTable({ position, top }: { position: [number, number, number]; top: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.7, 8]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 20]} />
        <meshStandardMaterial color={top} emissive={top} emissiveIntensity={0.22} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 12]} />
        <meshStandardMaterial color={INK} roughness={0.6} />
      </mesh>
    </group>
  );
}

function LunchTable({ position, top }: { position: [number, number, number]; top: string }) {
  return (
    <group position={position}>
      <Box position={[0, 0.4, 0]} size={[0.08, 0.7, 0.08]} color="#3a2a18" />
      <Box position={[0, 0.78, 0]} size={[1.35, 0.08, 0.85]} color={top} metal={0.12} rough={0.4} />
      <Box position={[0, 0.84, 0]} size={[1.2, 0.02, 0.08]} color={PINK} emissive={PINK} eInt={0.5} />
      <Box position={[-0.5, 0.12, -0.28]} size={[0.1, 0.24, 0.1]} color={INK} />
      <Box position={[0.5, 0.12, -0.28]} size={[0.1, 0.24, 0.1]} color={INK} />
      <Box position={[-0.5, 0.12, 0.28]} size={[0.1, 0.24, 0.1]} color={INK} />
      <Box position={[0.5, 0.12, 0.28]} size={[0.1, 0.24, 0.1]} color={INK} />
    </group>
  );
}

function BoldChair({
  position,
  rotY = 0,
  color,
}: {
  position: [number, number, number];
  rotY?: number;
  color: string;
}) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[0, 0.32, 0]} size={[0.55, 0.1, 0.52]} color={color} metal={0.1} rough={0.5} />
      <Box position={[0, 0.58, -0.2]} size={[0.55, 0.5, 0.1]} color={color} metal={0.1} rough={0.5} />
      <Box position={[-0.2, 0.14, -0.18]} size={[0.08, 0.28, 0.08]} color={INK} />
      <Box position={[0.2, 0.14, -0.18]} size={[0.08, 0.28, 0.08]} color={INK} />
      <Box position={[-0.2, 0.14, 0.18]} size={[0.08, 0.28, 0.08]} color={INK} />
      <Box position={[0.2, 0.14, 0.18]} size={[0.08, 0.28, 0.08]} color={INK} />
    </group>
  );
}

function EggStool({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.12, 10]} />
        <meshStandardMaterial color={INK} roughness={0.55} />
      </mesh>
    </group>
  );
}

function NeonSign({
  text,
  position,
  color,
  scale = 1,
}: {
  text: string;
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const w = Math.max(1.2, text.length * 0.19) * scale;
  return (
    <group position={position} scale={scale}>
      <Box position={[0, 0, -0.04]} size={[w + 0.25, 0.42, 0.08]} color={INK} metal={0.3} />
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[w, 0.28]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Letter blocks spell a bold strip — readable as neon bar in-world */}
      {text
        .replace(/\s/g, "")
        .slice(0, 10)
        .split("")
        .map((_, i, arr) => (
          <Box
            key={i}
            position={[(i - (arr.length - 1) / 2) * 0.17, 0, 0.05]}
            size={[0.12, 0.2, 0.04]}
            color={color}
            emissive={color}
            eInt={0.85}
          />
        ))}
    </group>
  );
}

function NeonArch({ position, rotY = 0 }: { position: [number, number, number]; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Box position={[-0.85, 1.1, 0]} size={[0.1, 2.2, 0.1]} color={PINK} emissive={PINK} eInt={0.65} />
      <Box position={[0.85, 1.1, 0]} size={[0.1, 2.2, 0.1]} color={LIME} emissive={LIME} eInt={0.65} />
      <mesh position={[0, 2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.9, 0.07, 8, 20, Math.PI]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.75} />
      </mesh>
    </group>
  );
}

function HeartBalloon({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[-0.08, 0.08, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.08, 0.08, 0]}>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.2, 0.28, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
        <meshStandardMaterial color={CREAM} />
      </mesh>
    </group>
  );
}

function DinoSilhouette({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <mesh position={[0.12, 0.02, 0]} rotation={[0, 0, -0.6]}>
        <coneGeometry args={[0.05, 0.16, 6]} />
        <meshStandardMaterial color={INK} />
      </mesh>
    </group>
  );
}

function PlantPot({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.4, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.28, 10, 8]} />
        <meshStandardMaterial color="#3ecf6a" roughness={0.75} />
      </mesh>
    </group>
  );
}
