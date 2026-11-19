import type {
  CityWeather,
  DailyForecast,
  TemperatureUnit,
} from '../data/sampleWeather';
import { formatTemp, formatWind } from '../data/sampleWeather';

interface CurrentWeatherCardProps {
  cityData: CityWeather;
  activeDay: DailyForecast;
  isToday: boolean;
  unit: TemperatureUnit;
  onResetToToday: () => void;
}

export function CurrentWeatherCard({
  cityData,
  activeDay,
  isToday,
  unit,
  onResetToToday,
}: CurrentWeatherCardProps) {
  const locationLabel = [cityData.region, cityData.country]
    .filter(Boolean)
    .join(', ');

  return (
    <section
      className="current-weather weather-reveal"
      aria-labelledby="current-city-heading"
    >
      <div className="current-weather-header">
        <div className="current-location-group">
          <h1 id="current-city-heading" className="city-name">
            {cityData.city}
          </h1>
          <p className="current-meta">
            {locationLabel && (
              <>
                <span>{locationLabel}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>
              {activeDay.dayFull}, {activeDay.dateLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {isToday
                ? cityData.source === 'live'
                  ? 'Live Conditions'
                  : 'Current Conditions'
                : 'Forecast Preview'}
            </span>
          </p>
        </div>

        {!isToday && (
          <button
            type="button"
            className="back-to-today-btn"
            onClick={onResetToToday}
          >
            Back to Today
          </button>
        )}
      </div>

      <div className="current-hero">
        <div className="current-primary-reading">
          <span className="weather-icon-stage">
            <span
              className="weather-icon"
              role="img"
              aria-label={activeDay.emojiLabel}
            >
              {activeDay.emoji}
            </span>
          </span>

          <div className="current-temp-stack">
            <span className="current-temp">
              {formatTemp(activeDay.tempC, unit)}
            </span>
            <p className="weather-condition">{activeDay.condition}</p>
          </div>
        </div>

        <p className="current-summary-note">{activeDay.summary}</p>
      </div>

      <hr className="current-divider" />

      <div className="current-metrics" aria-label="Weather details">
        <div className="metric-item">
          <span className="metric-label">Wind Speed</span>
          <span className="metric-value wind-speed">
            {formatWind(activeDay.windKmh, unit)}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Humidity</span>
          <span className="metric-value humidity">
            {activeDay.humidityPct}%
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Feels Like</span>
          <span className="metric-value feels-like">
            {formatTemp(activeDay.feelsLikeC, unit)}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">High / Low</span>
          <span className="metric-value temp-range">
            {formatTemp(activeDay.tempMaxC, unit)} /{' '}
            {formatTemp(activeDay.tempMinC, unit)}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Sunrise</span>
          <span className="metric-value sunrise-time">{cityData.sunrise}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Sunset</span>
          <span className="metric-value sunset-time">{cityData.sunset}</span>
        </div>
      </div>
    </section>
  );
}
