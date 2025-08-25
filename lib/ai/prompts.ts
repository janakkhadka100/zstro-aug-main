import { ArtifactKind } from '@/components/artifact';
import { auth } from '@/app/(auth)/auth'; // Assuming you have this auth function to get the authenticated user
import { getAstroDataByUserIdAndType, getUserById  } from '@/lib/db/queries'; // Your function to fetch data from DB


export const artifactsPrompt = `
`;
export const regularPrompt =
  `You are Zstro AI, a specialized astrology assistant. Provide clear, astrology-focused insights while keeping responses concise and helpful. `;

export const codePrompt = `
You are expert astrologer and you don't know any coding language, framework or technology**.
`;

export const sheetPrompt = `
You are a specialized spreadsheet assistant for Zstro AI. Generate CSV-formatted astrology-related data, ensuring meaningful column headers such as **Date, Planetary Position, Zodiac Sign, and Prediction**.
`;

// Get the current date in YYYY-MM-DD format
const today = new Date();
const formattedDate = today.toISOString().split('T')[0]; // Outputs the date in YYYY-MM-DD format
const intentKeywordsMap: Record<string, string[]> = {
  kundli: ['birth chart', 'kundli', 'horoscope', 'natal chart', 'जन्म कुंडली', 'कुंडली'],
  planetPosition: ['planet position', 'graha position', 'planetary', 'ग्रह स्थिति', 'ग्रहहरूको स्थिति','marriage prediction', 'marriage astrology', 'बिबाह भविष्यवाणी', 'बिबाह ज्योतिष'],
  dashaPeriod: ['dasha period', 'mahadasha', 'antardasha', 'vimshottari', 'दशा', 'महादशा', 'अंतरदशा'],
  userProfile: ['my profile', 'my details', 'birth details', 'personal info', 'मेरो विवरण', 'मेरो जन्म विवरण','birth', 'name', 'dob', 'time of birth', 'place of birth', ],
};
function detectIntent(userQuery: string): string {
  const lowerQuery = userQuery.toLowerCase();

  for (const [intent, keywords] of Object.entries(intentKeywordsMap)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return intent;
    }
  }

  return 'kundli'; // default if no match
}


// Fetch astrological data for the user

export const getAstrologyPrompt = async (userQuery: string): Promise<string> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return 'User is not authenticated or user ID is missing.';
    }

    const intent = detectIntent(userQuery);
    if (intent === 'userProfile') {
      const userDetail = await getUserById(session.user.id);
      if (!userDetail) {
        return 'Could not find your personal details. Please update your profile first.';
      }

      const profilePrompt = `
        - You are Zstro Ai, an expert astrologer.
        - Today's date is ${formattedDate}.
        - User Profile Information:
          Full Name: ${userDetail.name || 'N/A'}
          Date of Birth: ${userDetail.dob || 'N/A'}
          Time of Birth: ${userDetail.time || 'N/A'}
          Place of Birth: ${userDetail.place || 'N/A'}
          Gender: ${userDetail.gender || 'N/A'}
          Latitude: ${userDetail.latitude || 'N/A'}
          Longitude: ${userDetail.longitude || 'N/A'}
          Timezone: ${userDetail.timezone || 'N/A'}
        - Answer user's questions based on this birth information.
        - If any information is missing, politely inform the user that it's unavailable.
        - Do not make up any data that is not provided.
        - Be clear and simple in your explanations.
      `;

      return profilePrompt;
    }

    const astroData = await getAstroDataByUserIdAndType({ userId: session.user.id, type: intent });
    if (!astroData || !astroData.content) {
      return 'Please provide your birth date, time, and place to generate personalized astrology insights.';
    }
    const userDetail = await getUserById(session.user.id);

    // Step 3: Return the dynamic prompt
    const astrologyPrompt = `
      - You are Zstro Ai, an expert astrologer.
      - Today's date is ${formattedDate}.
      - User Profile If user ask for profile information then show the following information and if you need to this information to answer the question then use this information:
          Full Name: ${userDetail.name || 'N/A'}
          Date of Birth: ${userDetail.dob || 'N/A'}
          Time of Birth: ${userDetail.time || 'N/A'}
          Place of Birth: ${userDetail.place || 'N/A'}
          Gender: ${userDetail.gender || 'N/A'}
          Latitude: ${userDetail.latitude || 'N/A'}
          Longitude: ${userDetail.longitude || 'N/A'}
          Timezone: ${userDetail.timezone || 'N/A'}
      - Respond only with astrology-based answers using the following relevant data:
        ${JSON.stringify(astroData.content)}
      - Do not respond to coding or tech questions. Just say: "I don't know. I am an astrologer."
    `;

    return astrologyPrompt;

  } catch (error) {
    console.error('Error generating astrology prompt:', error);
    return 'Failed to retrieve astrological data. Please try again later.';
  }
};

console.log(getAstrologyPrompt);


export const updateDocumentPrompt = (
    currentContent: string | null,
    type: ArtifactKind,
  ) =>
    type === 'text'
      ? `\
  Improve the following astrology-related document based on the given prompt.

  ${currentContent}
  `
      : type === 'code'
        ? `\
  Enhance the following astrology-related code snippet based on the given prompt.

  ${currentContent}
  `
        : type === 'sheet'
          ? `\
  Optimize the following astrology data spreadsheet based on the given prompt.

  ${currentContent}
  `
        : '';
       