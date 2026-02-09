import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { AlertStatus, AttackType, Severity } from "@/types/forensic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as AlertStatus | null;
  const severity = searchParams.get("severity") as Severity | null;
  const type = searchParams.get("type") as AttackType | null;

  const alerts = store.getAlerts({
    status: status || undefined,
    severity: severity || undefined,
    type: type || undefined,
  });

  return NextResponse.json({ alerts });
}
