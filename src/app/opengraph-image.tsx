import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt =
  "Piyush Raj — Backend Systems Engineer portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const avatarData = await readFile(
    join(process.cwd(), "public", "piyush-avatar.webp"),
    "base64",
  );
  const avatarSrc = `data:image/webp;base64,${avatarData}`;

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
