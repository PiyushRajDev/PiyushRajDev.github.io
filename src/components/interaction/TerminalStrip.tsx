"use client";

import { FormEvent, useState } from "react";
import { identity } from "@/data/identity";

type TerminalLine = {
  command: string;
  response: string;
};

const COMMANDS = ["about", "projects", "contact", "resume"];

export function TerminalStrip() {
  const [value, setValue] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([]);

  function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = value.trim().toLowerCase();
    if (!command) return;

    if (command === "clear") {
      setLines([]);
      setValue("");
      return;
    }

    let response: string;

    if (command === "help") {
      response = "AVAILABLE: about · projects · contact · resume · clear";
    } else if (command === "whoami") {
      response = "PIYUSH RAJ / BACKEND SYSTEMS ENGINEER / INDIA";
    } else if (command === "time") {
      response = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "long",
      }).format(new Date());
    } else if (COMMANDS.includes(command)) {
      const target = document.getElementById(command);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        response = `ROUTING TO /\${command.toUpperCase()}`;
      } else {
        response = `/\${command.toUpperCase()} IS QUEUED FOR THE NEXT BUILD PHASE.`;
      }
      if (command === "contact" && !target) {
        response += ` EMAIL: ${identity.email}`;
      }
    } else {
      response = `UNKNOWN COMMAND: ${command}. TYPE help.`;
    }

    setLines((previous) => [...previous.slice(-2), { command, response }]);
    setValue("");
  }

  return (
    <div className="terminal" aria-label="Portfolio command terminal">
      <div className="terminal__label">
        <span className="terminal__prompt-mark">›</span>
        <span>COMMAND LINE</span>
        <span className="terminal__hint">TYPE help</span>
      </div>
      <div className="terminal__body">
        <div className="terminal__output" aria-live="polite">
          {lines.map((line, index) => (
            <p className="terminal__line" key={`${line.command}-${index}`}>
              <span className="terminal__echo">/{line.command}</span>
              <span>{line.response}</span>
            </p>
          ))}
        </div>
        <form className="terminal__form" onSubmit={runCommand}>
          <label className="terminal__prompt" htmlFor="terminal-command">
            pr@portfolio:~$
          </label>
          <input
            id="terminal-command"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="help"
            aria-label="Enter a portfolio command"
          />
          <button type="submit" aria-label="Run command">
            ↵
          </button>
        </form>
      </div>
    </div>
  );
}
