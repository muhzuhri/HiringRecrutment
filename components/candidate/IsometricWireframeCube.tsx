"use client";

import React, { useId } from "react";

interface IsometricWireframeCubeProps {
  size?: number;
  className?: string;
  color?: string; // e.g. #0F766E, #14B8A6, #64748B
  secondaryColor?: string; // e.g. #14B8A6, #94A3B8
  strokeWidth?: number;
  fillOpacity?: number;
  showInnerFaces?: boolean;
}

/**
 * 3D Isometric Wireframe Cube Component
 * Rendered using precision SVG geometric isometric projection.
 * Designed with subtle transparency and wireframe depth lines, matching RuangAman's 3D aesthetics.
 */
export default function IsometricWireframeCube({
  size = 64,
  className = "",
  color = "#0F766E",
  secondaryColor = "#14B8A6",
  strokeWidth = 1.3,
  fillOpacity = 0.08,
  showInnerFaces = true,
}: IsometricWireframeCubeProps) {
  const rawId = useId();
  const gradId = rawId.replace(/:/g, "_");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`grad-top-${gradId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={secondaryColor} stopOpacity={fillOpacity * 1.6} />
          <stop offset="100%" stopColor={color} stopOpacity={fillOpacity * 0.4} />
        </linearGradient>
        <linearGradient
          id={`grad-left-${gradId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 1.8} />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity={fillOpacity * 0.5} />
        </linearGradient>
      </defs>

      {/* Top Rhombus Face */}
      <polygon
        points="50,8 86.37,29 50,50 13.63,29"
        fill={`url(#grad-top-${gradId})`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Left Rhombus Face */}
      <polygon
        points="13.63,29 50,50 50,92 13.63,71"
        fill={`url(#grad-left-${gradId})`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Right Rhombus Face */}
      <polygon
        points="86.37,29 50,50 50,92 86.37,71"
        fill={color}
        fillOpacity={fillOpacity * 0.6}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />

      {/* Center Vertex Lines (Front Y-Shape) */}
      <line
        x1="50"
        y1="50"
        x2="50"
        y2="92"
        stroke={secondaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2="13.63"
        y2="29"
        stroke={secondaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2="86.37"
        y2="29"
        stroke={secondaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Hidden Rear Edges (Dotted Wireframe for 3D X-Ray look) */}
      {showInnerFaces && (
        <g strokeDasharray="3 3" opacity={0.65}>
          <line
            x1="50"
            y1="8"
            x2="50"
            y2="50"
            stroke={color}
            strokeWidth={strokeWidth * 0.8}
          />
          <line
            x1="13.63"
            y1="71"
            x2="50"
            y2="50"
            stroke={color}
            strokeWidth={strokeWidth * 0.8}
          />
          <line
            x1="86.37"
            y1="71"
            x2="50"
            y2="50"
            stroke={color}
            strokeWidth={strokeWidth * 0.8}
          />
        </g>
      )}
    </svg>
  );
}

