import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  HourlyForecastPoint,
  TemperatureUnit,
} from '../data/sampleWeather';
import { formatTempCompact } from '../data/sampleWeather';

interface HourlyForecastRowProps {
  hourly: HourlyForecastPoint[];
  dayLabel: string;
  unit: TemperatureUnit;
}

const SCROLL_STEP_PX = 340;

export function HourlyForecastRow({
  hourly,
  dayLabel,
  unit,
}: HourlyForecastRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  function handleScrollBy(deltaX: number) {
    rowRef.current?.scrollBy({
      left: deltaX,
      behavior: 'smooth',
    });
  }

  return (
    <section
      className="hourly-section weather-reveal"
      aria-labelledby="hourly-heading"
    >
      <div className="hourly-header">
        <div className="hourly-heading-group">
          <h2 id="hourly-heading" className="hourly-heading">
            Hourly Forecast
          </h2>
          <p className="hourly-meta">
            <span>{dayLabel}</span>
            <span aria-hidden="true">·</span>
            <span>24-hour outlook at 1-hour intervals</span>
          </p>
        </div>

        <div className="hourly-scroll-controls">
          <button
            type="button"
            className="hourly-scroll-btn"
            onClick={() => handleScrollBy(-SCROLL_STEP_PX)}
            aria-label="Scroll earlier hours"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="hourly-scroll-btn"
            onClick={() => handleScrollBy(SCROLL_STEP_PX)}
            aria-label="Scroll later hours"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="hourly-row"
        role="region"
        aria-label="24-hour temperature strip"
        tabIndex={0}
      >
        {hourly.map((point) => (
          <article
            key={point.id}
            className={
              point.isCurrentHour
                ? 'hourly-card hourly-card--now'
                : 'hourly-card'
            }
          >
            <span className="hourly-time">{point.timeLabel}</span>
            <span
              className="hourly-icon"
              role="img"
              aria-label={point.emojiLabel}
            >
              {point.emoji}
            </span>
            <span className="hourly-temp">
              {formatTempCompact(point.tempC, unit)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
