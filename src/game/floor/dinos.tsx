import { DoubleSide } from "three";
import { Box } from "./kit";
import { useCutoutTexture } from "../textures";
import { useQuality } from "../quality";
import { FLOOR_DESKS } from "./layout";

const REX_SRC = "/characters/rex/full.png?v=3";
const GREEN = "#3a7a48";
const SHIRT = "#f4f1ea";
const TIE = "#6b1c32";

export type DinoSpecies = "raptor" | "anky" | "trike" | "ptera";

/** Floor Chief — keyed render of the updated walking figure. Faces +Z at rotY 0. */
export function RexCutout({
  position,
  rotY = 0,
  height = 1.92,
}: {
  position: [number, number, number];
  rotY?: number;
  height?: number;
}) {
  const cut = useCutoutTexture(REX_SRC);
  const w = cut ? height * cut.aspect : height * 0.66;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.08]}>
        <circleGeometry args={[0.32, 12]} />
        <meshBasicMaterial color="#0a0c10" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      {cut ? (
        <mesh position={[0, height / 2, 0]}>
          <planeGeometry args={[w, height]} />
          <meshBasicMaterial
            map={cut.map}
            transparent
            alphaTest={0.12}
            toneMapped={false}
            side={DoubleSide}
            depthWrite
          />
        </mesh>
      ) : null}
    </group>
  );
}

/**
 * Suited dinosaur staff. Local forward is −Z (same as player yaw), so pass sitYaw / look yaw directly.
 */
export function SuitDino({
  position,
  rotY = 0,
  species = "raptor",
  pose = "stand",
  suit = "#2a3038",
  skin,
}: {
  position: [number, number, number];
  rotY?: number;
  species?: DinoSpecies;
  pose?: "stand" | "sit";
  suit?: string;
  skin?: string;
}) {
  const scale = species === "anky" ? 1.08 : species === "ptera" ? 0.92 : 1;
  const hide = skin ?? (species === "anky" ? "#6b5a3a" : species === "trike" ? "#c4a574" : species === "ptera" ? "#8a6a4a" : GREEN);
  const sit = pose === "sit";
  const hip = sit ? 0.52 : 0.55;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.28, 10]} />
        <meshBasicMaterial color="#0a0c10" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {sit ? (
        <>
          <Box position={[-0.1, 0.28, -0.16]} size={[0.1, 0.42, 0.1]} color="#1a1c20" metal={0.15} />
          <Box position={[0.1, 0.28, -0.16]} size={[0.1, 0.42, 0.1]} color="#1a1c20" metal={0.15} />
          <Box position={[-0.1, 0.48, -0.02]} size={[0.12, 0.1, 0.34]} color={suit} />
          <Box position={[0.1, 0.48, -0.02]} size={[0.12, 0.1, 0.34]} color={suit} />
        </>
      ) : (
        <>
          <Box position={[-0.11, 0.08, 0.02]} size={[0.12, 0.07, 0.22]} color="#3a2418" metal={0.2} />
          <Box position={[0.11, 0.08, 0.02]} size={[0.12, 0.07, 0.22]} color="#3a2418" metal={0.2} />
          <Box position={[-0.11, 0.32, 0]} size={[0.11, 0.42, 0.12]} color={suit} />
          <Box position={[0.11, 0.32, 0]} size={[0.11, 0.42, 0.12]} color={suit} />
        </>
      )}
      <mesh position={[0, hip + 0.38, 0.02]}>
        <capsuleGeometry args={[0.22, 0.42, 3, 8]} />
        <meshStandardMaterial color={suit} roughness={0.55} metalness={0.12} />
      </mesh>
      <Box position={[0, hip + 0.4, -0.02]} size={[0.28, 0.38, 0.08]} color="#1e2228" metal={0.18} />
      <Box position={[0, hip + 0.42, -0.12]} size={[0.06, 0.28, 0.02]} color={SHIRT} />
      <Box position={[0, hip + 0.38, -0.13]} size={[0.04, 0.22, 0.015]} color={TIE} />
      <mesh position={[-0.28, hip + 0.42, -0.04]} rotation={[0.15, 0, 0.35]}>
        <capsuleGeometry args={[0.07, 0.38, 3, 6]} />
        <meshStandardMaterial color={suit} roughness={0.55} />
      </mesh>
      <mesh position={[0.28, hip + 0.42, -0.04]} rotation={[0.15, 0, -0.35]}>
        <capsuleGeometry args={[0.07, 0.38, 3, 6]} />
        <meshStandardMaterial color={suit} roughness={0.55} />
      </mesh>
      <mesh position={[0, hip + 0.78, -0.02]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial color={hide} roughness={0.62} />
      </mesh>
      <Head species={species} skin={hide} y={hip + 0.98} />
      <Tail species={species} skin={hide} y={hip + 0.28} />
    </group>
  );
}

