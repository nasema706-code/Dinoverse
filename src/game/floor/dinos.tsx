import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { useQuality } from "../quality";
import { FLOOR_DESKS } from "./layout";
import { Talkable } from "./talkable";

const SHIRT = "#f4f1ea";
const TIE = "#6b1c32";

export type DinoSpecies = "raptor" | "anky" | "trike" | "ptera";

function Hide({ color, roughness = 0.58 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0.08} />;
}

function Cloth({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.52} metalness={0.14} />;
}

/**
 * Plaza staff at roughly Enzo / Meshy scale. Local forward is −Z.
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
  const idle = useRef<Group>(null);
  const phase = useRef(Math.random() * 12);
  const body = species === "anky" ? 0.78 : species === "trike" ? 0.8 : species === "ptera" ? 0.68 : 0.74;
  const hide =
    skin ?? (species === "anky" ? "#6b5a3a" : species === "trike" ? "#c4a574" : species === "ptera" ? "#8a6a4a" : "#3a7a48");
  const sit = pose === "sit";
  const hip = sit ? 0.58 : 0.62;

  useFrame((_, dt) => {
    const n = idle.current;
    if (!n) return;
    phase.current += dt;
    if (sit) {
      n.rotation.y = Math.sin(phase.current * 0.45) * 0.03;
      return;
    }
    n.position.y = Math.sin(phase.current * 1.35) * 0.014;
    n.rotation.y = Math.sin(phase.current * 0.65) * 0.045;
  });

  return (
    <group position={position} rotation={[0, rotY, 0]} scale={body}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.32, 14]} />
        <meshBasicMaterial color="#0a0c10" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <group ref={idle}>
        {sit ? (
          <>
            <mesh position={[-0.12, 0.32, -0.18]}>
              <capsuleGeometry args={[0.055, 0.44, 4, 8]} />
              <meshStandardMaterial color="#1a1c20" roughness={0.55} metalness={0.18} />
            </mesh>
            <mesh position={[0.12, 0.32, -0.18]}>
              <capsuleGeometry args={[0.055, 0.44, 4, 8]} />
              <meshStandardMaterial color="#1a1c20" roughness={0.55} metalness={0.18} />
            </mesh>
            <mesh position={[-0.12, 0.52, -0.02]} rotation={[0.15, 0, 0]}>
              <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
              <Cloth color={suit} />
            </mesh>
            <mesh position={[0.12, 0.52, -0.02]} rotation={[0.15, 0, 0]}>
              <capsuleGeometry args={[0.07, 0.28, 4, 8]} />
              <Cloth color={suit} />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[-0.12, 0.1, 0.04]} rotation={[0.15, 0, 0]}>
              <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
              <meshStandardMaterial color="#3a2418" roughness={0.6} metalness={0.15} />
            </mesh>
            <mesh position={[0.12, 0.1, 0.04]} rotation={[0.15, 0, 0]}>
              <capsuleGeometry args={[0.055, 0.16, 4, 8]} />
              <meshStandardMaterial color="#3a2418" roughness={0.6} metalness={0.15} />
            </mesh>
            <mesh position={[-0.12, 0.38, 0]}>
              <capsuleGeometry args={[0.065, 0.42, 4, 8]} />
              <Cloth color={suit} />
            </mesh>
            <mesh position={[0.12, 0.38, 0]}>
              <capsuleGeometry args={[0.065, 0.42, 4, 8]} />
              <Cloth color={suit} />
            </mesh>
          </>
        )}
        <mesh position={[0, hip + 0.42, 0.02]}>
          <capsuleGeometry args={[0.24, 0.46, 5, 10]} />
          <Cloth color={suit} />
        </mesh>
        <mesh position={[0, hip + 0.44, -0.04]}>
          <boxGeometry args={[0.3, 0.4, 0.08]} />
          <meshStandardMaterial color="#1e2228" roughness={0.48} metalness={0.2} />
        </mesh>
        <mesh position={[0, hip + 0.46, -0.13]}>
          <boxGeometry args={[0.07, 0.3, 0.02]} />
          <meshStandardMaterial color={SHIRT} roughness={0.45} />
        </mesh>
        <mesh position={[0, hip + 0.42, -0.14]}>
          <boxGeometry args={[0.04, 0.24, 0.016]} />
          <meshStandardMaterial color={TIE} roughness={0.4} />
        </mesh>
        <mesh position={[-0.3, hip + 0.44, -0.04]} rotation={[0.18, 0, 0.38]}>
          <capsuleGeometry args={[0.065, 0.4, 4, 8]} />
          <Cloth color={suit} />
        </mesh>
        <mesh position={[0.3, hip + 0.44, -0.04]} rotation={[0.18, 0, -0.38]}>
          <capsuleGeometry args={[0.065, 0.4, 4, 8]} />
          <Cloth color={suit} />
        </mesh>
        {species === "ptera" ? (
          <>
            <mesh position={[-0.38, hip + 0.55, 0.08]} rotation={[0.2, 0.4, -0.8]}>
              <capsuleGeometry args={[0.03, 0.55, 3, 6]} />
              <Hide color={hide} />
            </mesh>
            <mesh position={[0.38, hip + 0.55, 0.08]} rotation={[0.2, -0.4, 0.8]}>
              <capsuleGeometry args={[0.03, 0.55, 3, 6]} />
              <Hide color={hide} />
            </mesh>
          </>
        ) : null}
        {species === "anky" ? (
          <mesh position={[0, hip + 0.58, 0.02]}>
            <boxGeometry args={[0.42, 0.12, 0.5]} />
            <meshStandardMaterial color="#5a4a38" roughness={0.72} metalness={0.12} />
          </mesh>
        ) : null}
        <mesh position={[0, hip + 0.84, -0.02]}>
          <sphereGeometry args={[0.13, 10, 8]} />
          <Hide color={hide} />
        </mesh>
        <Head species={species} skin={hide} y={hip + 1.05} />
        <Tail species={species} skin={hide} y={hip + 0.32} />
      </group>
    </group>
  );
}

function Head({ species, skin, y }: { species: DinoSpecies; skin: string; y: number }) {
  if (species === "trike") {
    return (
      <group position={[0, y, -0.04]}>
        <mesh>
          <sphereGeometry args={[0.22, 12, 9]} />
          <Hide color={skin} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.04, 0.06]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.08, 12]} />
          <Hide color={skin} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.02, -0.22]} rotation={[0.35, 0, 0]}>
          <coneGeometry args={[0.11, 0.3, 8]} />
          <Hide color={skin} roughness={0.62} />
        </mesh>
        <mesh position={[-0.12, 0.18, -0.04]} rotation={[0.5, 0, -0.25]}>
          <coneGeometry args={[0.032, 0.24, 6]} />
          <meshStandardMaterial color="#f2f4f6" roughness={0.38} />
        </mesh>
        <mesh position={[0.12, 0.18, -0.04]} rotation={[0.5, 0, 0.25]}>
          <coneGeometry args={[0.032, 0.24, 6]} />
          <meshStandardMaterial color="#f2f4f6" roughness={0.38} />
        </mesh>
        <mesh position={[0, 0.24, 0.06]} rotation={[0.9, 0, 0]}>
          <coneGeometry args={[0.038, 0.18, 6]} />
          <meshStandardMaterial color="#f2f4f6" roughness={0.38} />
        </mesh>
        <Eyes z={-0.12} />
      </group>
    );
  }
  if (species === "anky") {
    return (
      <group position={[0, y, -0.02]}>
        <mesh>
          <sphereGeometry args={[0.24, 12, 9]} />
          <Hide color={skin} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.02, -0.2]}>
          <sphereGeometry args={[0.13, 8, 7]} />
          <Hide color={skin} roughness={0.7} />
        </mesh>
        <Eyes z={-0.14} />
      </group>
    );
  }
  if (species === "ptera") {
    return (
      <group position={[0, y, -0.04]}>
        <mesh>
          <sphereGeometry args={[0.17, 10, 8]} />
          <Hide color={skin} />
        </mesh>
        <mesh position={[0, 0.02, -0.24]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.065, 0.34, 8]} />
          <Hide color={skin} />
        </mesh>
        <mesh position={[0, 0.2, 0.08]} rotation={[-0.6, 0, 0]}>
          <coneGeometry args={[0.042, 0.3, 6]} />
          <Hide color={skin} />
        </mesh>
        <Eyes z={-0.1} />
      </group>
    );
  }
  return (
    <group position={[0, y, -0.04]}>
      <mesh>
        <sphereGeometry args={[0.19, 12, 9]} />
        <Hide color={skin} />
      </mesh>
      <mesh position={[0, -0.01, -0.24]} rotation={[0.25, 0, 0]}>
        <coneGeometry args={[0.085, 0.32, 8]} />
        <Hide color={skin} />
      </mesh>
      <Eyes z={-0.1} />
      <mesh position={[0.17, 0.02, 0.02]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.052, 0.012, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#111214" metalness={0.62} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Eyes({ z }: { z: number }) {
  return (
    <>
      <mesh position={[-0.07, 0.05, z]}>
        <sphereGeometry args={[0.032, 8, 6]} />
        <meshStandardMaterial color="#f2d44a" emissive="#f2d44a" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.07, 0.05, z]}>
        <sphereGeometry args={[0.032, 8, 6]} />
        <meshStandardMaterial color="#f2d44a" emissive="#f2d44a" emissiveIntensity={0.35} />
      </mesh>
    </>
  );
}

function Tail({ species, skin, y }: { species: DinoSpecies; skin: string; y: number }) {
  if (species === "ptera") return null;
  const club = species === "anky";
  return (
    <group position={[0, y, 0.24]}>
      <mesh position={[0, -0.02, 0.2]} rotation={[0.85, 0, 0]}>
        <capsuleGeometry args={[0.075, 0.34, 4, 8]} />
        <Hide color={skin} roughness={0.62} />
      </mesh>
      <mesh position={[0, -0.12, 0.46]} rotation={[1.05, 0, 0]}>
        <capsuleGeometry args={[0.055, 0.3, 4, 8]} />
        <Hide color={skin} roughness={0.62} />
      </mesh>
      {club ? (
        <mesh position={[0, -0.18, 0.66]}>
          <sphereGeometry args={[0.11, 8, 7]} />
          <Hide color={skin} roughness={0.7} />
        </mesh>
      ) : (
        <mesh position={[0, -0.18, 0.66]} rotation={[1.15, 0, 0]}>
          <capsuleGeometry args={[0.032, 0.24, 3, 6]} />
          <Hide color={skin} roughness={0.62} />
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

export function FloorCrew({ preview = false }: { preview?: boolean }) {
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
      <Talkable id="knox" position={[-3.2, 0, 16.9]} rotY={Math.PI} preview={preview}>
        <SuitDino position={[0, 0, 0]} rotY={0} species="anky" suit="#1c2a44" />
      </Talkable>
      <Talkable id="sela" position={[3.2, 0, 16.9]} rotY={Math.PI} preview={preview}>
        <SuitDino position={[0, 0, 0]} rotY={0} species="ptera" suit="#3a322c" />
      </Talkable>
      <Talkable id="grav" position={[0, 0, 9.3]} rotY={Math.PI} facePlayer={false} preview={preview}>
        <SuitDino position={[0, 0, 0]} rotY={0} species="anky" pose="sit" suit="#1a2740" />
      </Talkable>
      <Talkable id="mica" position={t1.pos} rotY={t1.yaw} facePlayer={false} preview={preview}>
        <SuitDino position={[0, 0, 0]} rotY={0} species="trike" pose="sit" suit="#3a3d44" />
      </Talkable>
      <Talkable id="cal" position={[-9.2, 0, 12.85]} rotY={0.55} preview={preview}>
        <SuitDino position={[0, 0, 0]} rotY={0} species="raptor" suit="#4a3228" />
      </Talkable>
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
        </>
      ) : null}
    </group>
  );
}
