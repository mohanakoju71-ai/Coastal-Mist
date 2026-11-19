import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';

function getMapsApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    ''
  ).trim();
}

interface QuotaErrorPayload {
  isQuota: boolean;
  status: number;
  message: string;
}

async function parseGoogleError(response: globalThis.Response): Promise<QuotaErrorPayload> {
  let message = `Upstream error (${response.status})`;
  let isQuota = response.status === 429;

  try {
    const body = (await response.json()) as {
      error?: { status?: string; message?: string };
    };
    if (body?.error?.status === 'RESOURCE_EXHAUSTED') {
      isQuota = true;
    }
    if (body?.error?.message) {
      message = body.error.message;
    }
  } catch {
    // Ignore JSON parse error on non-JSON upstream bodies
  }

  return { isQuota, status: response.status, message };
}

function mapWeatherTypeToEmoji(
  type: string | undefined,
  isDaytime = true
): { emoji: string; emojiLabel: string } {
  const normalized = (type || '').toUpperCase();

  if (
    normalized.includes('THUNDER') ||
    normalized.includes('STORM') ||
    normalized.includes('HAIL')
  ) {
    return { emoji: '⛈️', emojiLabel: 'Thunderstorm' };
  }

  if (
    normalized.includes('SNOW') ||
    normalized.includes('BLIZZARD') ||
    normalized.includes('SLEET') ||
    normalized.includes('ICE')
  ) {
    return { emoji: '❄️', emojiLabel: 'Snow' };
  }

  if (
    normalized.includes('RAIN') ||
    normalized.includes('SHOWER') ||
    normalized.includes('DRIZZLE')
  ) {
    return { emoji: '🌧️', emojiLabel: 'Rain showers' };
  }

  if (normalized.includes('WIND')) {
    return { emoji: '🌬️', emojiLabel: 'Windy' };
  }

  if (
    normalized === 'CLOUDY' ||
    normalized === 'OVERCAST' ||
    normalized.includes('FOG') ||
    normalized.includes('MIST') ||
    normalized.includes('HAZE')
  ) {
    return { emoji: '☁️', emojiLabel: 'Cloudy' };
  }

  if (
    normalized.includes('MOSTLY_CLOUDY') ||
    normalized.includes('PARTLY_CLOUDY')
  ) {
    return isDaytime
      ? { emoji: '⛅', emojiLabel: 'Partly cloudy' }
      : { emoji: '☁️', emojiLabel: 'Partly cloudy night' };
  }

  if (normalized.includes('MOSTLY_CLEAR') || normalized.includes('MOSTLY_SUNNY')) {
    return isDaytime
      ? { emoji: '🌤️', emojiLabel: 'Mostly sunny' }
      : { emoji: '🌙', emojiLabel: 'Mostly clear night' };
  }

  if (normalized === 'CLEAR' || normalized === 'SUNNY') {
    return isDaytime
      ? { emoji: '☀️', emojiLabel: 'Clear and sunny' }
      : { emoji: '🌙', emojiLabel: 'Clear night' };
  }

  return isDaytime
    ? { emoji: '⛅', emojiLabel: 'Partly cloudy' }
    : { emoji: '🌙', emojiLabel: 'Night sky' };
}

