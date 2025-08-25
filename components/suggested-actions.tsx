'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'What does your birth chart reveal?',
      label: 'Get your personalized horoscope based on your birth details.',
      action: 'What does your birth chart reveal? – Get your personalized horoscope based on your birth details.',
    },
    {
      title: 'How will your day be? ',
      label: `Read your daily horoscope for insights and guidance.`,
      action: `How will your day be? – Read your daily horoscope for insights and guidance.`,
    },
    {
      title: 'What does the future hold for you?',
      label: ` Discover predictions on career, love, health, and finance.`,
      action: `What does the future hold for you? – Discover predictions on career, love, health, and finance.`,
    },
    {
      title: 'Need astrological solutions?',
      label: 'Consult experts for remedies to your problems.',
      action: '⁠Need astrological solutions? – Consult experts for remedies to your problems.',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
