import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Quality = "low" | "mid" | "high";

export type QualitySettings = {
  dpr: [number, number];
  shadows: boolean;
  antialias: boolean;
  far: number;
  fogNear: number;
  fogFar: number;
  towers: number;
  crafts: number;
  contactShadows: boolean;
  headlamp: boolean;
  extraLights: boolean;
  extraProps: boolean;
  atriumDetail: boolean;
  preview3d: boolean;
  videoHero: boolean;
};

export const QUALITY: Record<Quality, QualitySettings> = {
  low: {
    dpr: [1, 1.25],
    shadows: false,
    antialias: false,
    far: 150,
    fogNear: 42,
    fogFar: 118,
    towers: 22,
    crafts: 2,
    contactShadows: false,
    headlamp: true,
    extraLights: false,
    extraProps: true,
    atriumDetail: false,
    preview3d: false,
    videoHero: false,
  },
  mid: {
    dpr: [1, 1.5],
    shadows: false,
    antialias: false,
    far: 190,
    fogNear: 52,
    fogFar: 148,
    towers: 30,
    crafts: 3,
    contactShadows: false,
    headlamp: true,
    extraLights: true,
    extraProps: true,
    atriumDetail: true,
    preview3d: true,
    videoHero: true,
  },
  high: {
    dpr: [1, 1.75],
    shadows: true,
    antialias: true,
    far: 240,
    fogNear: 58,
    fogFar: 175,
    towers: 40,
    crafts: 5,
    contactShadows: true,
    headlamp: true,
    extraLights: true,
    extraProps: true,
    atriumDetail: true,
    preview3d: true,
    videoHero: true,
  },
};

type NavConn = { saveData?: boolean; effectiveType?: string };

export function detectQuality(): Quality {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "mid";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: NavConn };
  const conn = nav.connection;
  const saveData = Boolean(conn?.saveData);
  const type = conn?.effectiveType;
  const crawlNet = type === "slow-2g" || type === "2g";
  const slowNet = type === "3g";
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const touch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;
  const small = window.matchMedia("(max-width: 900px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = /Android|iPhone|iPod/i.test(navigator.userAgent);
  const tablet = /iPad/i.test(navigator.userAgent) || (touch && !phone && small);

  if (saveData || crawlNet || reduced || mem <= 2) return "low";
  if (slowNet && mem <= 4) return "low";
  if (phone || tablet || (touch && small) || mem <= 4 || cores <= 4) return "mid";
  return "high";
}

const QualityCtx = createContext<{ level: Quality; settings: QualitySettings }>({
  level: "mid",
  settings: QUALITY.mid,
});

export function useQuality() {
  return useContext(QualityCtx);
}

export function QualityProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<Quality>(() => detectQuality());
  useEffect(() => {
    setLevel(detectQuality());
  }, []);
  const value = useMemo(() => ({ level, settings: QUALITY[level] }), [level]);
  return createElement(QualityCtx.Provider, { value }, children);
}
