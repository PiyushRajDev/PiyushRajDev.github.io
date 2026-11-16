import type { ReactNode } from "react";
import { identity } from "@/data/identity";
import { projects } from "@/data/projects";

type SectionIntroProps = {
  index: string;
  label: string;
  children: ReactNode;
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
      <SectionIntro index="01" label="PROFILE / OPERATING CONTEXT">
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
  return (
    <section className="content-section" id="projects" aria-labelledby="projects-title">
      <SectionIntro index="02" label="SELECTED BUILDS / PROJECT INDEX">
        <h2 id="projects-title">
          Products and systems, built by working through the <em>hard parts.</em>
        </h2>
      </SectionIntro>

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.number}>
            <div className="project-card__meta">
              <span>{project.number} / 05</span>
              <span>{project.category}</span>
            </div>

            <h3>{project.name}</h3>
            <p className="project-card__summary">{project.summary}</p>

            <div className="project-card__engineering">
              <span>ENGINEERING FOCUS</span>
              <p>{project.engineering}</p>
            </div>

            <div className="project-card__footer">
              <div className="project-card__stack" aria-label="Technology stack">
                {project.stack.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
              <div className="project-card__links">
                <a href={project.repository} target="_blank" rel="noreferrer">
                  SOURCE <span aria-hidden="true">↗</span>
                </a>
                {project.live ? (
                  <a href={project.live} target="_blank" rel="noreferrer">
                    LIVE <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const systemFocus = [
  {
    number: "01",
    label: "TRANSPORT",
    title: "Move information deliberately.",
    description:
      "Streaming boundaries, message ordering, reconnects and latency are part of the product contract.",
    topics: "WEBSOCKET / WEBRTC / AUDIO STREAMS",
  },
  {
    number: "02",
    label: "STATE",
    title: "Make ownership explicit.",
    description:
      "Sessions, rooms and jobs need clear lifetimes, consistency rules and cleanup paths.",
    topics: "LIFECYCLE / CONSISTENCY / IDEMPOTENCY",
  },
  {
    number: "03",
    label: "EXECUTION",
    title: "Keep work bounded.",
    description:
      "Queues, workers and concurrency limits keep bursts from turning into cascading failures.",
    topics: "QUEUES / WORKERS / BACKPRESSURE",
  },
  {
    number: "04",
    label: "RECOVERY",
    title: "Design for the partial failure.",
    description:
      "Timeouts, cancellation, retries and observability should exist before a dependency goes down.",
    topics: "TIMEOUTS / RETRIES / TELEMETRY",
  },
] as const;

export function SystemsSection() {
  return (
    <section className="content-section" id="systems" aria-labelledby="systems-title">
      <SectionIntro index="03" label="ENGINEERING / SYSTEMS THINKING">
        <h2 id="systems-title">
          A system is the decisions <em>around the code.</em>
        </h2>
      </SectionIntro>

      <div className="systems-grid">
        {systemFocus.map((item) => (
          <article className="systems-item" key={item.number}>
            <div className="systems-item__index">
              <span>{item.number}</span>
              <span>{item.label}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className="systems-item__topics">{item.topics}</span>
          </article>
        ))}
      </div>

      <div className="systems-flow" aria-label="A typical system path">
        <span>REQUEST</span>
        <b aria-hidden="true">→</b>
        <span>TRANSPORT</span>
        <b aria-hidden="true">→</b>
        <span>QUEUE</span>
        <b aria-hidden="true">→</b>
        <span>WORKER</span>
        <b aria-hidden="true">→</b>
        <span>STORAGE</span>
        <b aria-hidden="true">→</b>
        <span>TELEMETRY</span>
      </div>
    </section>
  );
}

const principles = [
  {
    number: "01",
    title: "Latency is a product decision.",
    description:
      "In a conversation, a delay changes whether an experience feels natural, interruptible or broken. The budget belongs to the whole pipeline.",
  },
  {
    number: "02",
    title: "State needs an owner.",
    description:
      "Rooms, sessions and jobs all have lifetimes. Hidden shared state and missing cleanup are reliability problems, not implementation details.",
  },
  {
    number: "03",
    title: "Failure is a normal path.",
    description:
      "Dependencies stall, streams disconnect and workers retry. A resilient system makes those paths visible and gives them deliberate behaviour.",
  },
] as const;

export function ThinkingSection() {
  return (
    <section className="content-section" id="thinking" aria-labelledby="thinking-title">
      <SectionIntro index="04" label="FIELD NOTES / PRINCIPLES">
        <h2 id="thinking-title">
          Questions I keep asking <em>while I build.</em>
        </h2>
      </SectionIntro>

      <div className="thinking-grid">
        {principles.map((item) => (
          <article className="thinking-item" key={item.number}>
            <span className="thinking-item__number">{item.number} / NOTE</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <a
        className="section-outbound"
        href={identity.x}
        target="_blank"
        rel="noreferrer"
      >
        FOLLOW THE BUILD NOTES ON X <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="content-section content-section--contact" id="contact" aria-labelledby="contact-title">
      <SectionIntro index="05" label="CONTACT / NEXT CONNECTION">
        <h2 id="contact-title">
          Have a problem worth <em>building around?</em>
        </h2>
      </SectionIntro>

      <div className="contact-layout">
        <p>
          I’m open to backend, real-time systems and voice AI opportunities,
          especially where there’s meaningful engineering to do.
        </p>
        <a className="contact-email" href={`mailto:${identity.email}`}>
          {identity.email} <span aria-hidden="true">↗</span>
        </a>
      </div>

      <footer className="portfolio-footer">
        <span>PIYUSH RAJ / INDIA · IST</span>
        <div>
          <a href={identity.github} target="_blank" rel="noreferrer">GITHUB ↗</a>
          <a href={identity.x} target="_blank" rel="noreferrer">X ↗</a>
          <a href={`mailto:${identity.email}`}>EMAIL ↗</a>
        </div>
        <span>BUILT WITH INTENT / © 2026</span>
      </footer>
    </section>
  );
}
