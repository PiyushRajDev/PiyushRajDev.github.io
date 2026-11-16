import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-static";
export const alt =
  "Piyush Raj — Backend Systems Engineer portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const avatarSrc = "data:image/webp;base64,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";

  const ridges = Array.from({ length: 25 }, (_, row) => {
    const y = 26 + row * 11.2;
    const amp = row > 8 && row < 20 ? 9 : 3.2;
    const points = Array.from({ length: 72 }, (_, index) => {
      const x = index * 7.1;
      const wave =
        Math.exp(-Math.pow((index - 28) / 5.8, 2)) * amp +
        Math.exp(-Math.pow((index - 48) / 4.2, 2)) * amp * 0.65 +
        Math.exp(-Math.pow((index - 58) / 3.3, 2)) * amp * 0.42;
      return `${x},${y - wave}`;
    }).join(" ");

    return (
      <polyline
        key={row}
        points={points}
        fill="none"
        stroke={row > 8 && row < 20 ? "#d8d0c4" : "#77716a"}
        strokeWidth="1.25"
        opacity={0.35 + (row / 25) * 0.52}
      />
    );
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#11100f",
          color: "#f1eee6",
          padding: "42px 54px 34px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #4b4540",
            paddingBottom: "17px",
            color: "#b7afa4",
            fontFamily: "monospace",
            fontSize: "16px",
            letterSpacing: "2px",
          }}
        >
          <span style={{ color: "#f1eee6", fontWeight: 700 }}>PR / 26</span>
          <span>DOC PR-2026 / REV 4</span>
          <span>INDIA · IST</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            gap: "34px",
            paddingTop: "22px",
            paddingBottom: "15px",
          }}
        >
          <div
            style={{
              width: "53%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "22px",
                marginBottom: "22px",
              }}
            >
              <img
                src={avatarSrc}
                width="112"
                height="112"
                style={{
                  width: "112px",
                  height: "112px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border: "1px solid #4b4540",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: "76px",
                    lineHeight: 0.9,
                    fontWeight: 800,
                    letterSpacing: "-5px",
                  }}
                >
                  PIYUSH
                </span>
                <span
                  style={{
                    fontSize: "76px",
                    lineHeight: 0.9,
                    fontWeight: 800,
                    letterSpacing: "-5px",
                  }}
                >
                  RAJ<span style={{ color: "#f4512a" }}>.</span>
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: "27px",
                lineHeight: 1.2,
                fontWeight: 600,
                maxWidth: "560px",
              }}
            >
              Backend systems engineer building real-time systems.
            </div>
            <div
              style={{
                color: "#aaa198",
                fontSize: "19px",
                lineHeight: 1.45,
                marginTop: "12px",
                maxWidth: "540px",
              }}
            >
              Systems where latency, state, concurrency and failure are part
              of the design.
            </div>
          </div>

          <div
            style={{
              width: "47%",
              height: "365px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg width="540" height="330" viewBox="0 0 520 310">
              {ridges}
            </svg>
            <div
              style={{
                position: "absolute",
                right: "4px",
                top: "45%",
                color: "#9a9187",
                fontSize: "12px",
                fontFamily: "monospace",
                letterSpacing: "2px",
                writingMode: "vertical-rl",
              }}
            >
              TIME →
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #f4512a",
            paddingTop: "18px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span
              style={{
                fontSize: "25px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              PIYUSH RAJ
            </span>
            <span
              style={{
                color: "#aaa198",
                fontSize: "13px",
                fontFamily: "monospace",
                letterSpacing: "2px",
              }}
            >
              BACKEND SYSTEMS / REAL-TIME / DISTRIBUTED
            </span>
          </div>
          <span
            style={{
              color: "#aaa198",
              fontFamily: "monospace",
              fontSize: "15px",
              letterSpacing: "1px",
            }}
          >
            PIYUSHRAJDEV.GITHUB.IO
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
