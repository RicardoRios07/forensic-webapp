// Servicio de geolocalización de IPs
// Usa ip-api.com (gratuito, 45 req/min sin API key)

export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lon: number;
  isp?: string;
  org?: string;
  as?: string;
}

// Cache para evitar consultas repetidas
const geoCache = new Map<string, GeoLocation>();

// Coordenadas por defecto del servidor (Ecuador - Quito)
const SERVER_LOCATION: GeoLocation = {
  ip: "server",
  country: "Ecuador",
  countryCode: "EC",
  city: "Quito",
  lat: -0.1807,
  lon: -78.4678,
  isp: "Local Server",
};

export async function geolocateIP(ip: string): Promise<GeoLocation | null> {
  // IPs locales o privadas -> devolver servidor local
  if (
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.") ||
    ip === "127.0.0.1" ||
    ip === "localhost"
  ) {
    return SERVER_LOCATION;
  }

  // Consultar cache primero
  if (geoCache.has(ip)) {
    return geoCache.get(ip)!;
  }

  try {
    // Usar ip-api.com (gratuito)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,lat,lon,isp,org,as`
    );

    if (!response.ok) {
      console.error(`Geolocalización falló para ${ip}:`, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === "fail") {
      console.error(`Geolocalización falló para ${ip}:`, data.message);
      return null;
    }

    const location: GeoLocation = {
      ip,
      country: data.country || "Unknown",
      countryCode: data.countryCode || "XX",
      city: data.city || "Unknown",
      lat: data.lat || 0,
      lon: data.lon || 0,
      isp: data.isp,
      org: data.org,
      as: data.as,
    };

    // Guardar en cache
    geoCache.set(ip, location);

    return location;
  } catch (error) {
    console.error(`Error geolocalizando ${ip}:`, error);
    return null;
  }
}

export function getServerLocation(): GeoLocation {
  return SERVER_LOCATION;
}

// Limpiar cache viejo (llamar periódicamente)
export function clearGeoCache(): void {
  geoCache.clear();
}
