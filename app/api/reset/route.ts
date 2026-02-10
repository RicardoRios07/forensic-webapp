import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { clearGeoCache } from "@/lib/geolocation";

/**
 * Reset all forensic data
 * Clears logs, alerts, timeline, and statistics
 */
export async function POST() {
  try {
    // Clear all stored data using the reset method
    store.reset();
    
    // Clear geolocation cache
    clearGeoCache();
    
    console.log("✅ All forensic data has been reset");
    
    return NextResponse.json({
      success: true,
      message: "Todos los datos forenses han sido eliminados",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resetting data:", error);
    return NextResponse.json(
      { error: "Error al resetear datos", details: String(error) },
      { status: 500 }
    );
  }
}
