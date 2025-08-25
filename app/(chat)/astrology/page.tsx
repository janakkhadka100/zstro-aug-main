// app/(chat)/astrology/page.tsx

import { AstrologyForm } from '@/components/astrology-form';

export const metadata = {
  title: 'AI Astrology Insights',
  description: 'Get personalized astrological insights powered by AI',
};

export default function AstrologyPage() {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="container mx-auto py-4 md:py-8">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-bold mb-4">AI Astrology Insights</h1>
          <p className="text-muted-foreground mb-8">
            Get personalized astrological insights based on your birth chart and cosmic alignments.
          </p>
          <AstrologyForm />
        </div>
      </div>
    </div>
  );
}