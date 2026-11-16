"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { forwardRef, type SVGProps, useEffect, useRef, useState } from "react";

const FLIGHT_DURATION_MS = 1680;
const LAUNCH_DELAY_MS = 320;
const BIRD_WIDTH = 78;
const BIRD_HEIGHT = 58;

type Point = { x: number; y: number };

const PigeonFlight = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function PigeonFlight({ style }, ref) {
  return (
    <svg
      ref={ref}
      className="pigeon-flight"
      style={style}
      viewBox="0 0 90 64"
      aria-hidden="true"
      focusable="false"
    >
      <g className="pigeon-flight__body">
        <path d="M11 43c-2-5 0-11 5-15l-7-5 13 2c6-7 16-10 26-7 6-7 14-9 21-5 6 3 8 9 5 15 8 4 11 11 7 17-5 7-17 7-26 3-9 6-22 7-33 2-5-2-8-4-11-7Z" />
        <path d="M12 39 2 31l14 3M14 43 4 42l12-4" />
        <circle cx="60" cy="19" r="9" />
        <path d="M67 18 81 22 68 26Z" className="pigeon-flight__beak" />
      </g>
      <path
        className="pigeon-flight__wing"
        d="M29 34c1-12 8-20 18-18 9 2 13 9 11 17-6-4-10-3-14 2-5 4-10 4-15-1Z"
      />
      <path
        className="pigeon-flight__feathers"
        d="m34 29 8-9m-1 12 9-9m-1 12 8-7"
      />
      <g className="pigeon-flight__letter">
        <path d="M69 25h15v11H69z" />
        <path d="m69 26 7.5 5.5L84 26" />
        <circle cx="81" cy="34" r="1.5" />
      </g>
      <circle className="pigeon-flight__eye" cx="63" cy="17" r="1.25" />
    </svg>
  );
  },
);

export function HeroAvatarFlight() {
  const avatarRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<SVGSVGElement>(null);
  const [arrived, setArrived] = useState(false);
  const [flying, setFlying] = useState(false);
  const [flightOrigin, setFlightOrigin] = useState<Point | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      const revealFrame = window.requestAnimationFrame(() => {
        setArrived(true);
      });

      return () => window.cancelAnimationFrame(revealFrame);
    }

    let pointer: Point = {
      x: window.innerWidth * 0.48,
      y: window.innerHeight * 0.55,
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    let launchTimer = 0;
    let frameId = 0;
    let cancelled = false;

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        cancelled = true;
        window.clearTimeout(launchTimer);
        window.cancelAnimationFrame(frameId);
        setFlying(false);
        setArrived(true);
      }
    };

    reducedMotion.addEventListener("change", handleMotionChange);

    launchTimer = window.setTimeout(() => {
      const bounds = avatarRef.current?.getBoundingClientRect();

      if (!bounds || cancelled) {
        setArrived(true);
        return;
      }

      const start = { ...pointer };
      const destination = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      };

      const dx = destination.x - start.x;
      const lift = Math.min(190, Math.max(72, Math.abs(dx) * 0.17 + 72));
      const firstControl = {
        x: start.x + dx * 0.22,
        y: start.y - lift,
      };
      const secondControl = {
        x: start.x + dx * 0.78,
        y: destination.y - lift * 0.42,
      };

      setFlightOrigin(start);
      setFlying(true);

      const startedAt = performance.now();

      const animate = (now: number) => {
        if (cancelled) return;

        const progress = Math.min(
          1,
          (now - startedAt) / FLIGHT_DURATION_MS,
        );
        const t = progress * progress * (3 - 2 * progress);
        const u = 1 - t;

        const x =
          u * u * u * start.x +
          3 * u * u * t * firstControl.x +
          3 * u * t * t * secondControl.x +
          t * t * t * destination.x;

        const y =
          u * u * u * start.y +
          3 * u * u * t * firstControl.y +
          3 * u * t * t * secondControl.y +
          t * t * t * destination.y;

        const tangentX =
          3 * u * u * (firstControl.x - start.x) +
          6 * u * t * (secondControl.x - firstControl.x) +
          3 * t * t * (destination.x - secondControl.x);

        const tangentY =
          3 * u * u * (firstControl.y - start.y) +
          6 * u * t * (secondControl.y - firstControl.y) +
          3 * t * t * (destination.y - secondControl.y);

        const angle = Math.atan2(tangentY, tangentX) * (180 / Math.PI);

        if (birdRef.current) {
          birdRef.current.style.transform =
            `translate3d(${x - BIRD_WIDTH / 2}px, ${y - BIRD_HEIGHT / 2}px, 0) rotate(${angle}deg)`;
        }

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animate);
        } else {
          setFlying(false);
          setArrived(true);
        }
      };

      frameId = window.requestAnimationFrame(animate);
    }, LAUNCH_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(launchTimer);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <>
      <div
        ref={avatarRef}
        className={`hero-avatar${arrived ? " hero-avatar--revealed" : ""}`}
      >
        <Image
          src="/piyush-avatar.webp"
          alt="Portrait of Piyush Raj"
          fill
          priority
          sizes="(max-width: 767px) 72px, 108px"
          className="hero-avatar__image"
        />
      </div>

      {flying && flightOrigin
        ? createPortal(
            <PigeonFlight
              ref={birdRef}
              style={{
                transform: `translate3d(${flightOrigin.x - BIRD_WIDTH / 2}px, ${flightOrigin.y - BIRD_HEIGHT / 2}px, 0)`,
              }}
            />,
            document.body,
          )
        : null}
    </>
  );
}
