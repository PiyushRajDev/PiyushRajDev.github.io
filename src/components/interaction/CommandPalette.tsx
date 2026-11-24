"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { identity } from "@/data/identity";
import { projects } from "@/data/projects";
import { toggleTheme } from "@/lib/theme";

type PaletteAction =
  | { type: "navigate"; href: string }
  | { type: "copy-email" }
  | { type: "resume" }
  | { type: "toggle-theme" };

type PaletteItem = {
  id: string;
  label: string;
  detail: string;
  keywords: string;
  action: PaletteAction;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const listId = useId();

  const items = useMemo<PaletteItem[]>(() => {
    const sections: PaletteItem[] = [
      {
        id: "about",
        label: "About",
        detail: "SECTION / 01",
        keywords: "profile about background",
        action: { type: "navigate", href: "#about" },
      },
      {
        id: "projects",
        label: "Projects",
        detail: "SECTION / 02",
        keywords: "work builds portfolio",
        action: { type: "navigate", href: "#projects" },
      },
      {
        id: "contact",
        label: "Contact",
        detail: "SECTION / 03",
        keywords: "email contact opportunities",
        action: { type: "navigate", href: "#contact" },
      },
    ];

    const projectItems: PaletteItem[] = projects.map((project) => ({
      id: `project-${project.number}`,
      label: project.name,
      detail: `PROJECT / ${project.number}`,
      keywords: `${project.name} ${project.category} ${project.stack.join(" ")}`,
      action: {
        type: "navigate",
        href: `#project-${project.number}`,
      },
    }));

    return [
      ...sections,
      ...projectItems,
      {
        id: "copy-email",
        label: "Copy email address",
        detail: identity.email,
        keywords: "copy email clipboard",
        action: { type: "copy-email" },
      },
      {
        id: "resume",
        label: "Resume PDF",
        detail: "OPEN DOCUMENT",
        keywords: "resume cv pdf",
        action: { type: "resume" },
      },
      {
        id: "theme",
        label: "Toggle theme",
        detail: "LIGHT / DARK",
        keywords: "theme appearance light dark",
        action: { type: "toggle-theme" },
      },
    ];
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      `${item.label} ${item.detail} ${item.keywords}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    requestAnimationFrame(() => previouslyFocused.current?.focus());
  }, []);

  const execute = useCallback(
    async (item: PaletteItem) => {
      switch (item.action.type) {
        case "navigate":
          close();
          window.location.hash = item.action.href;
          break;
        case "copy-email":
          try {
            await navigator.clipboard.writeText(identity.email);
            setNotice("EMAIL COPIED");
          } catch {
            setNotice("CLIPBOARD UNAVAILABLE");
          }
          window.setTimeout(() => setNotice(""), 1500);
          close();
          break;
        case "resume":
          close();
          window.open(identity.resume, "_blank", "noopener,noreferrer");
          break;
        case "toggle-theme":
          toggleTheme();
          close();
          break;
      }
    },
    [close],
  );

  useEffect(() => {
    const openPalette = () => {
      previouslyFocused.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setOpen(true);
    };

    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        close();
        return;
      }

      const isShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";
      if (!isShortcut) return;
      event.preventDefault();
      if (open) {
        close();
      } else {
        openPalette();
      }
    };

    window.addEventListener("portfolio:palette-open", openPalette);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("portfolio:palette-open", openPalette);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, [close, open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.dataset.paletteOpen = "true";
    } else {
      delete document.body.dataset.paletteOpen;
    }
    return () => {
      delete document.body.dataset.paletteOpen;
    };
  }, [open]);

  const handleQueryChange = (value: string) => {
  setQuery(value);
  setActiveIndex(0);
};

  function handleListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filteredItems.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && filteredItems[activeIndex]) {
      event.preventDefault();
      void execute(filteredItems[activeIndex]);
    } else if (event.key === "Tab") {
      const dialog = event.currentTarget;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className="palette-trigger"
        onClick={() => {
          previouslyFocused.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Control+K Meta+K"
        aria-label="Open command menu"
      >
        <span className="palette-trigger__label">COMMANDS</span>
        <span className="palette-trigger__label-short" aria-hidden="true">
          MENU
        </span>
        <kbd>⌘ / CTRL K</kbd>
      </button>

      {notice ? <span className="palette-notice" role="status">{notice}</span> : null}

      {open ? (
        <div
          className="palette-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            className="command-palette"
            role="dialog"
            aria-modal="true"
            aria-labelledby="palette-title"
            onKeyDown={handleListKeyDown}
          >
            <div className="command-palette__topline">
              <h2 id="palette-title">COMMAND INDEX</h2>
              <button type="button" onClick={close} className="palette-close">
                ESC
              </button>
            </div>

            <label className="command-palette__search">
              <span aria-hidden="true">⌕</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search sections, projects, actions..."
                aria-controls={listId}
                aria-label="Search commands"
              />
            </label>

            <div className="command-palette__results" id={listId}>
              {filteredItems.length ? (
                filteredItems.map((item, index) => (
                  <button
                    type="button"
                    className="command-palette__item"
                    data-active={index === activeIndex}
                    key={item.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => void execute(item)}
                  >
                    <span>{item.label}</span>
                    <span>{item.detail}</span>
                  </button>
                ))
              ) : (
                <p className="command-palette__empty">NO MATCHING COMMANDS</p>
              )}
            </div>

            <div className="command-palette__foot">
              <span>↑ ↓ NAVIGATE</span>
              <span>ENTER SELECT</span>
              <span>ESC CLOSE</span>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
