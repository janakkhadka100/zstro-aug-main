import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import prokeralaService from '@/lib/prokerala/service';
import { generateAstroPrompt } from '@/lib/prokerala/prompts';
import { auth } from '@/app/(auth)/auth';

// Ensure API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in environment variables.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse the request body
    const { question, birthDate, birthTime, birthPlace } = await req.json();

    // Validate input
    if (!question) {
      return new NextResponse('Question is required', { status: 400 });
    }
    if (!birthDate || !birthTime || !birthPlace) {
      return new NextResponse('Birth details are required', { status: 400 });
    }

    const userQuery = { question, birthDate, birthTime, birthPlace };
    console.log('Processing astrology request for:', {
      question,
      birthDate,
      birthTime,
      birthPlace
    });

    // Fetch astrological data
    let astrologyData;
    try {
      console.log('Fetching astrology data from Prokerala...');
      astrologyData = await prokeralaService.getAstrologyData(userQuery);
      console.log('Astrology data fetched:', astrologyData);
    } catch (error: any) {
      console.error('Error fetching astrological data:', error);
      console.error('Error details:', error.response?.data || error.message);
      return new NextResponse(
        `Failed to fetch astrological data: ${error.message || 'Unknown error'}`,
        { status: 500 }
      );
    }
    

    // Rest of your code...
  } catch (error: any) {
    console.error('Error processing astrology request:', error);
    return new NextResponse(
      `Internal Server Error: ${error.message || 'Unknown error'}`, 
      { status: 500 }
    );
  }
}
