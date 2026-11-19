export type TemperatureUnit = 'C' | 'F';

export interface DailyForecast {
  id: string;
  dayShort: string;
  dayFull: string;
  dateLabel: string;
  emoji: string;
  emojiLabel: string;
  condition: string;
  summary: string;
  tempC: number;
  tempMaxC: number;
  tempMinC: number;
  feelsLikeC: number;
  windKmh: number;
  humidityPct: number;
}

export interface HourlyForecastPoint {
  id: string;
  hour24: number;
  timeLabel: string;
  isCurrentHour: boolean;
  emoji: string;
  emojiLabel: string;
  tempC: number;
}

export type WeatherAlertSeverity = 'Advisory' | 'Watch' | 'Warning';

export type WeatherMood =
  | 'sunny'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'cool';

export interface WeatherAlert {
  id: string;
  severity: WeatherAlertSeverity;
  title: string;
  issuedBy: string;
  authorityUri?: string;
  effectiveUntil: string;
  summary: string;
  guidance: string[];
}

export interface SearchHistoryEntry {
  id: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  emoji: string;
  tempC: number;
  checkedAt: number;
}

export interface CityWeather {
  id: string;
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sunrise: string;
  sunset: string;
  source?: 'live' | 'sample';
  alert?: WeatherAlert;
  hourly?: HourlyForecastPoint[];
  forecast: DailyForecast[];
}

