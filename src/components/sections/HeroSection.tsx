"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { identity } from "@/data/identity";
import { useISTClock } from "@/hooks/useISTClock";
import { NetworkSceneLoader } from "@/components/scene/NetworkSceneLoader";
import { TerminalStrip } from "@/components/interaction/TerminalStrip";

const navigation = [
  { label: "ABOUT", href: "#about", index: "01" },
  { label: "PROJECTS", href: "#projects", index: "02" },
  { label: "SYSTEMS", href: "#systems", index: "03" },
  { label: "CONTACT", href: "#contact", index: "04" },
];

export function HeroSection() {
  const time = useISTClock();

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-mask-line",
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.82,
          stagger: 0.04,
          ease: "power3.inOut",
          delay: 0.12,
        },
      );

      gsap.fromTo(
        ".hero-meta-reveal",
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.62,
          stagger: 0.05,
          ease: "power3.inOut",
          delay: 0.36,
        },
      );
    });

    return () => context.revert();
  }, []);

  return (
    <section className="hero-paper" id="hero">
      <div className="column-guides" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <span className="registration registration--top-left" aria-hidden="true" />
      <span className="registration registration--top-right" aria-hidden="true" />
      <span className="registration registration--bottom-left" aria-hidden="true" />
      <span className="registration registration--bottom-right" aria-hidden="true" />

      <div className="hero-shell">
        <header className="spec-header">
          <a className="spec-mark" href="#hero" aria-label="Piyush Raj home">
            PR<span>/</span>26
          </a>
          <div className="spec-header__meta">
            <span>{identity.documentId}</span>
            <span>{identity.location}</span>
          </div>
          <div className="spec-header__status">
            <span className="status-dot" />
            <span>OPEN TO INTERNSHIPS</span>
          </div>
          <time className="spec-clock" dateTime={time}>
            {time} <span>IST</span>
          </time>
        </header>

        <nav className="spec-nav" aria-label="Primary navigation">
          <span className="spec-nav__label">INDEX / 00—04</span>
          <div className="spec-nav__links">
            {navigation.map((item) => (
              <a key={item.index} href={item.href}>
                <span>{item.index}</span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="hero-main">
          <div className="hero-copy">
            <h1 className="hero-name" aria-label={identity.name}>
              <span className="hero-mask-line">PIYUSH</span>
              <span className="hero-name__line">
                <span className="hero-mask-line">RAJ</span>
                <span className="hero-name__square" aria-hidden="true" />
              </span>
            </h1>

            <p className="hero-role hero-meta-reveal">
              Backend systems engineer building real-time systems.
            </p>

            <p className="hero-detail hero-meta-reveal">
              Systems where latency, state, concurrency and failure are part of the design.
            </p>

            <div className="current-build hero-meta-reveal">
              <span className="status-dot" />
              <span className="current-build__label">CURRENTLY BUILDING</span>
              <span className="current-build__project">{identity.currentProject}</span>
              <span className="current-build__revision">[ACTIVE]</span>
            </div>

            <div className="hero-links hero-meta-reveal">
              <a href="#projects" className="text-link">
                INSPECT PROJECTS <span aria-hidden="true">↘</span>
              </a>
              <a
                href={identity.github}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                GITHUB <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <aside
            className="hero-visual"
            aria-label="Distributed system components: Client, Edge, Redis, BullMQ queue, Worker, Postgres and Elasticsearch"
          >
            <NetworkSceneLoader />
          </aside>
        </div>

        <div className="hero-data-strip" aria-label="Engineering profile metadata">
          <div>
            <span>PRIMARY DOMAIN</span>
            <strong>BACKEND SYSTEMS</strong>
          </div>
          <div>
            <span>INTERESTS</span>
            <strong>REAL-TIME · DISTRIBUTED · AI INFRA</strong>
          </div>
          <div>
            <span>LOCATION</span>
            <strong>INDIA / UTC+05:30</strong>
          </div>
          <div>
            <span>REVISION</span>
            <strong>16 NOV 2026</strong>
          </div>
        </div>

        <TerminalStrip />

      </div>
    </section>
  );
}
