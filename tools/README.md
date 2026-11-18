# Profile fight animation

`duel.py` is the source for `../assets/bug-vs-dev.svg`. The SVG is generated from a single 32-second choreography timeline and uses SVG SMIL only, so the profile image has no JavaScript runtime or external asset dependency.

## Build and validate

From the repository root:

```bash
python tools/duel.py
python tools/duel.py --check
```

The generator uses only Python's standard library. It validates XML structure, unique IDs, local SVG references, and every animation channel's `values` / `keyTimes` alignment before writing.

## Preview and scrub

```bash
python -m http.server 8000
```

Open `http://localhost:8000/tools/preview.html`. The preview page has play/pause, speed controls, a scrubber, and markers for the major fight beats.

## Choreography

| Time | Beat |
|---|---|
| 0–2s | Boot and character entrance |
| 2–6s | Boss reveal, fight banner, parry |
| 6–8.5s | Jump dodge |
| 8.5–12.5s | Three-hit combo and damage feedback |
| 12.5–15.5s | Boss counterattack |
| 15.5–19s | Charge-up |
| 19–23s | Margin Storm finisher |
| 23–25.5s | Split, K.O. and debris |
| 25.5–29s | Victory state |
| 29–32s | Reset and loop |