export const SAMPLE_CITIES: CityWeather[] = [
  {
    id: 'vijayawada',
    city: 'Vijayawada',
    region: 'Andhra Pradesh',
    country: 'India',
    coordinates: { lat: 16.5062, lng: 80.648 },
    sunrise: '6:14 AM',
    sunset: '5:39 PM',
    source: 'sample',
    forecast: [
      {
        id: 'vja-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '⛅',
        emojiLabel: 'Partly sunny',
        condition: 'Partly Sunny',
        summary: 'Warm afternoon breeze along the Krishna River with scattered coastal clouds.',
        tempC: 31,
        tempMaxC: 32,
        tempMinC: 23,
        feelsLikeC: 34,
        windKmh: 14,
        humidityPct: 62,
      },
      {
        id: 'vja-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Clear & Sunny',
        summary: 'Bright sunshine through the day with comfortable evening cooling.',
        tempC: 32,
        tempMaxC: 33,
        tempMinC: 22,
        feelsLikeC: 34,
        windKmh: 11,
        humidityPct: 55,
      },
      {
        id: 'vja-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Mostly Sunny',
        summary: 'Light high clouds drifting inland with steady easterly winds.',
        tempC: 31,
        tempMaxC: 32,
        tempMinC: 23,
        feelsLikeC: 33,
        windKmh: 13,
        humidityPct: 58,
      },
      {
        id: 'vja-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '☁️',
        emojiLabel: 'Cloudy',
        condition: 'Overcast',
        summary: 'Soft cloud cover keeping peak afternoon heat milder than average.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 24,
        feelsLikeC: 32,
        windKmh: 16,
        humidityPct: 71,
      },
      {
        id: 'vja-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '🌧️',
        emojiLabel: 'Rain showers',
        condition: 'Passing Showers',
        summary: 'Intermittent light rain showers arriving from the Bay of Bengal.',
        tempC: 27,
        tempMaxC: 28,
        tempMinC: 23,
        feelsLikeC: 30,
        windKmh: 19,
        humidityPct: 81,
      },
      {
        id: 'vja-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Clearing Skies',
        summary: 'Morning mist lifting into bright breaks of sun by midday.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 22,
        feelsLikeC: 31,
        windKmh: 12,
        humidityPct: 68,
      },
      {
        id: 'vja-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Bright & Calm',
        summary: 'Dry, clear skies with gentle winds and pleasant late-evening air.',
        tempC: 30,
        tempMaxC: 31,
        tempMinC: 21,
        feelsLikeC: 32,
        windKmh: 10,
        humidityPct: 56,
      },
    ],
  },
  {
    id: 'visakhapatnam',
    city: 'Visakhapatnam',
    region: 'Andhra Pradesh',
    country: 'India',
    coordinates: { lat: 17.6868, lng: 83.2185 },
    sunrise: '6:05 AM',
    sunset: '5:28 PM',
    source: 'sample',
    alert: {
      id: 'vzg-coastal-squall-watch',
      severity: 'Watch',
      title: 'Coastal Squall & Gusty Wind Watch',
      issuedBy: 'Bay of Bengal Coastal Office',
      effectiveUntil: 'Sat, Nov 21 · 9:00 PM',
      summary:
        'Isolated coastal thunderstorms and gusty onshore winds up to 25 km/h are expected along the shoreline starting Friday afternoon.',
      guidance: [
        'Avoid exposed beachfront roads and sea walls during passing squall bands.',
        'Secure lightweight balcony furniture and outdoor fixtures ahead of Friday evening.',
        'Allow extra travel time along coastal highways when visibility drops in showers.',
      ],
    },
    forecast: [
      {
        id: 'vzg-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Coastal Breeze',
        summary: 'Fresh onshore sea breeze across RK Beach with scattered sunlit clouds.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 23,
        feelsLikeC: 32,
        windKmh: 18,
        humidityPct: 72,
      },
      {
        id: 'vzg-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Partly Cloudy',
        summary: 'Mild coastal haze in the morning followed by sunny afternoon spells.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 24,
        feelsLikeC: 32,
        windKmh: 16,
        humidityPct: 74,
      },
      {
        id: 'vzg-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '🌧️',
        emojiLabel: 'Light rain',
        condition: 'Coastal Showers',
        summary: 'Brief tropical rain bands drifting in off the bay during the afternoon.',
        tempC: 27,
        tempMaxC: 28,
        tempMinC: 23,
        feelsLikeC: 30,
        windKmh: 22,
        humidityPct: 83,
      },
      {
        id: 'vzg-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '⛈️',
        emojiLabel: 'Thunderstorm',
        condition: 'Isolated Storms',
        summary: 'Passing coastal squalls with brisk winds and cooler temperatures.',
        tempC: 26,
        tempMaxC: 27,
        tempMinC: 22,
        feelsLikeC: 29,
        windKmh: 25,
        humidityPct: 86,
      },
      {
        id: 'vzg-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '⛅',
        emojiLabel: 'Partly sunny',
        condition: 'Partly Sunny',
        summary: 'Brighter intervals returning with calm waves and lower humidity.',
        tempC: 28,
        tempMaxC: 29,
        tempMinC: 22,
        feelsLikeC: 30,
        windKmh: 15,
        humidityPct: 70,
      },
      {
        id: 'vzg-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Clear Skies',
        summary: 'Crisp blue skies along the coastline with light afternoon breezes.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 21,
        feelsLikeC: 31,
        windKmh: 13,
        humidityPct: 64,
      },
      {
        id: 'vzg-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Sunny & Mild',
        summary: 'Clear visibility and pleasant temperatures throughout the day.',
        tempC: 30,
        tempMaxC: 31,
        tempMinC: 22,
        feelsLikeC: 32,
        windKmh: 14,
        humidityPct: 62,
      },
    ],
  },
  {
    id: 'hyderabad',
    city: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    coordinates: { lat: 17.385, lng: 78.4867 },
    sunrise: '6:23 AM',
    sunset: '5:42 PM',
    source: 'sample',
    forecast: [
      {
        id: 'hyd-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Sunny & Dry',
        summary: 'Pleasant plateau sunshine with low humidity and cool evening air.',
        tempC: 28,
        tempMaxC: 29,
        tempMinC: 17,
        feelsLikeC: 28,
        windKmh: 10,
        humidityPct: 44,
      },
      {
        id: 'hyd-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Clear Skies',
        summary: 'Bright daylight hours with a crisp chill after sunset.',
        tempC: 28,
        tempMaxC: 29,
        tempMinC: 16,
        feelsLikeC: 28,
        windKmh: 9,
        humidityPct: 42,
      },
      {
        id: 'hyd-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Mostly Sunny',
        summary: 'A few drifting afternoon clouds over otherwise clear skies.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 17,
        feelsLikeC: 29,
        windKmh: 11,
        humidityPct: 46,
      },
      {
        id: 'hyd-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Partly Cloudy',
        summary: 'Soft afternoon cloud cover with gentle northeastern breezes.',
        tempC: 27,
        tempMaxC: 28,
        tempMinC: 18,
        feelsLikeC: 27,
        windKmh: 12,
        humidityPct: 52,
      },
      {
        id: 'hyd-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '☁️',
        emojiLabel: 'Cloudy',
        condition: 'Mostly Cloudy',
        summary: 'Cooler overcast stretch with a faint chance of evening drizzle.',
        tempC: 26,
        tempMaxC: 27,
        tempMinC: 18,
        feelsLikeC: 26,
        windKmh: 14,
        humidityPct: 59,
      },
      {
        id: 'hyd-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Clearing Skies',
        summary: 'Morning haze giving way to clear, comfortable afternoon sunshine.',
        tempC: 27,
        tempMaxC: 28,
        tempMinC: 16,
        feelsLikeC: 27,
        windKmh: 10,
        humidityPct: 48,
      },
      {
        id: 'hyd-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Bright & Crisp',
        summary: 'Calm winds and cloudless skies from sunrise to dusk.',
        tempC: 28,
        tempMaxC: 29,
        tempMinC: 15,
        feelsLikeC: 28,
        windKmh: 8,
        humidityPct: 43,
      },
    ],
  },
  {
    id: 'bengaluru',
    city: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    sunrise: '6:21 AM',
    sunset: '5:51 PM',
    source: 'sample',
    forecast: [
      {
        id: 'blr-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Mild & Breezy',
        summary: 'Comfortable highland temperatures with soft clouds and cool evenings.',
        tempC: 24,
        tempMaxC: 26,
        tempMinC: 16,
        feelsLikeC: 24,
        windKmh: 12,
        humidityPct: 60,
      },
      {
        id: 'blr-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Mostly Sunny',
        summary: 'Gentle morning mist fading into bright, mild afternoon light.',
        tempC: 25,
        tempMaxC: 26,
        tempMinC: 16,
        feelsLikeC: 25,
        windKmh: 11,
        humidityPct: 57,
      },
      {
        id: 'blr-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '🌧️',
        emojiLabel: 'Light rain',
        condition: 'Evening Drizzle',
        summary: 'Pleasant daytime clouds followed by light passing rain around dusk.',
        tempC: 23,
        tempMaxC: 24,
        tempMinC: 17,
        feelsLikeC: 23,
        windKmh: 15,
        humidityPct: 74,
      },
      {
        id: 'blr-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '☁️',
        emojiLabel: 'Cloudy',
        condition: 'Cool & Overcast',
        summary: 'Steady cloud deck keeping temperatures brisk throughout the day.',
        tempC: 22,
        tempMaxC: 23,
        tempMinC: 16,
        feelsLikeC: 22,
        windKmh: 13,
        humidityPct: 72,
      },
      {
        id: 'blr-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '⛅',
        emojiLabel: 'Partly sunny',
        condition: 'Partly Sunny',
        summary: 'Sunbreaks returning by late morning with calm light winds.',
        tempC: 24,
        tempMaxC: 25,
        tempMinC: 15,
        feelsLikeC: 24,
        windKmh: 10,
        humidityPct: 62,
      },
      {
        id: 'blr-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Clear & Pleasant',
        summary: 'Crisp blue skies and ideal outdoor temperatures all afternoon.',
        tempC: 25,
        tempMaxC: 26,
        tempMinC: 15,
        feelsLikeC: 25,
        windKmh: 9,
        humidityPct: 54,
      },
      {
        id: 'blr-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Mostly Sunny',
        summary: 'Mild daylight warmth with a cool, clear night ahead.',
        tempC: 25,
        tempMaxC: 26,
        tempMinC: 15,
        feelsLikeC: 25,
        windKmh: 10,
        humidityPct: 56,
      },
    ],
  },
  {
    id: 'chennai',
    city: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    sunrise: '6:09 AM',
    sunset: '5:41 PM',
    source: 'sample',
    alert: {
      id: 'maa-monsoon-rain-warning',
      severity: 'Warning',
      title: 'Northeast Monsoon & Heavy Rain Warning',
      issuedBy: 'Regional Meteorological Centre',
      effectiveUntil: 'Thu, Nov 19 · 11:00 PM',
      summary:
        'Persistent monsoon rain bands and passing thunderstorms may cause localized waterlogging in low-lying coastal corridors.',
      guidance: [
        'Keep waterproof gear handy and avoid driving through standing water on underpasses.',
        'Expect slower evening commutes near coastal arteries and storm-drain junctions.',
        'Keep mobile devices charged in case brief localized power interruptions occur.',
      ],
    },
    forecast: [
      {
        id: 'maa-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '🌧️',
        emojiLabel: 'Rain showers',
        condition: 'Monsoon Showers',
        summary: 'Northeast monsoon showers moving inland with steady coastal winds.',
        tempC: 28,
        tempMaxC: 29,
        tempMinC: 24,
        feelsLikeC: 32,
        windKmh: 20,
        humidityPct: 82,
      },
      {
        id: 'maa-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '⛈️',
        emojiLabel: 'Thunderstorm',
        condition: 'Passing Storms',
        summary: 'Brief heavy showers possible near the coast with gusty breezes.',
        tempC: 27,
        tempMaxC: 28,
        tempMinC: 24,
        feelsLikeC: 31,
        windKmh: 24,
        humidityPct: 86,
      },
      {
        id: 'maa-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '🌧️',
        emojiLabel: 'Light rain',
        condition: 'Scattered Rain',
        summary: 'Light intermittent showers easing by late evening.',
        tempC: 28,
        tempMaxC: 29,
        tempMinC: 24,
        feelsLikeC: 32,
        windKmh: 18,
        humidityPct: 80,
      },
      {
        id: 'maa-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '☁️',
        emojiLabel: 'Cloudy',
        condition: 'Mostly Cloudy',
        summary: 'Humid coastal air under a soft canopy of grey-white clouds.',
        tempC: 29,
        tempMaxC: 30,
        tempMinC: 25,
        feelsLikeC: 33,
        windKmh: 16,
        humidityPct: 76,
      },
      {
        id: 'maa-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '⛅',
        emojiLabel: 'Partly sunny',
        condition: 'Partly Sunny',
        summary: 'Warm sunbeams breaking through with a steady Marina sea breeze.',
        tempC: 30,
        tempMaxC: 31,
        tempMinC: 24,
        feelsLikeC: 34,
        windKmh: 15,
        humidityPct: 72,
      },
      {
        id: 'maa-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Mostly Sunny',
        summary: 'Drier spell with clear afternoon horizons and gentle winds.',
        tempC: 30,
        tempMaxC: 31,
        tempMinC: 24,
        feelsLikeC: 34,
        windKmh: 14,
        humidityPct: 70,
      },
      {
        id: 'maa-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Partly Cloudy',
        summary: 'Warm humid morning followed by breezy coastal skies.',
        tempC: 30,
        tempMaxC: 31,
        tempMinC: 24,
        feelsLikeC: 34,
        windKmh: 15,
        humidityPct: 71,
      },
    ],
  },
  {
    id: 'london',
    city: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5072, lng: -0.1276 },
    sunrise: '7:24 AM',
    sunset: '4:07 PM',
    source: 'sample',
    forecast: [
      {
        id: 'lon-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '☁️',
        emojiLabel: 'Cloudy',
        condition: 'Cool & Overcast',
        summary: 'Crisp autumn air along the Thames with a calm overcast ceiling.',
        tempC: 10,
        tempMaxC: 11,
        tempMinC: 6,
        feelsLikeC: 8,
        windKmh: 16,
        humidityPct: 78,
      },
      {
        id: 'lon-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '🌧️',
        emojiLabel: 'Light rain',
        condition: 'Light Rain',
        summary: 'Steady afternoon drizzle moving eastward across the city.',
        tempC: 9,
        tempMaxC: 10,
        tempMinC: 5,
        feelsLikeC: 7,
        windKmh: 21,
        humidityPct: 86,
      },
      {
        id: 'lon-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Bright Spells',
        summary: 'Brisk westerly breeze clearing clouds for sunny lunchtime spells.',
        tempC: 11,
        tempMaxC: 12,
        tempMinC: 6,
        feelsLikeC: 9,
        windKmh: 18,
        humidityPct: 72,
      },
      {
        id: 'lon-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Crisp & Bright',
        summary: 'Low golden November sun with chilly evening temperatures.',
        tempC: 10,
        tempMaxC: 11,
        tempMinC: 4,
        feelsLikeC: 8,
        windKmh: 11,
        humidityPct: 68,
      },
      {
        id: 'lon-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '☁️',
        emojiLabel: 'Cloudy',
        condition: 'Mostly Cloudy',
        summary: 'Dry and calm under high silver clouds.',
        tempC: 9,
        tempMaxC: 10,
        tempMinC: 5,
        feelsLikeC: 7,
        windKmh: 13,
        humidityPct: 75,
      },
      {
        id: 'lon-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '🌧️',
        emojiLabel: 'Rain showers',
        condition: 'Passing Showers',
        summary: 'Brief rain bands alternating with cool cloudy breaks.',
        tempC: 8,
        tempMaxC: 9,
        tempMinC: 4,
        feelsLikeC: 6,
        windKmh: 19,
        humidityPct: 84,
      },
      {
        id: 'lon-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Partly Cloudy',
        summary: 'Drier air settling in with light winds and clear dusk skies.',
        tempC: 9,
        tempMaxC: 10,
        tempMinC: 4,
        feelsLikeC: 7,
        windKmh: 12,
        humidityPct: 71,
      },
    ],
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    sunrise: '6:20 AM',
    sunset: '4:33 PM',
    source: 'sample',
    forecast: [
      {
        id: 'tyo-day-0',
        dayShort: 'Today',
        dayFull: 'Wednesday',
        dateLabel: 'Nov 18',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Clear Autumn Sky',
        summary: 'Crisp sunshine and clear visibility across Tokyo Bay.',
        tempC: 16,
        tempMaxC: 18,
        tempMinC: 9,
        feelsLikeC: 15,
        windKmh: 12,
        humidityPct: 50,
      },
      {
        id: 'tyo-day-1',
        dayShort: 'Thu',
        dayFull: 'Thursday',
        dateLabel: 'Nov 19',
        emoji: '🌤️',
        emojiLabel: 'Mostly sunny',
        condition: 'Mostly Sunny',
        summary: 'Mild daylight warmth with light coastal breezes.',
        tempC: 17,
        tempMaxC: 19,
        tempMinC: 10,
        feelsLikeC: 16,
        windKmh: 10,
        humidityPct: 52,
      },
      {
        id: 'tyo-day-2',
        dayShort: 'Fri',
        dayFull: 'Friday',
        dateLabel: 'Nov 20',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Partly Cloudy',
        summary: 'Increasing afternoon clouds ahead of a weak coastal front.',
        tempC: 15,
        tempMaxC: 17,
        tempMinC: 10,
        feelsLikeC: 14,
        windKmh: 14,
        humidityPct: 60,
      },
      {
        id: 'tyo-day-3',
        dayShort: 'Sat',
        dayFull: 'Saturday',
        dateLabel: 'Nov 21',
        emoji: '🌧️',
        emojiLabel: 'Light rain',
        condition: 'Morning Rain',
        summary: 'Cool showers tapering off into dry evening skies.',
        tempC: 13,
        tempMaxC: 14,
        tempMinC: 8,
        feelsLikeC: 11,
        windKmh: 18,
        humidityPct: 79,
      },
      {
        id: 'tyo-day-4',
        dayShort: 'Sun',
        dayFull: 'Sunday',
        dateLabel: 'Nov 22',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Sunny & Crisp',
        summary: 'Fresh air and bright blue skies ideal for walking.',
        tempC: 15,
        tempMaxC: 17,
        tempMinC: 8,
        feelsLikeC: 14,
        windKmh: 11,
        humidityPct: 48,
      },
      {
        id: 'tyo-day-5',
        dayShort: 'Mon',
        dayFull: 'Monday',
        dateLabel: 'Nov 23',
        emoji: '☀️',
        emojiLabel: 'Sunny',
        condition: 'Clear & Calm',
        summary: 'Light winds with steady sunshine all afternoon.',
        tempC: 16,
        tempMaxC: 18,
        tempMinC: 9,
        feelsLikeC: 15,
        windKmh: 9,
        humidityPct: 46,
      },
      {
        id: 'tyo-day-6',
        dayShort: 'Tue',
        dayFull: 'Tuesday',
        dateLabel: 'Nov 24',
        emoji: '⛅',
        emojiLabel: 'Partly cloudy',
        condition: 'Partly Cloudy',
        summary: 'Gentle cloud cover keeping evening temperatures mild.',
        tempC: 15,
        tempMaxC: 16,
        tempMinC: 9,
        feelsLikeC: 14,
        windKmh: 11,
        humidityPct: 54,
      },
    ],
  },
];

