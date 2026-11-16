"use client";

import { useEffect, useState } from "react";
import { identity } from "@/data/identity";
import { projects } from "@/data/projects";

type SectionIntroProps = {
  index: string;
  label: string;
  children: React.ReactNode;
};

function SectionIntro({ index, label, children }: SectionIntroProps) {
  return (
    <div className="section-intro">
      <div className="section-intro__index">
        <span>{index}</span>
        <span>{label}</span>
      </div>
      <div className="section-intro__heading">{children}</div>
    </div>
  );
}

export function AboutSection() {
  return (
    <section className="content-section" id="about" aria-labelledby="about-title">
      <SectionIntro index="01" label="ABOUT / PROFILE">
        <h2 id="about-title">
          I build the systems that make products work <em>in real time.</em>
        </h2>
      </SectionIntro>

      <div className="about-layout">
        <div className="about-copy">
          <p className="about-copy__lead">
            I’m a computer science student and backend-focused builder. I’m drawn
            to the part between a request and a useful result: the transport,
            state, queue, model call, persistence and recovery paths that decide
            how a product behaves.
          </p>
          <p>
            My projects span live multilingual audio, marketing intelligence,
            engineering-readiness tools and real-time collaboration. I like
            understanding the machinery underneath a product, then using that
            understanding to build something people can actually use.
          </p>
        </div>

        <dl className="profile-spec">
          <div>
            <dt>CURRENT FOCUS</dt>
            <dd>Voice AI · Backend systems · Distributed infrastructure</dd>
          </div>
          <div>
            <dt>CORE TOOLS</dt>
            <dd>TypeScript · Node.js · PostgreSQL · Redis</dd>
          </div>
          <div>
            <dt>EXPLORING</dt>
            <dd>Rust / Go · WebRTC · AI systems evaluation</dd>
          </div>
          <div>
            <dt>BASED IN</dt>
            <dd>{identity.location}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function ProjectsSection() {
  const [activeProject, setActiveProject] = useState("01");

  useEffect(() => {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>("[data-project-number]"),
    );
    if (!rows.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const activeNumber = activeEntries[0]?.target.getAttribute(
          "data-project-number",
        );
        if (activeNumber) setActiveProject(activeNumber);
      },
      {
        rootMargin: "-38% 0px -48% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 1],
      },
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="content-section projects-section"
      id="projects"
      aria-labelledby="projects-title"
    >
      <div className="projects-sticky">
        <div className="section-intro__index">
          <span>02</span>
          <span>PROJECTS / SELECTED BUILDS</span>
        </div>
        <h2 id="projects-title">
          Products and systems, built by working through the <em>hard parts.</em>
        </h2>
        <div className="projects-counter" aria-live="polite">
          <span>{activeProject}</span>
          <span>/ {String(projects.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article
            className="project-row"
            id={`project-${project.number}`}
            data-project-number={project.number}
            key={project.number}
            tabIndex={0}
            aria-label={`${project.name}, ${project.category}`}
          >
            <div className="project-row__heading">
              <span className="project-row__number">{project.number}</span>
              <h3>{project.name}</h3>
              <span className="project-row__status">{project.status}</span>
            </div>

            <p className="project-row__summary">{project.summary}</p>

            <div className="project-row__meta">
              <span className="project-row__category">{project.category}</span>
              <span className="project-row__stack">
                {project.stack.join(" · ")}
              </span>
            </div>

            <div className="project-row__detail">
              <div className="project-row__detail-inner">
                <div className="project-row__engineering">
                  <span>ENGINEERING FOCUS</span>
                  <p>{project.engineering}</p>
                </div>
                <div className="project-row__links">
                  <a href={project.repository} target="_blank" rel="noreferrer">
                    SOURCE CODE <span aria-hidden="true">↗</span>
                  </a>
                  {project.live ? (
                    <a href={project.live} target="_blank" rel="noreferrer">
                      LIVE PROJECT <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContactSection() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      className="content-section contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="section-intro__index">
        <span>03</span>
        <span>CONTACT</span>
      </div>

      <div className="contact-content">
        <h2 id="contact-title">
          Have a problem worth building around?
        </h2>
        <p>
          I’m open to backend, real-time systems and voice AI opportunities,
          especially where there’s meaningful engineering to do.
        </p>

        <div className="contact-email-row">
          <a className="contact-email" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
          <button
            type="button"
            className="copy-email"
            onClick={copyEmail}
            aria-label={copied ? "Email address copied" : "Copy email address"}
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>

      <nav className="contact-links" aria-label="Contact links">
        <a href={identity.github} target="_blank" rel="noreferrer">GITHUB ↗</a>
        <a href={identity.x} target="_blank" rel="noreferrer">X ↗</a>
        <a href={identity.resume} target="_blank" rel="noreferrer">RESUME PDF ↗</a>
      </nav>

      <footer className="portfolio-footer">
        <span>PIYUSH RAJ</span>
        <span>INDIA · IST</span>
        <span>© 2026</span>
      </footer>
    </section>
  );
}
