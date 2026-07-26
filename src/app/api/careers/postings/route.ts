import { NextResponse } from "next/server";
import { getJobPostings } from "@/lib/revolut-people";

export const dynamic = "force-dynamic";

export async function GET() {
  const postings = await getJobPostings();

  if (postings === null) {
    return NextResponse.json(
      { error: "postings_unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  return NextResponse.json(postings, {
    headers: {
      "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
      "access-control-allow-origin": "*",
    },
  });
}
