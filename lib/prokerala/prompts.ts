// lib/prokerala/prompts.ts

import { AstrologyData, UserQuery, AstroPromptTemplate } from './types';

export function generateAstroPrompt(query: UserQuery, astrologyData: AstrologyData): AstroPromptTemplate {
  // Create a detailed system prompt
  const systemPrompt = `
You are an expert astrologer with deep knowledge of vedic astrology, planetary positions, and their effects.
Analyze the following astrological data and respond to the user's question with insight, wisdom, and clarity.
Base your analysis strictly on the astrological data provided.

When giving interpretations:
- Focus on the most relevant astrological factors for the question
- Explain the meaning of significant planetary positions and aspects
- Provide both interpretation and practical advice
- Be compassionate but honest in your assessment
- Format your response clearly with sections for interpretation, advice, and key factors

Do not mention that you are an AI. Respond as if you are a human astrologer analyzing this chart.
`;

  // Create a detailed user prompt with astrological data
  const userPrompt = `
Question: ${query.question}

Birth Information:
- Date: ${query.birthDate || 'Not provided'}
- Time: ${query.birthTime || 'Not provided'}
- Place: ${query.birthPlace || 'Not provided'}

Astrological Data:
- Ascendant/Rising Sign: ${astrologyData.zodiacSign || 'Unknown'}

Planet Positions:
${astrologyData.planetPositions?.map(p => 
  `- ${p.planet} in ${p.sign} (House ${p.house})${p.isRetrograde ? ' [Retrograde]' : ''}`
).join('\n') || 'Not available'}

Current Lunar Day (Tithi):
- ${astrologyData.lunarDay?.number || 'Unknown'} - ${astrologyData.lunarDay?.summary || 'Unknown'}

Current Dasha (Planetary Period):
- ${astrologyData.currentDasha?.planet || 'Unknown'} Dasha (${astrologyData.currentDasha?.startDate || 'Unknown'} to ${astrologyData.currentDasha?.endDate || 'Unknown'})

Significant Transits:
${astrologyData.transits?.map(t => 
  `- ${t.planet} transitioning from ${t.fromSign} to ${t.toSign}`
).join('\n') || 'No significant transits'}

Please analyze this astrological data to answer my question: ${query.question}
`;

  return { systemPrompt, userPrompt };
}