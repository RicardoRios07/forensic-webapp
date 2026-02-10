import { NextResponse } from "next/server";
import { store } from "@/lib/store";

// GET: fetch historical logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 10000;

  const logs = store.getLogs(limit);
  return NextResponse.json({ logs, total: store.logs.length });
}