function formatClockInTimeZone(isoString: string | undefined, timeZone: string): string {
  if (!isoString) {
    return '—';
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
}

function formatHourLabel(hour24: number): string {
  const normalized = ((hour24 % 24) + 24) % 24;
  if (normalized === 0) return '12 AM';
  if (normalized === 12) return '12 PM';
  if (normalized < 12) return `${normalized} AM`;
  return `${normalized - 12} PM`;
}

interface GeocodeComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface GeocodeResult {
  placeId?: string;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  postalAddress?: {
    locality?: string;
    administrativeArea?: string;
    regionCode?: string;
  };
  addressComponents?: GeocodeComponent[];
}

function extractLocationLabels(
  result: GeocodeResult | undefined,
  fallbackCity: string
): { city: string; region: string; country: string; placeId?: string } {
  const components = result?.addressComponents || [];
  const findComponent = (type: string) =>
    components.find((c) => c.types?.includes(type))?.longText;

  const city =
    result?.postalAddress?.locality ||
    findComponent('locality') ||
    findComponent('sublocality') ||
    findComponent('administrative_area_level_2') ||
    findComponent('administrative_area_level_1') ||
    fallbackCity;

  const region =
    findComponent('administrative_area_level_1') ||
    result?.postalAddress?.administrativeArea ||
    findComponent('administrative_area_level_2') ||
    '';

  const country =
    findComponent('country') ||
    result?.postalAddress?.regionCode ||
    '';

  return {
    city,
    region: region && region !== city ? region : country,
    country: region && region !== city ? country : '',
    placeId: result?.placeId,
  };
}

async function fetchGeocodeForward(query: string, apiKey: string) {
  const encodedAddress = encodeURIComponent(query);
  const url = `https://geocode.googleapis.com/v4/geocode/address/${encodedAddress}?languageCode=en`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'results.placeId,results.location,results.formattedAddress,results.addressComponents,results.postalAddress',
      'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
    },
  });

  if (!response.ok) {
    throw await parseGoogleError(response);
  }

  const data = (await response.json()) as { results?: GeocodeResult[] };
  return data.results?.[0];
}

async function fetchGeocodeReverse(lat: number, lng: number, apiKey: string) {
  const url = new URL('https://geocode.googleapis.com/v4/geocode/location');
  url.searchParams.append('location.latitude', String(lat));
  url.searchParams.append('location.longitude', String(lng));
  url.searchParams.append('languageCode', 'en');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'results.placeId,results.formattedAddress,results.addressComponents,results.postalAddress',
      'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
    },
  });

  if (!response.ok) {
    throw await parseGoogleError(response);
  }

  const data = (await response.json()) as { results?: GeocodeResult[] };
  return data.results?.[0];
}

async function fetchWeatherJson(url: URL) {
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
    },
  });

  if (!response.ok) {
    throw await parseGoogleError(response);
  }

  return response.json();
}

