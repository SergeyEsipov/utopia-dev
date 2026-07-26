import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Home-screen icon: the leaf mark on the brand cream. The mark is read from
 * the same SVG the site uses rather than duplicated here, so it cannot drift
 * — inlined as a data URI because Satori cannot fetch relative paths.
 */
export default async function AppleIcon() {
  const mark = await readFile(
    join(process.cwd(), "public/assets/logo-mark-dark.svg"),
    "utf8",
  );
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f5ea",
        }}
      >
        {/* 35:49 mark, sized to leave an even margin inside the 180 square. */}
        <img src={markSrc} width={74} height={104} alt="" />
      </div>
    ),
    size,
  );
}
