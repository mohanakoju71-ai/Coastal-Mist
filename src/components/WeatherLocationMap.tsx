import { useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  ControlPosition,
  Map as GoogleMap,
  MapControl,
  Pin,
  useMap,
  type MapCameraChangedEvent,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { MapPin, Minus, Plus } from 'lucide-react';

interface WeatherLocationMapProps {
  apiKey: string;
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  onPickCoordinates: (lat: number, lng: number) => void;
}

const GMP_ATTRIBUTION_IDS = ['gmp_mcp_codeassist_v1_aistudio'];
const CITY_ZOOM = 12;
const REGION_ZOOM = 7;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;

function MapCameraSync({
  coordinates,
}: {
  coordinates: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }
    map.panTo(coordinates);
  }, [map, coordinates.lat, coordinates.lng]);

  return null;
}

function MapZoomController({
  city,
  coordinates,
  zoom,
  onZoomUpdate,
}: {
  city: string;
  coordinates: { lat: number; lng: number };
  zoom: number;
  onZoomUpdate: (nextZoom: number) => void;
}) {
  const map = useMap();

  function applyZoom(targetZoom: number, recenter: boolean) {
    if (!map) {
      return;
    }
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, targetZoom));
    if (recenter) {
      map.panTo(coordinates);
    }
    map.setZoom(clampedZoom);
    onZoomUpdate(clampedZoom);
  }

  function handleStepZoom(delta: number) {
    const baseZoom = map?.getZoom() ?? zoom;
    applyZoom(Math.round(baseZoom) + delta, false);
  }

  const isCityView = zoom >= 11;
  const isRegionView = zoom <= 8;

  return (
    <MapControl position={ControlPosition.TOP_RIGHT}>
      <div
        className="map-zoom-overlay"
        role="group"
        aria-label={`Zoom controls for ${city} map`}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <div className="map-zoom-presets" role="group" aria-label="Zoom presets">
          <button
            type="button"
            className={`map-zoom-preset-btn${
              isCityView ? ' map-zoom-preset-btn--active' : ''
            }`}
            aria-pressed={isCityView}
            onClick={() => applyZoom(CITY_ZOOM, true)}
            title={`Zoom into ${city} (level ${CITY_ZOOM})`}
          >
            City
          </button>
          <button
            type="button"
            className={`map-zoom-preset-btn${
              isRegionView ? ' map-zoom-preset-btn--active' : ''
            }`}
            aria-pressed={isRegionView}
            onClick={() => applyZoom(REGION_ZOOM, true)}
            title={`Zoom out to surrounding region (level ${REGION_ZOOM})`}
          >
            Region
          </button>
        </div>

        <span className="map-zoom-divider" aria-hidden="true" />

        <div className="map-zoom-stepper" role="group" aria-label="Step zoom">
          <button
            type="button"
            className="map-zoom-step-btn"
            onClick={() => handleStepZoom(1)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <span
            className="map-zoom-level"
            aria-live="polite"
            aria-label={`Zoom level ${zoom}`}
          >
            {zoom}×
          </span>
          <button
            type="button"
            className="map-zoom-step-btn"
            onClick={() => handleStepZoom(-1)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Minus size={16} strokeWidth={2.25} aria-hidden="true" />
          </button>
        </div>
      </div>
    </MapControl>
  );
}

export function WeatherLocationMap({
  apiKey,
  city,
  region,
  country,
  coordinates,
  onPickCoordinates,
}: WeatherLocationMapProps) {
  const [zoom, setZoom] = useState<number>(CITY_ZOOM);
  const locationSubtitle = [region, country].filter(Boolean).join(', ');

  function handleMapClick(event: MapMouseEvent) {
    const latLng = event.detail.latLng;
    if (!latLng) {
      return;
    }
    onPickCoordinates(latLng.lat, latLng.lng);
  }

  function handleZoomChanged(event: MapCameraChangedEvent) {
    const nextZoom = event.detail.zoom;
    if (typeof nextZoom === 'number' && !Number.isNaN(nextZoom)) {
      setZoom(Math.round(nextZoom));
    }
  }

  return (
    <section
      className="map-section weather-reveal"
      aria-labelledby="location-map-heading"
    >
      <div className="map-header">
        <div className="map-heading-group">
          <h2 id="location-map-heading" className="map-heading">
            Location Map
          </h2>
          <p className="map-meta">
            <span>{city}</span>
            {locationSubtitle && (
              <>
                <span aria-hidden="true">·</span>
                <span>{locationSubtitle}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className="map-coords">
              {coordinates.lat.toFixed(3)}°, {coordinates.lng.toFixed(3)}°
            </span>
          </p>
        </div>

        <p className="map-hint">Click anywhere on the map to check weather</p>
      </div>

      <div className="weather-map-card">
        {apiKey ? (
          <div className="weather-map-frame">
            <APIProvider apiKey={apiKey} libraries={['marker']} language="en">
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={coordinates}
                defaultZoom={CITY_ZOOM}
                gestureHandling="cooperative"
                zoomControl={false}
                streetViewControl={false}
                fullscreenControl={false}
                mapTypeControl={false}
                onClick={handleMapClick}
                onZoomChanged={handleZoomChanged}
                internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
              >
                <MapCameraSync coordinates={coordinates} />
                <MapZoomController
                  city={city}
                  coordinates={coordinates}
                  zoom={zoom}
                  onZoomUpdate={setZoom}
                />
                <AdvancedMarker
                  position={coordinates}
                  title={`${city} weather station`}
                >
                  <Pin
                    background="#0b7285"
                    borderColor="#095c6b"
                    glyphColor="#ffffff"
                  />
                </AdvancedMarker>
              </GoogleMap>
            </APIProvider>
          </div>
        ) : (
          <div className="weather-map-fallback" role="status">
            <MapPin size={22} aria-hidden="true" />
            <span>
              Map preview for {city} ({coordinates.lat.toFixed(2)}°,{' '}
              {coordinates.lng.toFixed(2)}°)
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
