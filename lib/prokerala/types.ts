export interface UserQuery {
    question: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
  }
  
  export interface AstrologyData {
    zodiacSign?: string;
    planetPositions?: Array<{
      planet: string;
      sign: string;
      house: number;
      isRetrograde: boolean;
    }>;
    lunarDay?: {
      number: number;
      summary: string;
    };
    currentDasha?: {
      planet: string;
      startDate: string;
      endDate: string;
    };
    transits?: Array<{
      planet: string;
      fromSign: string;
      toSign: string;
      date: string;
    }>;
  }
  
  export interface AstroPromptTemplate {
    systemPrompt: string;
    userPrompt: string;
  }