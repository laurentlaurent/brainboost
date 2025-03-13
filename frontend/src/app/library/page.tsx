'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Define API backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type FlashcardSetSummary = {
  id: string;
  title: string;
  count: number;
};

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = false;

export default function LibraryPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/flashcards`);
      setFlashcardSets(response.data);
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      // Type guard to safely access error.response
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to load flashcard sets');
      } else {
        setError('Failed to load flashcard sets');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSet = (setId: string) => {
    router.push(`/study/${setId}`);
  };

  const handleDeleteSet = async (setId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click
    if (!confirm('Are you sure you want to delete this set?')) return;

    try {
      setDeletingId(setId);
      await axios.delete(`${API_URL}/flashcards/${setId}`);
      // Remove the deleted set from the state
      setFlashcardSets(sets => sets.filter(set => set.id !== setId));
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      alert('Failed to delete the flashcard set');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">My Flashcard Sets</h1>
          <p className="text-muted-foreground">
            Select a flashcard set to study or review
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Flashcard Sets</CardTitle>
            <CardDescription>
              Select a flashcard set to study or review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
                <Button className="mt-4" onClick={fetchFlashcardSets}>
                  Try Again
                </Button>
              </div>
            ) : flashcardSets.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No flashcard sets yet. Upload a document to get started.
                </p>
                <Button className="mt-4" onClick={() => router.push('/upload')}>
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {flashcardSets.map((set) => (
                  <Card key={set.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => handleSelectSet(set.id)}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{set.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {set.count} flashcards
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Select
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => handleDeleteSet(set.id, e)}
                          disabled={deletingId === set.id}
                        >
                          {deletingId === set.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}