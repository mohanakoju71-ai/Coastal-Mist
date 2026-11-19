import type { FormEvent, RefObject } from 'react';
import {
  AlertCircle,
  Clock,
  LocateFixed,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import type {
  CityWeather,
  SearchHistoryEntry,
  TemperatureUnit,
} from '../data/sampleWeather';
import { formatTempCompact } from '../data/sampleWeather';

export type SearchErrorType =
  | 'empty'
  | 'invalid-city'
  | 'geolocation'
  | 'api-down';

export interface AppErrorState {
  type: SearchErrorType;
  message: string;
  canRetry?: boolean;
  canFallbackToSample?: boolean;
}

interface SearchBarProps {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  isLoading: boolean;
  unit: TemperatureUnit;
  cities: CityWeather[];
  activeCityId: string;
  activeCityName: string;
  onSelectCity: (cityId: string) => void;
  history: SearchHistoryEntry[];
  onSelectHistoryItem: (entry: SearchHistoryEntry) => void;
  onRemoveHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  errorState: AppErrorState | null;
  onRetryError: () => void;
  onFallbackToSample: () => void;
  onDismissError: () => void;
}

export function SearchBar({
  inputRef,
  query,
  onQueryChange,
  onSearchSubmit,
  onLocateMe,
  isLocating,
  isLoading,
  unit,
  cities,
  activeCityId,
  activeCityName,
  onSelectCity,
  history,
  onSelectHistoryItem,
  onRemoveHistoryItem,
  onClearHistory,
  errorState,
  onRetryError,
  onFallbackToSample,
  onDismissError,
}: SearchBarProps) {
  return (
    <section className="search-section" aria-label="City weather search">
      <form
        className="search-form"
        onSubmit={onSearchSubmit}
        role="search"
        noValidate
      >
        <label htmlFor="city-search" className="search-label">
          Search for any city or detect your current location
        </label>

        <div className="search-controls">
          <div className="search-input-wrap">
            <Search
              size={18}
              className="search-input-icon"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id="city-search"
              name="city"
              type="search"
              className={
                errorState?.type === 'empty' ||
                errorState?.type === 'invalid-city'
                  ? 'search-input search-input--error'
                  : 'search-input'
              }
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search any city (e.g. Vijayawada, Paris, New York)..."
              autoComplete="off"
              aria-invalid={
                errorState?.type === 'empty' ||
                errorState?.type === 'invalid-city'
              }
            />
          </div>

          <button
            type="submit"
            className="search-button"
            disabled={isLoading && !isLocating}
          >
            Search
          </button>

          <button
            type="button"
            className="locate-button"
            onClick={onLocateMe}
            disabled={isLocating}
            aria-label="Use my current location"
          >
            <LocateFixed size={17} aria-hidden="true" />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div className="history-bar" aria-label="Recent searches">
          <span className="history-label">
            <Clock size={14} aria-hidden="true" />
            <span>Recent:</span>
          </span>

          <div className="history-list">
            {history.map((entry) => {
              const isCurrent =
                entry.city.toLowerCase() === activeCityName.toLowerCase();
              return (
                <div key={entry.id} className="history-entry">
                  <button
                    type="button"
                    onClick={() => onSelectHistoryItem(entry)}
                    className={
                      isCurrent
                        ? 'history-item-btn history-item-btn--active'
                        : 'history-item-btn'
                    }
                    aria-pressed={isCurrent}
                  >
                    <span>{entry.city}</span>
                    <span aria-hidden="true">{entry.emoji}</span>
                    <span className="history-item-temp">
                      {formatTempCompact(entry.tempC, unit)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="history-remove-btn"
                    onClick={() => onRemoveHistoryItem(entry.id)}
                    aria-label={`Remove ${entry.city} from search history`}
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="history-clear-btn"
            onClick={onClearHistory}
          >
            Clear
          </button>
        </div>
      )}

      <div className="quick-cities" aria-label="Featured cities">
        <span className="quick-cities-label">Featured:</span>
        {cities.map((entry) => {
          const isActive =
            entry.id === activeCityId ||
            entry.city.toLowerCase() === activeCityName.toLowerCase();
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelectCity(entry.id)}
              className={
                isActive
                  ? 'quick-city-link quick-city-link--active'
                  : 'quick-city-link'
              }
              aria-pressed={isActive}
            >
              {entry.city}
            </button>
          );
        })}
      </div>

      {errorState && (
        <div
          className={
            errorState.type === 'api-down'
              ? 'search-feedback search-feedback--error'
              : 'search-feedback'
          }
          role="alert"
          aria-live="polite"
        >
          <div className="search-feedback-copy">
            <AlertCircle
              size={18}
              className="search-feedback-icon"
              aria-hidden="true"
            />
            <span>{errorState.message}</span>
          </div>

          <div className="search-feedback-actions">
            {errorState.canRetry && (
              <button
                type="button"
                className="search-feedback-action"
                onClick={onRetryError}
              >
                <RefreshCw size={14} aria-hidden="true" />
                <span>Retry</span>
              </button>
            )}

            {errorState.canFallbackToSample && (
              <button
                type="button"
                className="search-feedback-dismiss"
                onClick={onFallbackToSample}
              >
                Load sample data
              </button>
            )}

            <button
              type="button"
              className="search-feedback-dismiss"
              onClick={onDismissError}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