async function fetchFullWeatherForCoords(
  lat: number,
  lng: number,
  labels: { city: string; region: string; country: string; placeId?: string },
  apiKey: string
) {
  const currentUrl = new URL(
    'https://weather.googleapis.com/v1/currentConditions:lookup'
  );
  currentUrl.searchParams.append('key', apiKey);
  currentUrl.searchParams.append('location.latitude', String(lat));
  currentUrl.searchParams.append('location.longitude', String(lng));
  currentUrl.searchParams.append('unitsSystem', 'METRIC');

  const hoursUrl = new URL(
    'https://weather.googleapis.com/v1/forecast/hours:lookup'
  );
  hoursUrl.searchParams.append('key', apiKey);
  hoursUrl.searchParams.append('location.latitude', String(lat));
  hoursUrl.searchParams.append('location.longitude', String(lng));
  hoursUrl.searchParams.append('hours', '24');
  hoursUrl.searchParams.append('pageSize', '24');
  hoursUrl.searchParams.append('unitsSystem', 'METRIC');

  const daysUrl = new URL(
    'https://weather.googleapis.com/v1/forecast/days:lookup'
  );
  daysUrl.searchParams.append('key', apiKey);
  daysUrl.searchParams.append('location.latitude', String(lat));
  daysUrl.searchParams.append('location.longitude', String(lng));
  daysUrl.searchParams.append('days', '7');
  daysUrl.searchParams.append('pageSize', '7');
  daysUrl.searchParams.append('unitsSystem', 'METRIC');

  const alertsUrl = new URL(
    'https://weather.googleapis.com/v1/publicAlerts:lookup'
  );
  alertsUrl.searchParams.append('key', apiKey);
  alertsUrl.searchParams.append('location.latitude', String(lat));
  alertsUrl.searchParams.append('location.longitude', String(lng));
  alertsUrl.searchParams.append('languageCode', 'en');

  const [currentData, hoursData, daysFirstPage, alertsData] = await Promise.all([
    fetchWeatherJson(currentUrl) as Promise<Record<string, any>>,
    fetchWeatherJson(hoursUrl) as Promise<Record<string, any>>,
    fetchWeatherJson(daysUrl) as Promise<Record<string, any>>,
    fetchWeatherJson(alertsUrl).catch((err) => {
      if (err && typeof err === 'object' && 'isQuota' in err && err.isQuota) {
        throw err;
      }
      return { weatherAlerts: [] };
    }) as Promise<Record<string, any>>,
  ]);

  const rawForecastDays: Array<Record<string, any>> = Array.isArray(
    daysFirstPage?.forecastDays
  )
    ? [...daysFirstPage.forecastDays]
    : [];

  if (rawForecastDays.length < 7 && daysFirstPage?.nextPageToken) {
    const nextDaysUrl = new URL(daysUrl.toString());
    nextDaysUrl.searchParams.append('pageToken', daysFirstPage.nextPageToken);
    try {
      const nextPage = (await fetchWeatherJson(nextDaysUrl)) as Record<string, any>;
      if (Array.isArray(nextPage?.forecastDays)) {
        rawForecastDays.push(...nextPage.forecastDays);
      }
    } catch {
      // Keep the first page of days if second page token fails
    }
  }

  const timeZoneId: string =
    currentData?.timeZone?.id ||
    daysFirstPage?.timeZone?.id ||
    hoursData?.timeZone?.id ||
    'UTC';

  const firstDay = rawForecastDays[0];
  const sunrise = formatClockInTimeZone(
    firstDay?.sunEvents?.sunriseTime,
    timeZoneId
  );
  const sunset = formatClockInTimeZone(
    firstDay?.sunEvents?.sunsetTime,
    timeZoneId
  );

  const currentTempC = Math.round(
    currentData?.temperature?.degrees ??
      firstDay?.maxTemperature?.degrees ??
      22
  );
  const currentFeelsLikeC = Math.round(
    currentData?.feelsLikeTemperature?.degrees ?? currentTempC
  );
  const currentWindKmh = Math.round(currentData?.wind?.speed?.value ?? 10);
  const currentHumidityPct = Math.round(currentData?.relativeHumidity ?? 55);
  const currentConditionText: string =
    currentData?.weatherCondition?.description?.text || 'Clear';
  const currentIsDaytime: boolean = currentData?.isDaytime ?? true;
  const currentIcon = mapWeatherTypeToEmoji(
    currentData?.weatherCondition?.type,
    currentIsDaytime
  );

  const citySlug = labels.city
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const forecast = rawForecastDays.slice(0, 7).map((dayItem, index) => {
    const displayDate = dayItem?.displayDate;
    const dateObj =
      displayDate?.year && displayDate?.month && displayDate?.day
        ? new Date(
            Date.UTC(displayDate.year, displayDate.month - 1, displayDate.day, 12)
          )
        : new Date(Date.now() + index * 86_400_000);

    const dayFull = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      timeZone: 'UTC',
    }).format(dateObj);
    const dayShort =
      index === 0
        ? 'Today'
        : new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            timeZone: 'UTC',
          }).format(dateObj);
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(dateObj);

    const daytime = dayItem?.daytimeForecast || {};
    const maxC = Math.round(dayItem?.maxTemperature?.degrees ?? currentTempC + 2);
    const minC = Math.round(dayItem?.minTemperature?.degrees ?? currentTempC - 4);
    const feelsC = Math.round(
      dayItem?.feelsLikeMaxTemperature?.degrees ??
        (index === 0 ? currentFeelsLikeC : maxC)
    );
    const windKmh = Math.round(
      index === 0 ? currentWindKmh : daytime?.wind?.speed?.value ?? 12
    );
    const humidityPct = Math.round(
      index === 0 ? currentHumidityPct : daytime?.relativeHumidity ?? 60
    );
    const conditionText: string =
      index === 0
        ? currentConditionText
        : daytime?.weatherCondition?.description?.text || 'Partly Cloudy';
    const icon =
      index === 0
        ? currentIcon
        : mapWeatherTypeToEmoji(daytime?.weatherCondition?.type, true);

    const precipPct = daytime?.precipitation?.probability?.percent ?? 0;
    const summary =
      index === 0
        ? `${currentConditionText} right now in ${labels.city} with ${currentHumidityPct}% humidity and winds at ${currentWindKmh} km/h.`
        : precipPct >= 30
          ? `${conditionText} expected with a ${precipPct}% chance of precipitation and highs near ${maxC}°C.`
          : `${conditionText} expected through the day with winds around ${windKmh} km/h and mild evening air.`;

    return {
      id: `${citySlug || 'loc'}-day-${index}`,
      dayShort,
      dayFull,
      dateLabel,
      emoji: icon.emoji,
      emojiLabel: icon.emojiLabel,
      condition: conditionText,
      summary,
      tempC: index === 0 ? currentTempC : Math.round((maxC + minC) / 2 + 1),
      tempMaxC: maxC,
      tempMinC: minC,
      feelsLikeC: feelsC,
      windKmh,
      humidityPct,
    };
  });

  const rawHours: Array<Record<string, any>> = Array.isArray(
    hoursData?.forecastHours
  )
    ? hoursData.forecastHours
    : [];

  const hourly = rawHours.slice(0, 24).map((hourItem, index) => {
    const hour24 = Number(hourItem?.displayDateTime?.hours ?? index % 24);
    const isDaytime = hourItem?.isDaytime ?? (hour24 >= 6 && hour24 < 19);
    const icon = mapWeatherTypeToEmoji(
      hourItem?.weatherCondition?.type,
      isDaytime
    );

    return {
      id: `${citySlug || 'loc'}-hr-${index}-${hour24}`,
      hour24,
      timeLabel: index === 0 ? 'Now' : formatHourLabel(hour24),
      isCurrentHour: index === 0,
      emoji: icon.emoji,
      emojiLabel: icon.emojiLabel,
      tempC: Math.round(hourItem?.temperature?.degrees ?? currentTempC),
    };
  });

  const rawAlerts: Array<Record<string, any>> = Array.isArray(
    alertsData?.weatherAlerts
  )
    ? alertsData.weatherAlerts
    : [];

  let alert = undefined;
  const firstAlert = rawAlerts[0];
  if (firstAlert) {
    const rawSeverity = String(firstAlert.severity || '').toUpperCase();
    const severity =
      rawSeverity === 'EXTREME' || rawSeverity === 'SEVERE'
        ? 'Warning'
        : rawSeverity === 'MODERATE'
          ? 'Watch'
          : 'Advisory';

    const guidanceList: string[] = [];
    if (Array.isArray(firstAlert.instruction)) {
      for (const item of firstAlert.instruction) {
        if (typeof item === 'string' && item.trim()) {
          guidanceList.push(item.trim());
        }
      }
    }
    if (Array.isArray(firstAlert.safetyRecommendations)) {
      for (const rec of firstAlert.safetyRecommendations) {
        const line = [rec?.directive, rec?.subtext].filter(Boolean).join(' ');
        if (line.trim()) {
          guidanceList.push(line.trim());
        }
      }
    }
    if (guidanceList.length === 0) {
      guidanceList.push(
        'Follow updates from your local weather authority and plan outdoor travel cautiously.'
      );
    }

    const effectiveUntil = firstAlert.expirationTime
      ? formatClockInTimeZone(firstAlert.expirationTime, timeZoneId)
      : 'Further notice';

    alert = {
      id: String(firstAlert.alertId || `${citySlug}-live-alert`),
      severity,
      title: String(firstAlert.alertTitle?.text || 'Active Weather Alert'),
      issuedBy: String(
        firstAlert.dataSource?.name ||
          firstAlert.dataSource?.publisher ||
          'Regional Weather Authority'
      ),
      authorityUri:
        typeof firstAlert.dataSource?.authorityUri === 'string'
          ? firstAlert.dataSource.authorityUri
          : undefined,
      effectiveUntil,
      summary: String(
        firstAlert.description ||
          `Active ${severity.toLowerCase()} issued for ${firstAlert.areaName || labels.city}.`
      ).slice(0, 280),
      guidance: guidanceList.slice(0, 4),
    };
  }

  return {
    id: labels.placeId || `live-${lat.toFixed(3)}-${lng.toFixed(3)}`,
    city: labels.city,
    region: labels.region,
    country: labels.country,
    coordinates: { lat, lng },
    sunrise,
    sunset,
    source: 'live',
    alert,
    forecast,
    hourly,
  };
}

