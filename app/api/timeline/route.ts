import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const type = searchParams.get("type");

  const timeline = store.getTimeline({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    type: type || undefined,
  });

  return NextResponse.json({ timeline });
}
