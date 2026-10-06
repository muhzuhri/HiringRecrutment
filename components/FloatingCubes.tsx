"use client";

import { useEffect, useRef } from "react";

interface Cube {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  speedRot: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  opacity: number;
  color: string;
}

const COLORS = [
  "rgba(21,128,61,",
  "rgba(34,197,94,",
  "rgba(16,185,129,",
  "rgba(20,83,45,",
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createCube(width: number, height: number): Cube {
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    size: randomBetween(20, 60),
    speedX: randomBetween(-0.25, 0.25),
    speedY: randomBetween(-0.2, -0.6),
    speedRot: randomBetween(0.2, 0.6),
    rotX: randomBetween(0, 360),
    rotY: randomBetween(0, 360),
    rotZ: randomBetween(0, 360),
    opacity: randomBetween(0.06, 0.18),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export default function FloatingCubes({ count = 18 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubesRef = useRef<Cube[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize cubes spread across full height
    cubesRef.current = Array.from({ length: count }, () =>
      createCube(canvas.width, canvas.height)
    );

    function drawCubeFace(
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      rotX: number,
      rotY: number,
      rotZ: number,
      color: string,
      opacity: number
    ) {
      // Draw an isometric-style 3D cube using 6 faces projected manually
      const s = size / 2;
      // 3D vertices of a cube
      const vertices: [number, number, number][] = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s,  s], [s, -s,  s], [s, s,  s], [-s, s,  s],
      ];

      const rX = (rotX * Math.PI) / 180;
      const rY = (rotY * Math.PI) / 180;
      const rZ = (rotZ * Math.PI) / 180;

      // Rotate each vertex
      const projected = vertices.map(([x, y, z]) => {
        // Rotate around X
        let y1 = y * Math.cos(rX) - z * Math.sin(rX);
        let z1 = y * Math.sin(rX) + z * Math.cos(rX);
        // Rotate around Y
        let x2 = x * Math.cos(rY) + z1 * Math.sin(rY);
        let z2 = -x * Math.sin(rY) + z1 * Math.cos(rY);
        // Rotate around Z
        let x3 = x2 * Math.cos(rZ) - y1 * Math.sin(rZ);
        let y3 = x2 * Math.sin(rZ) + y1 * Math.cos(rZ);
        return [cx + x3, cy + y3] as [number, number];
      });

      // Faces: [vertex indices, brightness multiplier]
      const faces: [number[], number][] = [
        [[0, 1, 2, 3], 0.7], // back
        [[4, 5, 6, 7], 1.0], // front
        [[0, 1, 5, 4], 0.8], // top
        [[2, 3, 7, 6], 0.5], // bottom
        [[1, 2, 6, 5], 0.9], // right
        [[0, 3, 7, 4], 0.6], // left
      ];

      faces.forEach(([indices, brightness]) => {
        ctx.beginPath();
        indices.forEach((vi, i) => {
          const [px, py] = projected[vi];
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = `${color}${(opacity * brightness).toFixed(3)})`;
        ctx.strokeStyle = `${color}${(opacity * 1.5).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.fill();
        ctx.stroke();
      });
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      cubesRef.current.forEach((cube) => {
        cube.x += cube.speedX;
        cube.y += cube.speedY;
        cube.rotX += cube.speedRot * 0.7;
        cube.rotY += cube.speedRot;
        cube.rotZ += cube.speedRot * 0.5;

        // Reset when out of bounds
        if (cube.y < -cube.size * 2) {
          cube.y = canvas.height + cube.size;
          cube.x = randomBetween(0, canvas.width);
        }
        if (cube.x < -cube.size * 2) cube.x = canvas.width + cube.size;
        if (cube.x > canvas.width + cube.size * 2) cube.x = -cube.size;

        drawCubeFace(
          ctx,
          cube.x,
          cube.y,
          cube.size,
          cube.rotX,
          cube.rotY,
          cube.rotZ,
          cube.color,
          cube.opacity
        );
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
