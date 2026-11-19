import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { WeatherAlert } from '../data/sampleWeather';

interface WeatherAlertBannerProps {
  alert: WeatherAlert;
  onDismiss: () => void;
}

export function WeatherAlertBanner({
  alert,
  onDismiss,
}: WeatherAlertBannerProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const guidancePanelId = `weather-alert-guidance-${alert.id}`;

  return (
    <section
      className="weather-alert weather-reveal"
      role="region"
      aria-labelledby="weather-alert-title"
    >
      <div className="weather-alert-main">
        <div className="weather-alert-lead">
          <span className="weather-alert-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </span>

          <div className="weather-alert-copy">
            <p className="weather-alert-meta">
              <span className="weather-alert-severity">
                Weather {alert.severity}
              </span>
              <span aria-hidden="true">·</span>
              <span>Effective until {alert.effectiveUntil}</span>
              <span aria-hidden="true">·</span>
              <span>
                Source:{' '}
                {alert.authorityUri ? (
                  <a
                    href={alert.authorityUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="weather-alert-source-link"
                  >
                    {alert.issuedBy}
                  </a>
                ) : (
                  alert.issuedBy
                )}
              </span>
            </p>

            <h2 id="weather-alert-title" className="weather-alert-title">
              {alert.title}
            </h2>

            <p className="weather-alert-summary">{alert.summary}</p>
          </div>
        </div>

        <div className="weather-alert-actions">
          <button
            type="button"
            className="weather-alert-toggle"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={guidancePanelId}
          >
            <span>{isExpanded ? 'Hide guidance' : 'Show guidance'}</span>
            {isExpanded ? (
              <ChevronUp size={16} aria-hidden="true" />
            ) : (
              <ChevronDown size={16} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className="weather-alert-dismiss"
            onClick={onDismiss}
            aria-label={`Dismiss ${alert.title}`}
          >
            <X size={16} aria-hidden="true" />
            <span>Dismiss</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div id={guidancePanelId} className="weather-alert-guidance">
          <hr className="weather-alert-divider" />
          <p className="weather-alert-guidance-heading">Safety guidance</p>
          <ul className="weather-alert-list">
            {alert.guidance.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
