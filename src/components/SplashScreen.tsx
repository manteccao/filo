"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimate, stagger } from "framer-motion";

const TAGLINE = "il passaparola digitale";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [scope, animate] = useAnimate();
  const didRun = useRef(false);

  // Show once per session
  useEffect(() => {
    if (sessionStorage.getItem("splash_shown")) return;
    sessionStorage.setItem("splash_shown", "1");
    setVisible(true);
  }, []);

  // Run sequential animation after mount
  useEffect(() => {
    if (!visible || didRun.current) return;
    didRun.current = true;

    async function run() {
      // 1. Logo: scale 0.3→1 + opacity 0→1 (~0.25s)
      await animate(
        "#splash-logo",
        { scale: [0.3, 1], opacity: [0, 1] },
        { type: "spring", stiffness: 280, damping: 22 }
      );

      // 2. Text letters appear one by one (~0.75s)
      await animate(
        ".splash-letter",
        { opacity: 1 },
        { delay: stagger(0.03), duration: 0.1, ease: "easeOut" }
      );

      // 3. After 0.15s: fade out everything (0.25s)
      await new Promise<void>((r) => setTimeout(r, 150));
      await animate(scope.current, { opacity: 0 }, { duration: 0.25, ease: "easeIn" });

      setVisible(false);
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={scope}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        id="splash-logo"
        src="/filo-logo-new.png"
        alt="Filo"
        style={{
          width: 240,
          height: "auto",
          objectFit: "contain",
          mixBlendMode: "screen",
          opacity: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          color: "#0D9488",
          fontSize: 14,
          letterSpacing: "0.15em",
          fontWeight: 400,
        }}
      >
        {TAGLINE.split("").map((char, i) => (
          <span
            key={i}
            className="splash-letter"
            style={{ opacity: 0 }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>
    </div>
  );
}
