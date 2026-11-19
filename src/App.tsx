import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  DEFAULT_CITY_ID,
  SAMPLE_CITIES,
  findCityByQuery,
  getActiveWeatherAlert,
  getHourlyForecast,
  getWeatherMood,
  type CityWeather,
  type SearchHistoryEntry,
  type TemperatureUnit,
} from './data/sampleWeather';
import {
  WeatherApiError,
  fetchLiveWeatherByCity,
  fetchLiveWeatherByCoords,
  fetchMapsConfig,
} from './services/weatherApi';
import { WeatherAlertBanner } from './components/WeatherAlertBanner';
import { SearchBar, type AppErrorState } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyForecastRow } from './components/HourlyForecastRow';
import { ForecastRow } from './components/ForecastRow';
import { WeatherLocationMap } from './components/WeatherLocationMap';
import { WeatherSkeleton } from './components/WeatherSkeleton';

const SEARCH_HISTORY_KEY = 'coastal-mist-search-history-v1';
const MAX_HISTORY_ITEMS = 8;
const MIN_SKELETON_MS = 450;

function loadStoredHistory(): SearchHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (item): item is SearchHistoryEntry =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.city === 'string' &&
          typeof item.lat === 'number' &&
          typeof item.lng === 'number' &&
          typeof item.tempC === 'number'
      )
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function saveStoredHistory(items: SearchHistoryEntry[]): void {
  try {
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export default function App() {
  const defaultCity =
    SAMPLE_CITIES.find((entry) => entry.id === DEFAULT_CITY_ID) ??
    SAMPLE_CITIES[0];

  const [activeCity, setActiveCity] = useState<CityWeather>(defaultCity);
  const [pendingCityName, setPendingCityName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [unit, setUnit] = useState<TemperatureUnit>('C');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorState, setErrorState] = useState<AppErrorState | null>(null);
  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);
  const [mapsApiKey, setMapsApiKey] = useState<string>('');
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] =
    useState<SearchHistoryEntry[]>(loadStoredHistory);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const retryActionRef = useRef<(() => void) | null>(null);
  const fallbackCityRef = useRef<CityWeather | null>(null);

  // Listen for Tier 1 & Tier 2 Google Maps Platform quota exhaustion events
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  // Load client Maps API configuration and upgrade default city to live weather if available
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetchMapsConfig().then((config) => {
      if (active && config.apiKey) {
        setMapsApiKey(config.apiKey);
      }
    });

    fetchLiveWeatherByCoords(
      defaultCity.coordinates.lat,
      defaultCity.coordinates.lng,
      defaultCity.city,
      controller.signal
    )
      .then((liveWeather) => {
        if (active) {
          setActiveCity(liveWeather);
        }
      })
      .catch(() => {
        // Keep calm Vijayawada sample data silently on startup if offline or key unavailable
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [defaultCity.city, defaultCity.coordinates.lat, defaultCity.coordinates.lng]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const recordSearchHistory = useCallback((cityWeather: CityWeather) => {
    const today = cityWeather.forecast[0];
    if (!today) {
      return;
    }

    const nextEntry: SearchHistoryEntry = {
      id: `${cityWeather.city.toLowerCase()}-${cityWeather.coordinates.lat.toFixed(2)}-${cityWeather.coordinates.lng.toFixed(2)}`,
      city: cityWeather.city,
      region: cityWeather.region,
      country: cityWeather.country,
      lat: cityWeather.coordinates.lat,
      lng: cityWeather.coordinates.lng,
      emoji: today.emoji,
      tempC: today.tempC,
      checkedAt: Date.now(),
    };

    setSearchHistory((prev) => {
      const deduped = prev.filter(
        (item) =>
          item.city.toLowerCase() !== nextEntry.city.toLowerCase() &&
          item.id !== nextEntry.id
      );
      const updated = [nextEntry, ...deduped].slice(0, MAX_HISTORY_ITEMS);
      saveStoredHistory(updated);
      return updated;
    });
  }, []);

  const runLiveRequest = useCallback(
    async (
      label: string,
      fetcher: (signal: AbortSignal) => Promise<CityWeather>,
      options?: {
        addToHistory?: boolean;
        fallbackSample?: CityWeather | null;
        retryFn?: () => void;
        clearSearch?: boolean;
      }
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setErrorState(null);
      setDismissedAlertId(null);
      setPendingCityName(label);
      setIsLoading(true);
      retryActionRef.current = options?.retryFn ?? null;
      fallbackCityRef.current = options?.fallbackSample ?? null;

      const startedAt = Date.now();

      try {
        const result = await fetcher(controller.signal);
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_SKELETON_MS) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, MIN_SKELETON_MS - elapsed);
          });
        }
        if (controller.signal.aborted) {
          return;
        }

        setActiveCity(result);
        setSelectedDayIndex(0);
        setPendingCityName(null);
        setIsLoading(false);

        if (options?.clearSearch) {
          setSearchQuery('');
        } else {
          setSearchQuery(result.city);
        }

        if (options?.addToHistory) {
          recordSearchHistory(result);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setPendingCityName(null);
        setIsLoading(false);

        if (err instanceof WeatherApiError) {
          if (err.code === 'CITY_NOT_FOUND') {
            setErrorState({
              type: 'invalid-city',
              message: err.message,
              canRetry: false,
              canFallbackToSample: false,
            });
            return;
          }

          if (err.code === 'EMPTY_QUERY') {
            setErrorState({
              type: 'empty',
              message: err.message,
            });
            return;
          }

          // If a built-in sample matches and user clicked a featured city, keep sample fallback ready
          const hasFallback = Boolean(options?.fallbackSample);
          setErrorState({
            type: 'api-down',
            message:
              err.code === 'QUOTA_EXCEEDED'
                ? 'Live weather quota reached. You can still browse built-in sample cities below.'
                : err.message,
            canRetry: err.code !== 'QUOTA_EXCEEDED',
            canFallbackToSample: hasFallback,
          });
          return;
        }

        setErrorState({
          type: 'api-down',
          message:
            'Something went wrong while fetching live weather data. Please retry.',
          canRetry: true,
          canFallbackToSample: Boolean(options?.fallbackSample),
        });
      }
    },
    [recordSearchHistory]
  );

  const loadCityBySearch = useCallback(
    (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) {
        setErrorState({
          type: 'empty',
          message: 'Please enter a city name before searching.',
        });
        searchInputRef.current?.focus();
        return;
      }

      const sampleMatch = findCityByQuery(trimmed) ?? null;

      void runLiveRequest(
        trimmed,
        (signal) => fetchLiveWeatherByCity(trimmed, signal),
        {
          addToHistory: true,
          fallbackSample: sampleMatch,
          retryFn: () => loadCityBySearch(trimmed),
          clearSearch: false,
        }
      );
    },
    [runLiveRequest]
  );

  const loadCityByCoords = useCallback(
    (
      lat: number,
      lng: number,
      label = 'Selected Location',
      options?: { addToHistory?: boolean; fallbackSample?: CityWeather | null }
    ) => {
      void runLiveRequest(
        label,
        (signal) => fetchLiveWeatherByCoords(lat, lng, label, signal),
        {
          addToHistory: options?.addToHistory ?? true,
          fallbackSample: options?.fallbackSample ?? null,
          retryFn: () => loadCityByCoords(lat, lng, label, options),
          clearSearch: true,
        }
      );
    },
    [runLiveRequest]
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadCityBySearch(searchQuery);
  }

  function handleSelectFeaturedCity(cityId: string) {
    const sampleCity = SAMPLE_CITIES.find((entry) => entry.id === cityId);
    if (!sampleCity) {
      return;
    }

    loadCityByCoords(
      sampleCity.coordinates.lat,
      sampleCity.coordinates.lng,
      sampleCity.city,
      {
        addToHistory: true,
        fallbackSample: sampleCity,
      }
    );
  }

  function handleSelectHistoryItem(entry: SearchHistoryEntry) {
    const sampleMatch = findCityByQuery(entry.city) ?? null;
    loadCityByCoords(entry.lat, entry.lng, entry.city, {
      addToHistory: true,
      fallbackSample: sampleMatch,
    });
  }

  function handleRemoveHistoryItem(id: string) {
    setSearchHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveStoredHistory(next);
      return next;
    });
  }

  function handleClearHistory() {
    setSearchHistory([]);
    saveStoredHistory([]);
  }

  function handleLocateMe() {
    setErrorState(null);

    if (!('geolocation' in navigator)) {
      setErrorState({
        type: 'geolocation',
        message:
          'Automatic location detection is not supported by this browser. Try searching for a city instead.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        loadCityByCoords(latitude, longitude, 'Your Location', {
          addToHistory: true,
          fallbackSample: defaultCity,
        });
      },
      (geoError) => {
        setIsLocating(false);
        let message =
          'Could not determine your location. Please search for a city manually.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message =
            'Location permission was denied. Enable browser location access or enter your city above.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message =
            'Your device location is currently unavailable. Try searching for a city instead.';
        } else if (geoError.code === geoError.TIMEOUT) {
          message =
            'Location lookup timed out. Please try again or enter a city name.';
        }

        setErrorState({
          type: 'geolocation',
          message,
          canRetry: geoError.code !== geoError.PERMISSION_DENIED,
        });
        retryActionRef.current = handleLocateMe;
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  function handleFallbackToSample() {
    const sample = fallbackCityRef.current ?? defaultCity;
    setActiveCity(sample);
    setSelectedDayIndex(0);
    setDismissedAlertId(null);
    setErrorState(null);
    recordSearchHistory(sample);
  }

  const activeDay =
    activeCity.forecast[selectedDayIndex] ?? activeCity.forecast[0];
  const isToday = selectedDayIndex === 0;
  const hourlyForecast =
    isToday && activeCity.hourly && activeCity.hourly.length > 0
      ? activeCity.hourly
      : getHourlyForecast(activeCity, activeDay, isToday);

  const activeAlert = getActiveWeatherAlert(activeCity);
  const showAlertBanner =
    !isLoading &&
    activeAlert !== null &&
    dismissedAlertId !== activeAlert.id;

  const weatherMood = getWeatherMood(activeDay);

  return (
    <div className="weather-shell" data-weather-mood={weatherMood}>
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <header className="app-header">
        <div className="weather-container app-header-inner">
          <span className="brand-wordmark">Coastal Mist</span>

          <div
            className="unit-toggle"
            role="group"
            aria-label="Temperature unit"
          >
            <button
              type="button"
              onClick={() => setUnit('C')}
              aria-pressed={unit === 'C'}
              className={
                unit === 'C'
                  ? 'unit-toggle-btn unit-toggle-btn--active'
                  : 'unit-toggle-btn'
              }
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => setUnit('F')}
              aria-pressed={unit === 'F'}
              className={
                unit === 'F'
                  ? 'unit-toggle-btn unit-toggle-btn--active'
                  : 'unit-toggle-btn'
              }
            >
              °F
            </button>
          </div>
        </div>
      </header>

      <main className="weather-container weather-main">
        {showAlertBanner && activeAlert && (
          <WeatherAlertBanner
            key={activeAlert.id}
            alert={activeAlert}
            onDismiss={() => setDismissedAlertId(activeAlert.id)}
          />
        )}

        <SearchBar
          inputRef={searchInputRef}
          query={searchQuery}
          onQueryChange={(value) => {
            setSearchQuery(value);
            if (errorState?.type === 'empty' || errorState?.type === 'invalid-city') {
              setErrorState(null);
            }
          }}
          onSearchSubmit={handleSearchSubmit}
          onLocateMe={handleLocateMe}
          isLocating={isLocating}
          isLoading={isLoading}
          unit={unit}
          cities={SAMPLE_CITIES}
          activeCityId={activeCity.id}
          activeCityName={pendingCityName ?? activeCity.city}
          onSelectCity={handleSelectFeaturedCity}
          history={searchHistory}
          onSelectHistoryItem={handleSelectHistoryItem}
          onRemoveHistoryItem={handleRemoveHistoryItem}
          onClearHistory={handleClearHistory}
          errorState={errorState}
          onRetryError={() => retryActionRef.current?.()}
          onFallbackToSample={handleFallbackToSample}
          onDismissError={() => setErrorState(null)}
        />

        {isLoading ? (
          <WeatherSkeleton cityName={pendingCityName ?? undefined} />
        ) : (
          <>
            <CurrentWeatherCard
              cityData={activeCity}
              activeDay={activeDay}
              isToday={isToday}
              unit={unit}
              onResetToToday={() => setSelectedDayIndex(0)}
            />

            <HourlyForecastRow
              hourly={hourlyForecast}
              dayLabel={
                isToday
                  ? `Today, ${activeDay.dateLabel}`
                  : `${activeDay.dayFull}, ${activeDay.dateLabel}`
              }
              unit={unit}
            />

            <ForecastRow
              forecast={activeCity.forecast}
              selectedDayIndex={selectedDayIndex}
              unit={unit}
              onSelectDay={setSelectedDayIndex}
            />

            <WeatherLocationMap
              apiKey={mapsApiKey}
              city={activeCity.city}
              region={activeCity.region}
              country={activeCity.country}
              coordinates={activeCity.coordinates}
              onPickCoordinates={(lat, lng) =>
                loadCityByCoords(lat, lng, 'Pinned Location', {
                  addToHistory: true,
                  fallbackSample: activeCity,
                })
              }
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <div className="weather-container app-footer-inner">
          <span>
            Weather &amp; maps powered by Google Maps Platform ·{' '}
            <a
              href="https://cloud.google.com/maps-platform/terms?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="app-footer-link"
            >
              Terms of Service
            </a>
          </span>
          <span>Coastal Mist Weather</span>
        </div>
      </footer>
    </div>
  );
}
