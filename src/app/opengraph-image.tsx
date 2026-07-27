import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Utopia — private estates in extraordinary places";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Share card — Figma 24.07 `154:8063` (the first of the three OG boards inside
 * `154:8059`).
 *
 * The backdrop is Figma's own render, pre-cropped to exactly the region the
 * frame shows: Figma draws a 2437×1174 image at (-619, -323) inside the 1200×630
 * board, so `og-backdrop.jpg` is that visible window already resolved — which
 * keeps this route from inlining a 4MB source on every render.
 *
 * The three destination cards come out of the Figma export as bordered,
 * *unfilled* rounded frames (their image fills did not survive), so they are
 * rendered here exactly as exported: white 1.053px outlines over the backdrop
 * with their captions. Worth confirming with the designers.
 */
const asset = (p: string) => join(process.cwd(), "public", p);

/** `154:8067` / `154:8072` / `154:8077` — the centre card is the large one. */
const CARDS = [
  { w: 414.335, h: 233.502, r: 10.534, label: "Prea, Brazil", fs: 14.923, left: 12.99, bottom: 13.65, gap: 5.267, icon: 9.656 },
  { w: 517.919, h: 290.561, r: 14.045, label: "Roca, Costa Rica", fs: 16, left: 20.01, bottom: 16.5, gap: 7.023, icon: 10.534 },
  { w: 414.335, h: 233.502, r: 10.534, label: "Cabarete, Dominican Republic", fs: 13, left: 20.02, bottom: 16.94, gap: 5.267, icon: 9.656 },
];

export default async function OpengraphImage() {
  const [display, body, backdrop, wordmark, arrow] = await Promise.all([
    readFile(asset("fonts/gt-ultra-median-light.otf")),
    readFile(asset("fonts/nb-international-regular.otf")),
    readFile(asset("assets/og/og-backdrop.jpg")),
    readFile(asset("assets/og/og-wordmark.svg"), "utf8"),
    readFile(asset("assets/og/og-arrow.svg"), "utf8"),
  ]);

  const backdropSrc = `data:image/jpeg;base64,${backdrop.toString("base64")}`;
  const svg = (s: string) =>
    `data:image/svg+xml;base64,${Buffer.from(s).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#f9f5ea",
        }}
      >
        <img
          src={backdropSrc}
          width={1200}
          height={630}
          style={{ position: "absolute", left: 0, top: 0 }}
          alt=""
        />

        {/* `154:8065` — centred on y=95, GT Ultra Median Light. */}
        <div
          style={{
            position: "absolute",
            top: 95 - 23,
            left: 0,
            width: 1200,
            display: "flex",
            justifyContent: "center",
            fontFamily: "GT Ultra Median",
            fontWeight: 300,
            fontSize: 38,
            lineHeight: 1.2,
            letterSpacing: -0.76,
            color: "#ffffff",
          }}
        >
          Private Estates. Extraordinary Places.
        </div>

        {/* `154:8066` — a 1416.815 row hung off x=-102.07, centred on y=342.28. */}
        <div
          style={{
            position: "absolute",
            left: -102.07,
            top: 342.28 - 290.561 / 2,
            width: 1416.815,
            height: 290.561,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 35.113,
          }}
        >
          {CARDS.map((c) => (
            <div
              key={c.label}
              style={{
                position: "relative",
                display: "flex",
                width: c.w,
                height: c.h,
                borderRadius: c.r,
                border: "1.053px solid #ffffff",
                boxShadow: "0px 11.343px 22.686px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: c.left,
                  bottom: c.bottom,
                  display: "flex",
                  alignItems: "center",
                  gap: c.gap,
                  fontFamily: "NB International Pro",
                  fontSize: c.fs,
                  letterSpacing: c.fs * -0.01,
                  color: "#ffffff",
                }}
              >
                {c.label}
                <img src={svg(arrow)} width={c.icon} height={c.icon} alt="" />
              </div>
            </div>
          ))}
        </div>

        {/* `154:8082` — 156.44×24.59 at (521.28, 549). */}
        <img
          src={svg(wordmark)}
          width={156.44}
          height={24.59}
          style={{ position: "absolute", left: 521.28, top: 549 }}
          alt=""
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "GT Ultra Median", data: display, weight: 300, style: "normal" },
        { name: "NB International Pro", data: body, weight: 400, style: "normal" },
      ],
    },
  );
}