const app = express();
app.use(express.json());

app.get('/api/maps-config', (_req: Request, res: Response) => {
  const apiKey = getMapsApiKey();
  res.json({
    apiKey,
    configured: Boolean(apiKey),
  });
});

app.get('/api/weather/by-city', async (req: Request, res: Response) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    res.status(400).json({
      code: 'EMPTY_QUERY',
      message: 'Please enter a city name to search.',
    });
    return;
  }

  const apiKey = getMapsApiKey();
  if (!apiKey) {
    res.status(503).json({
      code: 'API_KEY_MISSING',
      message: 'Live weather service is not configured yet.',
    });
    return;
  }

  try {
    const geocodeMatch = await fetchGeocodeForward(query, apiKey);
    const lat = geocodeMatch?.location?.latitude;
    const lng = geocodeMatch?.location?.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(404).json({
        code: 'CITY_NOT_FOUND',
        message: `We couldn't find a city matching "${query}". Check the spelling or try a nearby city.`,
      });
      return;
    }

    const labels = extractLocationLabels(geocodeMatch, query);
    const weatherPayload = await fetchFullWeatherForCoords(
      lat,
      lng,
      labels,
      apiKey
    );

    res.json(weatherPayload);
  } catch (err: unknown) {
    const quotaErr = err as Partial<QuotaErrorPayload>;
    if (quotaErr?.isQuota) {
      res.status(429).json({
        code: 'QUOTA_EXCEEDED',
        message: 'Google Maps Platform quota reached.',
      });
      return;
    }

    res.status(503).json({
      code: 'UPSTREAM_ERROR',
      message:
        'Live weather data is temporarily unavailable. Please try again in a moment.',
    });
  }
});