export const DEFAULT_CITY_ID = 'vijayawada';

export function convertTemp(tempC: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

export function formatTemp(tempC: number, unit: TemperatureUnit): string {
  return `${convertTemp(tempC, unit)}°${unit}`;
}

export function formatTempCompact(tempC: number, unit: TemperatureUnit): string {
  return `${convertTemp(tempC, unit)}°`;
}

export function formatWind(windKmh: number, unit: TemperatureUnit): string {
  if (unit === 'F') {
    const mph = Math.round(windKmh * 0.621371);
    return `${mph} mph`;
  }
  return `${windKmh} km/h`;
}

export function findCityByQuery(rawQuery: string): CityWeather | undefined {
  const normalized = rawQuery.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return SAMPLE_CITIES.find(
    (entry) =>
      entry.city.toLowerCase() === normalized ||
      entry.city.toLowerCase().includes(normalized) ||
      entry.region.toLowerCase().includes(normalized) ||
      entry.country.toLowerCase().includes(normalized)
  );
}

function parseHour24(time12h: string, fallbackHour: number): number {
  const match = time12h.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return fallbackHour;
  }
  let hour = Number(match[1]) % 12;
  const period = match[3].toUpperCase();
  if (period === 'PM') {
    hour += 12;
  }
  return hour;
}