function Head({ species, skin, y }: { species: DinoSpecies; skin: string; y: number }) {
  if (species === "trike") {
    return (
      <group position={[0, y, -0.04]}>
        <mesh>
          <sphereGeometry args={[0.2, 9, 7]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.02, -0.2]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.1, 0.28, 7]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>
        <mesh position={[-0.1, 0.16, -0.06]} rotation={[0.5, 0, -0.25]}>
          <coneGeometry args={[0.03, 0.22, 6]} />
          <meshStandardMaterial color="#f2f4f6" roughness={0.4} />
        </mesh>
        <mesh position={[0.1, 0.16, -0.06]} rotation={[0.5, 0, 0.25]}>
          <coneGeometry args={[0.03, 0.22, 6]} />
          <meshStandardMaterial color="#f2f4f6" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0.04]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.035, 0.16, 6]} />
          <meshStandardMaterial color="#f2f4f6" roughness={0.4} />
        </mesh>
        <Eyes z={-0.12} />
      </group>
    );
  }
  if (species === "anky") {
    return (
      <group position={[0, y, -0.02]}>
        <mesh>
          <sphereGeometry args={[0.22, 9, 7]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.02, -0.18]}>
          <sphereGeometry args={[0.12, 7, 6]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
        <Eyes z={-0.14} />
      </group>
    );
  }
  if (species === "ptera") {
    return (
      <group position={[0, y, -0.04]}>
        <mesh>
          <sphereGeometry args={[0.16, 8, 7]} />
          <meshStandardMaterial color={skin} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.02, -0.22]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.06, 0.32, 7]} />
          <meshStandardMaterial color={skin} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.18, 0.08]} rotation={[-0.6, 0, 0]}>
          <coneGeometry args={[0.04, 0.28, 6]} />
          <meshStandardMaterial color={skin} roughness={0.58} />
        </mesh>
        <Eyes z={-0.1} />
      </group>
    );
  }
  return (
    <group position={[0, y, -0.04]}>
      <mesh>
        <sphereGeometry args={[0.18, 9, 7]} />
        <meshStandardMaterial color={skin} roughness={0.58} />
      </mesh>
      <mesh position={[0, -0.01, -0.22]} rotation={[0.25, 0, 0]}>
        <coneGeometry args={[0.08, 0.3, 7]} />
        <meshStandardMaterial color={skin} roughness={0.58} />
      </mesh>
      <Eyes z={-0.1} />
      <mesh position={[0.16, 0.02, 0.02]}>
        <torusGeometry args={[0.05, 0.012, 6, 10, Math.PI]} />
        <meshStandardMaterial color="#111214" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Eyes({ z }: { z: number }) {
  return (
    <>
      <mesh position={[-0.07, 0.05, z]}>
        <sphereGeometry args={[0.035, 6, 5]} />
        <meshStandardMaterial color="#f2d44a" emissive="#f2d44a" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.07, 0.05, z]}>
        <sphereGeometry args={[0.035, 6, 5]} />
        <meshStandardMaterial color="#f2d44a" emissive="#f2d44a" emissiveIntensity={0.35} />
      </mesh>
    </>
  );
}

