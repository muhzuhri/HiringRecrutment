"use client";

import React from "react";
import IsometricWireframeCube from "./IsometricWireframeCube";

interface RuangAmanBackgroundProps {
  className?: string;
  showCubes?: boolean;
}

/**
 * Background RuangAman Style
 * Includes:
 * 1. Clean off-white background with subtle grid pattern (#f8fafc + slate/teal grid)
 * 2. Radial gradient glow at top-center (Teal/Emerald glow)
 * 3. Floating 3D isometric wireframe cubes with 10%-20% opacity and smooth floating animations
 */
export default function RuangAmanBackground({
  className = "",
  showCubes = true,
}: RuangAmanBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Top Radial Gradient Glow (Pencahayaan Modern) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.18),rgba(15,118,110,0.06)_45%,transparent_75%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.22),rgba(6,31,29,0.1)_50%,transparent_80%)] blur-2xl" />

      {/* 2. Secondary Ambient Glow on Top Right */}
      <div className="absolute top-12 right-0 w-80 h-80 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl" />

      {/* 3. 3D Floating Isometric Wireframe Cubes (Opasitas 10% - 20%, Warna Teal & Slate) */}
      {showCubes && (
        <div className="relative w-full h-full">
          {/* Cube 1: Top Right - Medium Teal */}
          <div className="absolute top-6 right-6 sm:right-16 lg:right-24 animate-float-slow opacity-15 hover:opacity-25 transition-opacity">
            <IsometricWireframeCube
              size={92}
              color="#0F766E"
              secondaryColor="#14B8A6"
              fillOpacity={0.08}
              strokeWidth={1.4}
              className="transform rotate-12"
            />
          </div>

          {/* Cube 2: Top Left - Slate / Subdued Wireframe */}
          <div className="absolute top-14 left-4 sm:left-12 lg:left-20 animate-float-reverse opacity-15 hover:opacity-25 transition-opacity">
            <IsometricWireframeCube
              size={76}
              color="#475569"
              secondaryColor="#94A3B8"
              fillOpacity={0.06}
              strokeWidth={1.2}
              className="transform -rotate-12"
            />
          </div>

          {/* Cube 3: Center-Right - Compact Teal Cube */}
          <div className="absolute top-48 right-1/4 animate-float-gentle opacity-18 hidden sm:block">
            <IsometricWireframeCube
              size={48}
              color="#14B8A6"
              secondaryColor="#0F766E"
              fillOpacity={0.12}
              strokeWidth={1.5}
              className="transform rotate-45"
            />
          </div>

          {/* Cube 4: Bottom Left - Large Subtle Teal Cube */}
          <div className="absolute bottom-8 left-8 sm:left-24 animate-float-slow opacity-12 hidden md:block">
            <IsometricWireframeCube
              size={105}
              color="#0F766E"
              secondaryColor="#2DD4BF"
              fillOpacity={0.05}
              strokeWidth={1.1}
              className="transform rotate-[25deg]"
            />
          </div>

          {/* Cube 5: Bottom Right - Slate Accent Cube */}
          <div className="absolute bottom-12 right-8 sm:right-32 animate-float-reverse opacity-15">
            <IsometricWireframeCube
              size={56}
              color="#64748B"
              secondaryColor="#14B8A6"
              fillOpacity={0.07}
              strokeWidth={1.3}
              className="transform -rotate-6"
            />
          </div>

          {/* Cube 6: Middle Left Accent */}
          <div className="absolute top-1/2 left-2 sm:left-8 -translate-y-1/2 animate-float-gentle opacity-12 hidden lg:block">
            <IsometricWireframeCube
              size={64}
              color="#0F766E"
              secondaryColor="#94A3B8"
              fillOpacity={0.06}
              strokeWidth={1.2}
              className="transform rotate-[18deg]"
            />
          </div>
        </div>
      )}
    </div>
  );
}

