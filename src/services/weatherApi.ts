import type { CityWeather } from '../data/sampleWeather';

export type WeatherApiErrorCode =
  | 'EMPTY_QUERY'
  | 'CITY_NOT_FOUND'
  | 'QUOTA_EXCEEDED'
  | 'API_KEY_MISSING'
  | 'UPSTREAM_ERROR'
  | 'NETWORK_ERROR';

export class WeatherApiError extends Error {
  readonly code: WeatherApiErrorCode;

  constructor(code: WeatherApiErrorCode, message: string) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
  }
}

export interface MapsClientConfig {
  apiKey: string;
  configured: boolean;
}

export async function fetchMapsConfig(): Promise<MapsClientConfig> {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  if (envKey) {
    return { apiKey: envKey, configured: true };
  }

  try {
    const response = await fetch('/api/maps-config');
    if (!response.ok) {
      return { apiKey: '', configured: false };
    }
    const data = (await response.json()) as Partial<MapsClientConfig>;
    const key = typeof data.apiKey === 'string' ? data.apiKey.trim() : '';
    return { apiKey: key, configured: Boolean(key) };
  } catch {
    return { apiKey: '', configured: false };
  }
}

async function handleWeatherResponse(response: Response): Promise<CityWeather> {
  let payload: Record<string, unknown> | null = null;
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    payload = null;
  }

  if (
    response.status === 429 ||
    payload?.code === 'QUOTA_EXCEEDED' ||
    (payload?.error as { status?: string } | undefined)?.status ===
      'RESOURCE_EXHAUSTED'
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    throw new WeatherApiError(
      'QUOTA_EXCEEDED',
      'Google Maps Platform quota reached.'
    );
  }

  if (!response.ok) {
    const code =
      typeof payload?.code === 'string'
        ? (payload.code as WeatherApiErrorCode)
        : response.status === 404
          ? 'CITY_NOT_FOUND'
          : 'UPSTREAM_ERROR';
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Unable to load live weather data right now.';
    throw new WeatherApiError(code, message);
  }

  if (
    !payload ||
    typeof payload.city !== 'string' ||
    !Array.isArray(payload.forecast) ||
    payload.forecast.length === 0
  ) {
    throw new WeatherApiError(
      'UPSTREAM_ERROR',
      'Received an incomplete weather response. Please try again.'
    );
  }

  return payload as unknown as CityWeather;
}

export async function fetchLiveWeatherByCity(
  query: string,
  signal?: AbortSignal
): Promise<CityWeather> {
  try {
    const url = `/api/weather/by-city?q=${encodeURIComponent(query.trim())}`;
    const response = await fetch(url, { signal });
    return await handleWeatherResponse(response);
  } catch (err) {
    if (err instanceof WeatherApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new WeatherApiError(
      'NETWORK_ERROR',
      'Could not reach the weather server. Check your internet connection and retry.'
    );
  }
}

export async function fetchLiveWeatherByCoords(
  lat: number,
  lng: number,
  fallbackCity?: string,
  signal?: AbortSignal
): Promise<CityWeather> {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
    });
    if (fallbackCity) {
      params.set('city', fallbackCity);
    }
    const response = await fetch(`/api/weather/by-coords?${params.toString()}`, {
      signal,
    });
    return await handleWeatherResponse(response);
  } catch (err) {
    if (err instanceof WeatherApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new WeatherApiError(
      'NETWORK_ERROR',
      'Could not reach the weather server. Check your internet connection and retry.'
    );
  }
}
