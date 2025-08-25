// lib/prokerala/service.ts
import axios from 'axios';
import { AstrologyData, UserQuery } from './types';

interface ProkeralaConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  timezone: string;
}

interface ProkeralaPlanet {
  id: number;
  name: string;
  longitude: number;
  house: number;
  is_retrograde: boolean;
}

interface ProkeralaTithi {
  num: number;
  name: string;
  paksha: string;
}

interface ProkeralaDasha {
  name: string;
  start: string;
  end: string;
}

interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  isRetrograde: boolean;
}

class ProkeralaService {
  private config: ProkeralaConfig;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      apiKey: process.env.PROKERALA_API_KEY as string,
      apiSecret: process.env.PROKERALA_API_SECRET as string,
      baseUrl: 'https://api.prokerala.com/v2',
    };

    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Missing Prokerala API credentials in environment variables');
    }
  }

  /**
   * Get an access token for the Prokerala API
   */
  private async getAccessToken(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      const response = await axios.post<AuthResponse>('https://api.prokerala.com/token', {
        grant_type: 'client_credentials',
        client_id: this.config.apiKey,
        client_secret: this.config.apiSecret,
      });

      this.token = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      return this.token;
    } catch (error: any) {
      throw new Error('Authentication with Prokerala API failed: ' + error.message);
    }
  }

  /**
   * Get coordinates for a location (stubbed for now)
   */
  private async getCoordinates(): Promise<Coordinates> {
    return {
      latitude: 27.710315,
      longitude: 85.322163,
      timezone: 'Asia/Kathmandu',
    };
  }

  /**
   * Format date and time to ISO format
   */
  private formatDateTime(date: string, time: string): string {
    let formattedDate = date;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split('/');
      formattedDate = `${year}-${month}-${day}`;
    }
    return `${formattedDate}T${time}:00`;
  }

  /**
   * Get astrological data from Prokerala API
   */
  public async getAstrologyData(userQuery: UserQuery): Promise<AstrologyData> {
    if (!userQuery.birthDate || !userQuery.birthTime || !userQuery.birthPlace) {
      throw new Error('Missing required birth details');
    }

    const coordinates = await this.getCoordinates();
    const token = await this.getAccessToken();
    const datetime = this.formatDateTime(userQuery.birthDate, userQuery.birthTime);

    try {
      const birthChartResponse = await axios.get(`${this.config.baseUrl}/astrology/birth-details`, {
        params: { datetime, latitude: coordinates.latitude, longitude: coordinates.longitude, ayanamsa: 1 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const panchangResponse = await axios.get(`${this.config.baseUrl}/astrology/panchang`, {
        params: { datetime, coordinates: `${coordinates.latitude},${coordinates.longitude}` },
        headers: { Authorization: `Bearer ${token}` },
      });

      const dashaResponse = await axios.get(`${this.config.baseUrl}/astrology/dasha-periods`, {
        params: { datetime, latitude: coordinates.latitude, longitude: coordinates.longitude, ayanamsa: 1 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const now = new Date().toISOString();
      const transitResponse = await axios.get(`${this.config.baseUrl}/astrology/planet-position`, {
        params: { datetime: now, latitude: coordinates.latitude, longitude: coordinates.longitude, ayanamsa: 1 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const zodiacSigns = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
      ];

      const ascendantSign = zodiacSigns[Math.floor(birthChartResponse.data.data.ascendant / 30)];

      const planetPositions: PlanetPosition[] = birthChartResponse.data.data.planets.map((planet: ProkeralaPlanet) => ({
        planet: planet.name,
        sign: zodiacSigns[Math.floor(planet.longitude / 30)],
        house: planet.house,
        isRetrograde: planet.is_retrograde,
      }));

      const tithi = panchangResponse.data.data.tithi as ProkeralaTithi;
      const lunarDay = { number: tithi.num, summary: `${tithi.name} (${tithi.paksha})` };

      const currentDasha = {
        planet: dashaResponse.data.data.current.name,
        startDate: dashaResponse.data.data.current.start,
        endDate: dashaResponse.data.data.current.end,
      };

      const birthChartPositions = new Map(
        planetPositions.map((p) => [p.planet, zodiacSigns.indexOf(p.sign)])
      );

      const transits = transitResponse.data.data.planets
        .filter((planet: ProkeralaPlanet) => {
          const birthPosition = birthChartPositions.get(planet.name);
          if (birthPosition === undefined) return false;
          return birthPosition !== Math.floor(planet.longitude / 30);
        })
        .map((planet: ProkeralaPlanet) => ({
          planet: planet.name,
          fromSign: zodiacSigns[birthChartPositions.get(planet.name) as number],
          toSign: zodiacSigns[Math.floor(planet.longitude / 30)],
          date: new Date().toISOString().split('T')[0],
        }));

      return { zodiacSign: ascendantSign, planetPositions, lunarDay, currentDasha, transits };
    } catch (error: any) {
      throw new Error(`Failed to fetch astrological data: ${error.message || 'Unknown error'}`);
    }
  }
}

// Create singleton instance
const prokeralaService = new ProkeralaService();
export default prokeralaService;