app.get('/api/weather/by-coords', async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const fallbackCity = String(req.query.city || '').trim() || 'Current Location';

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    res.status(400).json({
      code: 'INVALID_COORDS',
      message: 'Valid latitude and longitude coordinates are required.',
    });
    return;
  }

  const apiKey = getMapsApiKey();
  if (!apiKey) {
    res.status(503).json({
      code: 'API_KEY_MISSING',
      message: 'Live weather service is not configured yet.',
    });
    return;
  }

  try {
    let labels: { city: string; region: string; country: string; placeId?: string } =
      {
        city: fallbackCity,
        region: `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
        country: '',
      };

    try {
      const reverseMatch = await fetchGeocodeReverse(lat, lng, apiKey);
      if (reverseMatch) {
        labels = extractLocationLabels(reverseMatch, fallbackCity);
      }
    } catch (geoErr: unknown) {
      const quotaErr = geoErr as Partial<QuotaErrorPayload>;
      if (quotaErr?.isQuota) {
        throw geoErr;
      }
      // Continue with coordinate fallback label if reverse geocoding returns no street match
    }

    const weatherPayload = await fetchFullWeatherForCoords(
      lat,
      lng,
      labels,
      apiKey
    );

    res.json(weatherPayload);
  } catch (err: unknown) {
    const quotaErr = err as Partial<QuotaErrorPayload>;
    if (quotaErr?.isQuota) {
      res.status(429).json({
        code: 'QUOTA_EXCEEDED',
        message: 'Google Maps Platform quota reached.',
      });
      return;
    }

    res.status(503).json({
      code: 'UPSTREAM_ERROR',
      message:
        'Unable to reach the live weather service for these coordinates right now.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
