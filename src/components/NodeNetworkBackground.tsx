"use client";

import { useEffect, useRef } from "react";

class Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  radius: number;
  color: string;

  constructor() {
    this.x = (Math.random() - 0.5) * 2000;
    this.y = (Math.random() - 0.5) * 2000;
    this.z = Math.random() * 2000;
    this.pz = this.z;

    this.radius = Math.random() * 1.5 + 0.5;

    const rand = Math.random();

    if (rand > 0.8) {
      this.color = "rgba(16, 185, 129, 0.9)";
    } else if (rand > 0.6) {
      this.color = "rgba(45, 212, 191, 0.7)";
    } else {
      this.color = "rgba(161, 161, 170, 0.5)";
    }
  }

  update(speed: number) {
    this.pz = this.z;
    this.z -= speed;

    if (this.z < 1) {
      this.z = 2000;
      this.pz = 2000;
      this.x = (Math.random() - 0.5) * 2000;
      this.y = (Math.random() - 0.5) * 2000;
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentMouse: { x: number; y: number }
  ) {
    const fov = 350;

    const sx = (this.x / this.z) * fov + width / 2;
    const sy = (this.y / this.z) * fov + height / 2;

    const px = (this.x / this.pz) * fov + width / 2;
    const py = (this.y / this.pz) * fov + height / 2;

    const dx =
      ((currentMouse.x - width / 2) * 0.05 * 2000) / this.z;
    const dy =
      ((currentMouse.y - height / 2) * 0.05 * 2000) / this.z;

    const drawX = sx - dx;
    const drawY = sy - dy;
    const pDrawX = px - dx;
    const pDrawY = py - dy;

    const size = this.radius * (fov / this.z);
    const opacity = 1 - this.z / 2000;

    ctx.beginPath();
    ctx.moveTo(pDrawX, pDrawY);
    ctx.lineTo(drawX, drawY);

    ctx.strokeStyle = this.color.replace(
      /[\d.]+\)$/g,
      `${opacity})`
    );

    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  }
}

export const NodeNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId = 0;

    const mouse = {
      x: width / 2,
      y: height / 2,
    };

    const currentMouse = {
      x: width / 2,
      y: height / 2,
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const stars: Star[] = [];
    const starCount = Math.floor((width * height) / 800);

    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    const animate = () => {
      currentMouse.x += (mouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (mouse.y - currentMouse.y) * 0.05;

      ctx.fillStyle = "rgba(9, 9, 11, 0.4)";
      ctx.fillRect(0, 0, width, height);

      const speedOffset =
        Math.abs(currentMouse.x - width / 2) / (width / 2 || 1);

      const warpSpeed = 1.5 + speedOffset * 8;

      stars.forEach((star) => {
        star.update(warpSpeed);
        star.draw(ctx, width, height, currentMouse);
      });

      const coreX =
        width / 2 - (currentMouse.x - width / 2) * 0.02;

      const coreY =
        height / 2 - (currentMouse.y - height / 2) * 0.02;

      const gradient = ctx.createRadialGradient(
        coreX,
        coreY,
        0,
        coreX,
        coreY,
        width / 3
      );

      gradient.addColorStop(0, "rgba(5, 150, 105, 0.08)");
      gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.02)");
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "screen";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
};