function formatHourLabel(hour24: number): string {
  const normalized = ((hour24 % 24) + 24) % 24;
  if (normalized === 0) return '12 AM';
  if (normalized === 12) return '12 PM';
  if (normalized < 12) return `${normalized} AM`;
  return `${normalized - 12} PM`;
}

function getHourlyConditionIcon(
  day: DailyForecast,
  hour24: number,
  sunriseHour: number,
  sunsetHour: number
): { emoji: string; emojiLabel: string } {
  const isNight = hour24 < sunriseHour || hour24 >= sunsetHour + 1;

  if (day.emoji === '⛈️') {
    if (hour24 >= 13 && hour24 <= 19) {
      return { emoji: '⛈️', emojiLabel: 'Thunderstorm' };
    }
    return isNight
      ? { emoji: '🌧️', emojiLabel: 'Night showers' }
      : { emoji: '🌧️', emojiLabel: 'Rain showers' };
  }

  if (day.emoji === '🌧️') {
    if (hour24 >= 11 && hour24 <= 18) {
      return { emoji: '🌧️', emojiLabel: 'Rain showers' };
    }
    return { emoji: '☁️', emojiLabel: 'Cloudy' };
  }

  if (isNight) {
    if (day.emoji === '☁️') {
      return { emoji: '☁️', emojiLabel: 'Cloudy night' };
    }
    return { emoji: '🌙', emojiLabel: 'Clear night' };
  }

  if (hour24 === sunriseHour || hour24 === sunsetHour) {
    if (day.emoji === '☀️' || day.emoji === '🌤️') {
      return { emoji: '🌤️', emojiLabel: 'Soft daylight' };
    }
  }

  return { emoji: day.emoji, emojiLabel: day.emojiLabel };
}

