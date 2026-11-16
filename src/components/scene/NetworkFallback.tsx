type NetworkFallbackProps = {
  animated?: boolean;
};

const REQUEST_PATH =
  "M 82 105 L 166 225 L 272 112 L 370 225 L 492 108 L 452 365 L 236 392";

export function NetworkFallback({
  animated = true,
}: NetworkFallbackProps) {
  return (
    <svg
      className="network-fallback"
      viewBox="0 0 620 500"
      role="img"
      aria-label="Client, Edge, Redis, BullMQ queue, Worker, Postgres and Elasticsearch connected in request order"
    >
      <g className="network-fallback__edges">
        <path d={REQUEST_PATH} />
        <path d="M 272 112 L 452 365" />
        <path d="M 492 108 L 236 392" />
      </g>

      <g className="network-fallback__nodes">
        <circle cx="82" cy="105" r="5" />
        <circle cx="166" cy="225" r="5" />
        <circle cx="272" cy="112" r="5" />
        <circle cx="370" cy="225" r="5" />
        <circle cx="492" cy="108" r="5" />
        <circle cx="452" cy="365" r="5" />
        <circle cx="236" cy="392" r="5" />
      </g>

      <g className="network-fallback__labels">
        <text x="54" y="78">Client</text>
        <text x="144" y="255">Edge</text>
        <text x="250" y="82">Redis</text>
        <text x="330" y="255">BullMQ queue</text>
        <text x="472" y="78">Worker</text>
        <text x="426" y="397">Postgres</text>
        <text x="190" y="426">Elasticsearch</text>
      </g>

      {animated ? (
        <circle className="network-fallback__pulse" r="6">
          <animateMotion
            dur="14s"
            repeatCount="indefinite"
            path={REQUEST_PATH}
          />
        </circle>
      ) : (
        <circle
          className="network-fallback__pulse"
          cx="82"
          cy="105"
          r="6"
        />
      )}
    </svg>
  );
}