function Tail({ species, skin, y }: { species: DinoSpecies; skin: string; y: number }) {
  if (species === "ptera") return null;
  const club = species === "anky";
  return (
    <group position={[0, y, 0.22]}>
      <mesh position={[0, -0.02, 0.18]} rotation={[0.85, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.32, 3, 6]} />
        <meshStandardMaterial color={skin} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.12, 0.42]} rotation={[1.05, 0, 0]}>
        <capsuleGeometry args={[0.05, 0.28, 3, 6]} />
        <meshStandardMaterial color={skin} roughness={0.62} />
      </mesh>
      {club ? (
        <mesh position={[0, -0.18, 0.62]}>
          <sphereGeometry args={[0.1, 7, 6]} />
          <meshStandardMaterial color={skin} roughness={0.7} />
        </mesh>
      ) : (
        <mesh position={[0, -0.18, 0.62]} rotation={[1.15, 0, 0]}>
          <capsuleGeometry args={[0.03, 0.22, 3, 6]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>
      )}
    </group>
  );
}

function deskChair(id: string): { pos: [number, number, number]; yaw: number } {
  const d = FLOOR_DESKS.find((x) => x.id === id)!;
  const back = d.kind === "rex" ? 0.9 : 0.82;
  return {
    pos: [d.x + Math.sin(d.rotY) * back, 0, d.z + Math.cos(d.rotY) * back],
    yaw: d.rotY,
  };
}

export function FloorCrew() {
  const { settings } = useQuality();
  const extra = settings.atriumDetail;
  const t1 = deskChair("trade-1");
  const t2 = deskChair("trade-2");
  const t3 = deskChair("trade-3");
  const t5 = deskChair("trade-5");
  const b1 = deskChair("build-1");
  const b3 = deskChair("build-3");
  return (
    <group>
      <RexCutout position={[2.2, 0, 21.5]} />
      <SuitDino position={[-3.2, 0, 16.9]} rotY={Math.PI} species="anky" suit="#1c2a44" />
      <SuitDino position={[3.2, 0, 16.9]} rotY={Math.PI} species="anky" suit="#1c2a44" />
      <SuitDino position={[0, 0, 9.3]} rotY={Math.PI} species="anky" pose="sit" suit="#1a2740" />
      <SuitDino position={t1.pos} rotY={t1.yaw} species="trike" pose="sit" suit="#3a3d44" />
      <SuitDino position={t3.pos} rotY={t3.yaw} species="raptor" pose="sit" suit="#2c3340" />
      {extra ? (
        <>
          <SuitDino position={t2.pos} rotY={t2.yaw} species="raptor" pose="sit" suit="#323844" />
          <SuitDino position={t5.pos} rotY={t5.yaw} species="trike" pose="sit" suit="#3a3d44" />
          <SuitDino position={b1.pos} rotY={b1.yaw} species="raptor" pose="sit" suit="#2a2e34" />
          <SuitDino position={b3.pos} rotY={b3.yaw} species="raptor" pose="sit" suit="#2a2e34" />
          <SuitDino position={[8.4, 0, 7.35]} rotY={0} species="ptera" pose="sit" suit="#3a322c" />
          <SuitDino position={[11.35, 0, -16.4]} rotY={-Math.PI / 2} species="trike" pose="sit" suit="#2c3340" />
          <SuitDino position={[13.45, 0, -18.6]} rotY={Math.PI / 2} species="raptor" pose="sit" suit="#2a3038" />
          <SuitDino position={[12.4, 0, -20.15]} rotY={Math.PI} species="raptor" suit="#1c1e22" />
          <SuitDino position={[-8.6, 0, 13.5]} rotY={0.4} species="raptor" pose="sit" suit="#2a3038" />
        </>
      ) : null}
    </group>
  );
}
