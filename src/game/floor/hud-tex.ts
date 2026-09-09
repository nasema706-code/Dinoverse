import { useMemo } from "react";
import * as THREE from "three";

type HudTextures = {
  ticker: THREE.CanvasTexture;
  dnvr: THREE.CanvasTexture;
  dinose: THREE.CanvasTexture;
  q2: THREE.CanvasTexture;
  ops: THREE.CanvasTexture;
  portfolio: THREE.CanvasTexture;
  species: THREE.CanvasTexture;
  code: THREE.CanvasTexture;
  sign: THREE.CanvasTexture;
  hqSign: THREE.CanvasTexture;
  plaque: THREE.CanvasTexture;
  banner: THREE.CanvasTexture;
  checkin: THREE.CanvasTexture;
  visitors: THREE.CanvasTexture;
  grid: THREE.CanvasTexture;
  windows: THREE.CanvasTexture;
  marble: THREE.CanvasTexture;
  asphalt: THREE.CanvasTexture;
};

let hudCache: HudTextures | null = null;
let hudCacheRev = -1;
/** Bump when screen copy changes so HMR does not keep stale canvases. */
const HUD_TEX_REV = 2;

function canvasTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

export function useHudTextures() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    if (hudCache && hudCacheRev === HUD_TEX_REV) return hudCache;
    hudCacheRev = HUD_TEX_REV;

    const ticker = canvasTex(1024, 512, (ctx, w, h) => {
      ctx.fillStyle = "#0c1018";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3ecf8e";
      ctx.font = "bold 56px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse  +2.34%", 48, 88);
      ctx.strokeStyle = "#3ecf8e";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(48, 160);
      ctx.lineTo(180, 200);
      ctx.lineTo(280, 150);
      ctx.lineTo(420, 210);
      ctx.lineTo(560, 120);
      ctx.lineTo(720, 90);
      ctx.lineTo(960, 70);
      ctx.stroke();
      const ticks = [
        ["$Dinoverse", "+2.34%", true],
        ["JURA", "+0.38%", true],
        ["CRETA", "-0.68%", false],
        ["TRIAS", "+0.88%", true],
        ["PERM", "-0.12%", false],
        ["PTERA", "+1.04%", true],
        ["ANKY", "+0.62%", true],
      ] as const;
      ctx.font = "bold 28px ui-sans-serif, system-ui, sans-serif";
      ticks.forEach((row, i) => {
        ctx.fillStyle = "#9aa8b8";
        ctx.fillText(row[0], 48, 260 + i * 34);
        ctx.fillStyle = row[2] ? "#3ecf8e" : "#e85d5d";
        ctx.fillText(row[1], 420, 260 + i * 34);
      });
    });

    const dnvr = canvasTex(256, 1024, (ctx, w, h) => {
      ctx.fillStyle = "#0b0e14";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#3ecf8e";
      ctx.font = "bold 34px ui-sans-serif, system-ui, sans-serif";
      ctx.save();
      ctx.translate(w / 2, 80);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("$Dinoverse", 0, 0);
      ctx.restore();
      ctx.font = "32px ui-monospace, monospace";
      ["+1.62%", "+0.38%", "-0.68%", "+0.88%", "+2.10%", "-0.14%", "+1.04%"].forEach((n, i) => {
        ctx.fillStyle = n.startsWith("-") ? "#e85d5d" : "#3ecf8e";
        ctx.fillText(n, 48, 200 + i * 110);
      });
    });

    const q2 = canvasTex(1024, 640, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8, 24, 40, 0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7ec8ff";
      ctx.font = "bold 32px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse FINANCIAL GROUP", 40, 56);
      ctx.font = "28px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Q2 PERFORMANCE OVERVIEW", 40, 100);
      ctx.fillText("REVENUE GROWTH  +27.4%", 40, 180);
      ctx.fillText("PORTFOLIO PERFORMANCE", 40, 240);
      ctx.beginPath();
      ctx.arc(820, 280, 90, 0, Math.PI * 2);
      ctx.strokeStyle = "#7ec8ff";
      ctx.lineWidth = 10;
      ctx.stroke();
      ctx.font = "bold 40px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("68%", 780, 292);
      ctx.font = "22px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Operating Profit  +31.6%", 40, 340);
      ctx.fillText("Assets Under Management  +22.8%", 40, 380);
      ctx.fillText("Market Share Growth  +18.7%", 40, 420);
      ctx.fillStyle = "#3ecf8e";
      ctx.font = "bold 32px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("MARKET OUTLOOK  BULLISH", 40, 520);
    });

    const ops = canvasTex(768, 480, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6, 20, 36, 0.12)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6ecfff";
      ctx.font = "bold 28px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse OPS", 28, 48);
      ctx.font = "22px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Portfolio  74.8%", 28, 100);
      ctx.fillText("Species index  live", 28, 140);
      for (let i = 0; i < 8; i++) {
        const ht = 40 + Math.sin(i * 1.2) * 28 + i * 6;
        ctx.fillRect(40 + i * 80, 380 - ht, 36, ht);
      }
    });

    const code = canvasTex(640, 400, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8, 12, 18, 0.35)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "18px ui-monospace, monospace";
      const lines = [
        "commit claw.sign($DINOVERSE)",
        "book.sync(local, gossip)",
        "if (lag > 400) kick(glass)",
        "export const tape = live()",
        "return city.clockIn()",
      ];
      lines.forEach((line, i) => {
        ctx.fillStyle = i % 2 ? "#9ad4ff" : "#3ecf8e";
        ctx.fillText(line, 24, 48 + i * 56);
      });
    });

    const sign = canvasTex(1024, 384, (ctx, w, h) => {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d4af6a";
      ctx.font = "bold 64px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse", 80, 140);
      ctx.font = "bold 48px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("GLOBAL HEADQUARTERS", 80, 220);
    });

    const checkin = canvasTex(640, 400, (ctx, w, h) => {
      ctx.fillStyle = "rgba(8, 30, 50, 0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8ad4ff";
      ctx.font = "bold 26px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("VISITOR CHECK-IN", 24, 48);
      ctx.font = "22px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("VELOX RAPTORA", 24, 110);
      ctx.fillText("Visitor ID  VR-4401", 24, 148);
      ctx.fillText("GENESIS DYNAMICS", 24, 186);
      ctx.fillText("HOST  DR. E. HALO", 24, 224);
      ctx.fillText("CLEARANCE  3", 24, 262);
      ctx.fillStyle = "#3ecf8e";
      ctx.font = "bold 32px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("APPROVED", 24, 280);
    });

    const visitors = canvasTex(640, 400, (ctx) => {
      ctx.fillStyle = "rgba(8, 30, 50, 0.2)";
      ctx.fillRect(0, 0, 640, 400);
      ctx.fillStyle = "#8ad4ff";
      ctx.font = "bold 26px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("TODAY'S VISITORS", 24, 48);
      ctx.font = "22px ui-sans-serif, system-ui, sans-serif";
      [
        ["TRICERA LOGISTICS", "2"],
        ["PTERO AIR", "1"],
        ["SAURO TECH", "4"],
      ].forEach((row, i) => {
        ctx.fillText(row[0], 24, 120 + i * 70);
        ctx.fillText(row[1], 520, 120 + i * 70);
      });
    });

    const windows = canvasTex(256, 512, (ctx, w, h) => {
      ctx.fillStyle = "#121820";
      ctx.fillRect(0, 0, w, h);
      for (let y = 6; y < h; y += 16) {
        for (let x = 5; x < w; x += 12) {
          const n = Math.sin(x * 12.7 + y * 4.1) * 0.5 + 0.5;
          const lit = n > 0.32;
          ctx.fillStyle = lit ? (n > 0.78 ? "#f2c56b" : n > 0.55 ? "#9ad4ff" : "#dce7f4") : "#0a1016";
          ctx.fillRect(x, y, 7, 11);
        }
      }
    });
    windows.wrapS = THREE.RepeatWrapping;
    windows.wrapT = THREE.RepeatWrapping;
    windows.repeat.set(3, 8);

    const marble = canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#8b949e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#c5ccd4";
      ctx.lineWidth = 3;
      for (let x = 0; x <= w; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 40, 0);
        ctx.bezierCurveTo(i * 28, 180, 200 + i * 10, 320, i * 30, 512);
        ctx.stroke();
      }
    });
    marble.wrapS = THREE.RepeatWrapping;
    marble.wrapT = THREE.RepeatWrapping;
    marble.repeat.set(10, 11);

    const asphalt = canvasTex(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#141a20";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d4af6a";
      for (let y = 24; y < h; y += 64) {
        ctx.fillRect(w / 2 - 3, y, 6, 28);
      }
      ctx.fillStyle = "#3ecf8e";
      ctx.fillRect(48, 0, 4, h);
      ctx.fillRect(w - 52, 0, 4, h);
    });
    asphalt.wrapS = THREE.RepeatWrapping;
    asphalt.wrapT = THREE.RepeatWrapping;
    asphalt.repeat.set(18, 18);

    const dinose = canvasTex(1024, 640, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6, 22, 40, 0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#5ec8ff";
      ctx.lineWidth = 3;
      ctx.strokeRect(16, 16, w - 32, h - 32);
      ctx.fillStyle = "#e8f6ff";
      ctx.font = "bold 72px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse", 48, 140);
      ctx.fillStyle = "#3ecf8e";
      ctx.font = "bold 64px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("+2.34%", 520, 140);
      ctx.font = "28px ui-sans-serif, system-ui, sans-serif";
      [
        ["JURASSIC", "+2.86%"],
        ["CRETACEOUS", "+0.32%"],
        ["TRIASSIC", "+0.56%"],
      ].forEach((row, i) => {
        ctx.fillStyle = "#9ad4ff";
        ctx.fillText(row[0], 48, 240 + i * 70);
        ctx.fillStyle = "#3ecf8e";
        ctx.fillText(row[1], 420, 240 + i * 70);
      });
      ctx.fillStyle = "#7ec8ff";
      ctx.font = "22px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse  live book", 48, 500);
    });

    const portfolio = canvasTex(640, 480, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6, 20, 36, 0.14)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6ecfff";
      ctx.font = "bold 26px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("PORTFOLIO OVERVIEW", 24, 44);
      ctx.beginPath();
      ctx.arc(320, 230, 88, 0, Math.PI * 2);
      ctx.strokeStyle = "#1a3a50";
      ctx.lineWidth = 16;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(320, 230, 88, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.748);
      ctx.strokeStyle = "#5ec8ff";
      ctx.stroke();
      ctx.fillStyle = "#e8f6ff";
      ctx.font = "bold 40px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("74.8%", 270, 242);
      ctx.fillStyle = "#9ad4ff";
      ctx.font = "20px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("allocation vs target", 210, 400);
    });

    const species = canvasTex(640, 400, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6, 20, 36, 0.14)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6ecfff";
      ctx.font = "bold 26px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("SPECIES INDEX", 24, 44);
      ctx.strokeStyle = "#5ec8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 280);
      ctx.lineTo(120, 220);
      ctx.lineTo(160, 240);
      ctx.lineTo(210, 160);
      ctx.lineTo(280, 190);
      ctx.stroke();
      ctx.fillStyle = "#9ad4ff";
      ctx.font = "20px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Raptor  1.00", 24, 120);
      ctx.fillText("Trike   0.86", 24, 160);
      ctx.fillText("Anky    0.72", 24, 200);
      ctx.fillText("Ptera   1.14", 24, 240);
    });

    const hqSign = canvasTex(1280, 720, (ctx, w, h) => {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d4af6a";
      ctx.beginPath();
      ctx.moveTo(w / 2, 168);
      ctx.lineTo(w / 2 + 42, 218);
      ctx.lineTo(w / 2 + 28, 218);
      ctx.lineTo(w / 2, 268);
      ctx.lineTo(w / 2 - 28, 218);
      ctx.lineTo(w / 2 - 42, 218);
      ctx.closePath();
      ctx.fill();
      ctx.textAlign = "center";
      ctx.font = "bold 78px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse", w / 2, 400);
      ctx.font = "bold 42px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "#e8d7a8";
      ctx.fillText("GLOBAL HEADQUARTERS", w / 2, 470);
    });

    const plaque = canvasTex(768, 192, (ctx, w, h) => {
      ctx.fillStyle = "#0b0d10";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2f4f6";
      ctx.font = "bold 32px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$Dinoverse SEC · RECEPTION", 36, 110);
    });

    const banner = canvasTex(384, 1024, (ctx, w, h) => {
      ctx.fillStyle = "#142038";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f2f4f6";
      ctx.font = "bold 36px ui-sans-serif, system-ui, sans-serif";
      ctx.save();
      ctx.translate(w / 2, 80);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("$Dinoverse CORPORATE", 0, 0);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(w / 2, 820, 48, 0, Math.PI * 2);
      ctx.strokeStyle = "#d4af6a";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "#d4af6a";
      ctx.font = "bold 22px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("$D", w / 2 - 18, 828);
    });

    const grid = canvasTex(256, 256, (ctx, w, h) => {
      ctx.fillStyle = "rgba(20, 60, 90, 0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(94, 200, 255, 0.55)";
      ctx.lineWidth = 2;
      for (let x = 0; x <= w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    });
    grid.wrapS = THREE.RepeatWrapping;
    grid.wrapT = THREE.RepeatWrapping;
    grid.repeat.set(4, 8);

    hudCache = {
      ticker,
      dnvr,
      dinose,
      q2,
      ops,
      portfolio,
      species,
      code,
      sign,
      hqSign,
      plaque,
      banner,
      checkin,
      visitors,
      grid,
      windows,
      marble,
      asphalt,
    };
    return hudCache;
  }, []);
}
