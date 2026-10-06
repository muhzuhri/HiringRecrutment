"use client";

import { useEffect, useState, useRef } from "react";

/**
 * LogoIntroAnimation
 *
 * Professional motion graphic intro:
 * 1. Spin Phase (0 - 0.9s)   : Centered logo rotates 720deg with smooth acceleration & glow.
 * 2. Pulse Phase (0.9 - 1.7s): Slows down, expands gently (pulse) while completing rotation.
 * 3. Fly Phase (1.7 - 2.7s)  : Smoothly glides & scales directly into the navbar logo position
 *                               using real-time DOM coordinate calculations (FLIP animation).
 */

export default function LogoIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"spin" | "pulse" | "fly" | "done">("spin");
  const logoRef = useRef<HTMLDivElement>(null);
  const [flyStyle, setFlyStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Phase 1 -> Phase 2 (Pulse) after 900ms
    const t1 = setTimeout(() => setPhase("pulse"), 900);

    // Phase 2 -> Phase 3 (Fly to Navbar) after another 800ms
    const t2 = setTimeout(() => {
      // Calculate exact delta coordinates from screen center to navbar logo
      const navLogo = document.getElementById("navbar-logo-link");
      if (navLogo) {
        const navRect = navLogo.getBoundingClientRect();
        const navCenterX = navRect.left + navRect.width / 2;
        const navCenterY = navRect.top + navRect.height / 2;

        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;

        const deltaX = navCenterX - screenCenterX;
        const deltaY = navCenterY - screenCenterY;
        const targetScale = Math.max(0.2, (navRect.height || 40) / 160);

        setFlyStyle({
          "--fly-x": `${deltaX}px`,
          "--fly-y": `${deltaY}px`,
          "--fly-scale": `${targetScale}`,
        } as React.CSSProperties);
      } else {
        // Fallback calculation for standard screen layout
        setFlyStyle({
          "--fly-x": `calc(-50vw + 60px)`,
          "--fly-y": `calc(-50vh + 40px)`,
          "--fly-scale": `0.25`,
        } as React.CSSProperties);
      }

      setPhase("fly");
    }, 1700);

    // Animation finished -> unmount overlay
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden"
      style={{
        background:
          phase === "fly"
            ? "transparent"
            : "linear-gradient(135deg, #061f1d 0%, #0c2b29 60%, #0f3d2e 100%)",
        transition: "background 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Background dark curtain fade out */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, #061f1d 0%, #0c2b29 60%, #0f3d2e 100%)",
          opacity: phase === "fly" ? 0 : 1,
          transition: "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "none",
        }}
      />

      {/* Glowing radial backdrop circle */}
      {phase !== "fly" && (
        <div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(12,43,41,0) 70%)",
            animation: "introGlow 1.2s ease-in-out infinite alternate",
          }}
        />
      )}

      {/* Animated Logo Container */}
      <div
        ref={logoRef}
        style={{
          position: "relative",
          zIndex: 10,
          willChange: "transform, opacity",
          ...flyStyle,
          ...(phase === "spin" && {
            animation: "introSpin 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
          }),
          ...(phase === "pulse" && {
            animation: "introPulse 0.8s ease-in-out forwards",
          }),
          ...(phase === "fly" && {
            animation: "introFly 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }),
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow:
              phase !== "fly"
                ? "0 0 50px rgba(16,185,129,0.5), 0 0 100px rgba(16,185,129,0.2)"
                : "0 0 10px rgba(16,185,129,0.2)",
            transition: "box-shadow 0.6s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo.png"
            alt="TalentHub Logo"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* High-performance GPU accelerated CSS keyframes */}
      <style>{`
        @keyframes introSpin {
          0% {
            transform: scale(0.2) rotate(0deg);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(720deg);
            opacity: 1;
          }
        }

        @keyframes introPulse {
          0% {
            transform: scale(1) rotate(720deg);
          }
          50% {
            transform: scale(1.15) rotate(810deg);
          }
          100% {
            transform: scale(1) rotate(900deg);
          }
        }

        @keyframes introFly {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(900deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--fly-x, -45vw), var(--fly-y, -45vh)) scale(var(--fly-scale, 0.25)) rotate(1080deg);
            opacity: 0;
          }
        }

        @keyframes introGlow {
          0% {
            transform: scale(0.85);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.25);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