export function getHourlyForecast(
  city: CityWeather,
  day: DailyForecast,
  isToday: boolean
): HourlyForecastPoint[] {
  const sunriseHour = parseHour24(city.sunrise, 6);
  const sunsetHour = parseHour24(city.sunset, 18);
  const startHour = isToday ? 14 : 0;

  return Array.from({ length: 24 }, (_, offset) => {
    const hour24 = (startHour + offset) % 24;
    const isCurrentHour = isToday && offset === 0;

    // Smooth diurnal curve: coolest around 5:00 AM, warmest around 2:00 PM (14:00)
    const radians = ((hour24 - 14) / 24) * Math.PI * 2;
    const warmthFactor = (Math.cos(radians) + 1) / 2;
    const rawTemp = day.tempMinC + (day.tempMaxC - day.tempMinC) * warmthFactor;
    const tempC = isCurrentHour ? day.tempC : Math.round(rawTemp);

    const { emoji, emojiLabel } = isCurrentHour
      ? { emoji: day.emoji, emojiLabel: day.emojiLabel }
      : getHourlyConditionIcon(day, hour24, sunriseHour, sunsetHour);

    return {
      id: `${day.id}-hr-${hour24}`,
      hour24,
      timeLabel: isCurrentHour ? 'Now' : formatHourLabel(hour24),
      isCurrentHour,
      emoji,
      emojiLabel,
      tempC,
    };
  });
}

