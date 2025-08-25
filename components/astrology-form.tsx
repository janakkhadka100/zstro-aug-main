// components/astrology-form.tsx

'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserQuery } from '@/lib/prokerala/types';

export function AstrologyForm() {
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<UserQuery>({
    question: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
  });

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: '/api/astrology',
    id: 'astrology-chat',
    onResponse: () => {
      setLoading(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuery(prev => ({ ...prev, [name]: value }));
  };

  const handleAstroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Reset previous messages
      setMessages([]);
      
      // Make the API call
      const response = await fetch('/api/astrology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get astrological reading');
      }
      
      // Update UI state
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleNewReading = () => {
    setShowForm(true);
    setMessages([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Astrological Insights</h2>
      
      {showForm ? (
        <Card className="p-6">
          <form onSubmit={handleAstroSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Your Astrological Question</Label>
              <Textarea
                id="question"
                name="question"
                placeholder="What would you like to know about your astrological chart?"
                required
                value={query.question}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  value={query.birthDate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthTime">Birth Time</Label>
                <Input
                  id="birthTime"
                  name="birthTime"
                  type="time"
                  required
                  value={query.birthTime}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                name="birthPlace"
                placeholder="City, Country"
                required
                value={query.birthPlace}
                onChange={handleChange}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Consulting the stars...' : 'Get Astrological Reading'}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="space-y-6">
              {messages.map(message => (
                <div key={message.id} className="space-y-2">
                  {message.role === 'user' ? (
                    <div className="font-medium">Your question: {message.content}</div>
                  ) : (
                    <div className="prose max-w-none dark:prose-invert">
                      {message.content}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Reading the cosmic patterns...</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Button onClick={handleNewReading} className="w-full">
                New Astrological Reading
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}