interface WeatherSkeletonProps {
  cityName?: string;
}

const FORECAST_SKELETON_SLOTS = [0, 1, 2, 3, 4, 5, 6];
const HOURLY_SKELETON_SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const METRIC_SKELETON_SLOTS = [0, 1, 2, 3, 4, 5];

export function WeatherSkeleton({ cityName }: WeatherSkeletonProps) {
  return (
    <div
      className="weather-skeleton-stack"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">
        {cityName
          ? `Loading weather forecast for ${cityName}...`
          : 'Loading weather forecast...'}
      </span>

      <section className="current-weather" aria-hidden="true">
        <div className="current-weather-header">
          <div className="current-location-group">
            <span className="skeleton-block skeleton-city" />
            <span className="skeleton-block skeleton-meta" />
          </div>
        </div>

        <div className="current-hero">
          <div className="current-primary-reading">
            <span className="skeleton-block skeleton-circle skeleton-icon-hero" />

            <div className="current-temp-stack">
              <span className="skeleton-block skeleton-temp-hero" />
              <span className="skeleton-block skeleton-condition" />
            </div>
          </div>

          <div className="skeleton-summary">
            <span className="skeleton-block skeleton-summary-line" />
            <span className="skeleton-block skeleton-summary-line skeleton-summary-line--short" />
          </div>
        </div>

        <hr className="current-divider" />

        <div className="current-metrics">
          {METRIC_SKELETON_SLOTS.map((slot) => (
            <div key={slot} className="metric-item">
              <span className="skeleton-block skeleton-metric-label" />
              <span className="skeleton-block skeleton-metric-value" />
            </div>
          ))}
        </div>
      </section>

      <section className="hourly-section" aria-hidden="true">
        <div className="hourly-header">
          <div className="hourly-heading-group">
            <span className="skeleton-block skeleton-heading" />
            <span className="skeleton-block skeleton-hint" />
          </div>
        </div>

        <div className="hourly-row">
          {HOURLY_SKELETON_SLOTS.map((slot) => (
            <div key={slot} className="hourly-card hourly-card--skeleton">
              <span className="skeleton-block skeleton-hourly-time" />
              <span className="skeleton-block skeleton-circle skeleton-hourly-icon" />
              <span className="skeleton-block skeleton-hourly-temp" />
            </div>
          ))}
        </div>
      </section>

      <section className="forecast-section" aria-hidden="true">
        <div className="forecast-header">
          <span className="skeleton-block skeleton-heading" />
          <span className="skeleton-block skeleton-hint" />
        </div>

        <div className="forecast-row">
          {FORECAST_SKELETON_SLOTS.map((slot) => (
            <div key={slot} className="forecast-card forecast-card--skeleton">
              <span className="forecast-day-group">
                <span className="skeleton-block skeleton-day" />
                <span className="skeleton-block skeleton-date" />
              </span>

              <span className="skeleton-block skeleton-circle skeleton-icon-sm" />

              <span className="skeleton-block skeleton-temps" />
            </div>
          ))}
        </div>
      </section>

      <section className="map-section" aria-hidden="true">
        <div className="map-header">
          <div className="map-heading-group">
            <span className="skeleton-block skeleton-heading" />
            <span className="skeleton-block skeleton-hint" />
          </div>
        </div>
        <div className="weather-map-card">
          <span className="skeleton-block skeleton-map" />
        </div>
      </section>
    </div>
  );
}
