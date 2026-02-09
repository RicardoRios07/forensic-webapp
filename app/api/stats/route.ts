import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const stats = store.getDashboardStats();
  return NextResponse.json({ stats });
}
