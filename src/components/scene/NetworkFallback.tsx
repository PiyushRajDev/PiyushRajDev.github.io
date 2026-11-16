export function NetworkFallback() {
  return (
    <svg
      className="network-fallback"
      viewBox="0 0 620 520"
      role="img"
      aria-label="Distributed system node graph with one active request node"
    >
      <g className="network-fallback__edges">
        <path d="M112 158 214 94 330 143 445 87 528 170" />
        <path d="M112 158 174 278 286 240 330 143" />
        <path d="M214 94 286 240 416 292 528 170" />
        <path d="M174 278 103 390 230 430 286 240" />
        <path d="M286 240 365 408 416 292 528 170" />
        <path d="M416 292 522 388 365 408" />
        <path d="M330 143 365 408" />
        <path d="M214 94 103 390" />
        <path d="M445 87 522 388" />
      </g>
      <g className="network-fallback__nodes">
        <circle cx="112" cy="158" r="5" />
        <circle cx="214" cy="94" r="5" />
        <circle cx="330" cy="143" r="5" />
        <circle cx="445" cy="87" r="5" />
        <circle cx="528" cy="170" r="5" />
        <circle cx="174" cy="278" r="5" />
        <circle cx="286" cy="240" r="6" />
        <circle cx="416" cy="292" r="5" />
        <circle cx="103" cy="390" r="5" />
        <circle cx="230" cy="430" r="5" />
        <circle cx="365" cy="408" r="5" />
        <circle cx="522" cy="388" r="5" />
      </g>
      <g className="network-fallback__request">
        <circle cx="286" cy="240" r="13" />
        <circle cx="286" cy="240" r="4" />
      </g>
      <g className="network-fallback__labels">
        <text x="112" y="138">EDGE / 01</text>
        <text x="445" y="66">WORKER / N</text>
        <text x="365" y="444">STATE STORE</text>
        <text x="286" y="212">ACTIVE REQUEST</text>
      </g>
    </svg>
  );
}