export function getActiveWeatherAlert(city: CityWeather): WeatherAlert | null {
  if (city.alert) {
    return city.alert;
  }

  const severeDay = city.forecast.find(
    (day) => day.emoji === '⛈️' || day.windKmh >= 30 || day.tempMaxC >= 40
  );

  if (!severeDay) {
    return null;
  }

  return {
    id: `${city.id}-auto-${severeDay.id}`,
    severity: 'Advisory',
    title: `${severeDay.condition} Advisory`,
    issuedBy: 'Local Weather Service',
    effectiveUntil: `${severeDay.dayFull}, ${severeDay.dateLabel}`,
    summary: severeDay.summary,
    guidance: [
      'Check local weather updates before scheduling outdoor travel.',
      'Prepare for rapidly shifting wind or rain conditions during peak hours.',
    ],
  };
}

export function getWeatherMood(day: DailyForecast): WeatherMood {
  const condition = day.condition.toLowerCase();

  if (
    day.emoji === '⛈️' ||
    condition.includes('storm') ||
    condition.includes('thunder') ||
    condition.includes('squall')
  ) {
    return 'stormy';
  }

  if (
    day.emoji === '🌧️' ||
    condition.includes('rain') ||
    condition.includes('shower') ||
    condition.includes('drizzle')
  ) {
    return 'rainy';
  }

  if (day.tempC <= 12 || day.emoji === '❄️') {
    return 'cool';
  }

  if (
    day.emoji === '☁️' ||
    condition.includes('overcast') ||
    condition.includes('mostly cloudy')
  ) {
    return 'cloudy';
  }

  if (
    day.emoji === '☀️' ||
    day.emoji === '🌤️' ||
    condition.includes('sunny') ||
    condition.includes('clear')
  ) {
    return 'sunny';
  }

  return 'partly-cloudy';
}
