import type { DailyForecast, TemperatureUnit } from '../data/sampleWeather';
import { formatTempCompact } from '../data/sampleWeather';

interface ForecastRowProps {
  forecast: DailyForecast[];
  selectedDayIndex: number;
  unit: TemperatureUnit;
  onSelectDay: (index: number) => void;
}

export function ForecastRow({
  forecast,
  selectedDayIndex,
  unit,
  onSelectDay,
}: ForecastRowProps) {
  return (
    <section
      className="forecast-section weather-reveal"
      aria-labelledby="forecast-heading"
    >
      <div className="forecast-header">
        <h2 id="forecast-heading" className="forecast-heading">
          7-Day Forecast
        </h2>
        <p className="forecast-hint">
          Select any day to inspect detailed conditions
        </p>
      </div>

      <div
        className="forecast-row"
        role="group"
        aria-label="7-day daily forecast"
      >
        {forecast.map((day, index) => {
          const isSelected = index === selectedDayIndex;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(index)}
              aria-pressed={isSelected}
              className={
                isSelected
                  ? 'forecast-card forecast-card--active'
                  : 'forecast-card'
              }
            >
              <span className="forecast-day-group">
                <span className="forecast-day">{day.dayShort}</span>
                <span className="forecast-date">{day.dateLabel}</span>
              </span>

              <span
                className="forecast-icon"
                role="img"
                aria-label={day.emojiLabel}
              >
                {day.emoji}
              </span>

              <span className="forecast-temps">
                <span
                  className="forecast-temp-max"
                  aria-label={`High ${formatTempCompact(day.tempMaxC, unit)}`}
                >
                  {formatTempCompact(day.tempMaxC, unit)}
                </span>
                <span
                  className="forecast-temp-min"
                  aria-label={`Low ${formatTempCompact(day.tempMinC, unit)}`}
                >
                  {formatTempCompact(day.tempMinC, unit)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
