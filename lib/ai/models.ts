import { createDeepSeek } from '@ai-sdk/deepseek';
import { customProvider, LanguageModelV1 } from 'ai';

// Create DeepSeek instance
const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? '', // Add your DeepSeek API Key here
});
export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

// Define your provider
export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': deepseek('deepseek-chat') as LanguageModelV1,
    'title-model': deepseek('deepseek-chat') as LanguageModelV1,
    'artifact-model': deepseek('deepseek-chat') as LanguageModelV1,
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight tasks',
  }
];
