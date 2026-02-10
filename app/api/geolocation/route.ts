import { NextResponse } from "next/server";
import { geolocateIP } from "@/lib/geolocation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json(
      { error: "Se requiere parámetro IP" },
      { status: 400 }
    );
  }

  try {
    const location = await geolocateIP(ip);

    if (!location) {
      return NextResponse.json(
        { error: "No se pudo geolocalizar la IP" },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error("Error en geolocalización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
