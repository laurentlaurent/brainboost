'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { FlashcardViewer } from '@/components/flashcards/flashcard-viewer';
import { FlashcardEditor } from '@/components/flashcards/flashcard-editor';
import { QuizMode } from '@/components/flashcards/quiz-mode';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Define API backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = false;

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  difficulty: number;
  lastReviewed: string | null;
  nextReview: string | null;
};

type FlashcardSet = {
  id: string;
  title: string;
  source: string;
  flashcards: Flashcard[];
};

type QuizResult = {
  cardId: string;
  correct: boolean;
  timeSpent: number;
};

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();  
  const setId = params.setId as string;
  
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentView, setCurrentView] = useState<'view' | 'quiz'>('view');
  const [isEditing, setIsEditing] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (setId) {
      const fetchFlashcardSet = async (id: string) => {
        try {
          setIsLoading(true);
          setError(null);
          
          // Try to get the data from navigation state first
          const cachedData = window.history.state?.flashcardSet;
          if (cachedData && cachedData.id === id) {
            setSelectedSet(cachedData);
            setIsLoading(false);
            return;
          }

          // If no cached data, fetch from API
          const response = await axios.get(`${API_URL}/flashcards/${id}`);
          setSelectedSet(response.data);
        } catch (error) {
          console.error('Error fetching flashcard set:', error);
          
          if (axios.isAxiosError(error)) {
            setError(error.response?.data?.error || 'Failed to fetch flashcard set');
            
            // If we get a 404, the set doesn't exist - redirect to library after a short delay
            if (error.response?.status === 404) {
              setTimeout(() => {
                router.push('/library');
              }, 3000);
            }
          } else {
            setError('Failed to fetch flashcard set');
          }
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchFlashcardSet(setId);
    }
  }, [setId, router]);

  const handleEditCard = (card: Flashcard) => {
    setCardToEdit(card);
    setIsEditing(true);
  };

  const handleSaveCard = async (updatedCard: Flashcard) => {
    if (!selectedSet) return;

    try {
      const response = await axios.put(
        `${API_URL}/flashcards/${setId}/cards/${updatedCard.id}`,
        updatedCard
      );

      if (response.data.success) {
        // Update the local state
        setSelectedSet({
          ...selectedSet,
          flashcards: selectedSet.flashcards.map(card => 
            card.id === updatedCard.id ? updatedCard : card
          )
        });
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
    }
  };

  const handleQuizComplete = (results: QuizResult[]) => {
    console.log('Quiz completed with results:', results);
    setCurrentView('view');
  };

  const exportFlashcards = () => {
    if (!selectedSet) return;
    
    const dataStr = JSON.stringify(selectedSet, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `${selectedSet.title}-flashcards.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <Card className="flex justify-center items-center h-40">
          <CardContent>
            <p>Loading flashcards...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            {error.includes('not found') && (
              <p className="mt-4">Redirecting to library in a few seconds...</p>
            )}
            <Button 
              className="mt-4 min-h-[44px]" 
              onClick={() => router.push('/library')}
            >
              Return to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Set not found state
  if (!selectedSet) {
    return (
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Flashcard set not found</p>
          <Button 
            className="mt-4 min-h-[44px]" 
            onClick={() => router.push('/library')}
          >
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  // Main study view
  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">{selectedSet.title}</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              className="flex-1 sm:flex-none min-h-[44px]"
              variant={currentView === 'view' ? 'default' : 'outline'} 
              onClick={() => setCurrentView('view')}
            >
              Review Mode
            </Button>
            <Button 
              className="flex-1 sm:flex-none min-h-[44px]"
              variant={currentView === 'quiz' ? 'default' : 'outline'}
              onClick={() => setCurrentView('quiz')}
            >
              Quiz Mode
            </Button>
            <Button 
              className="flex-1 sm:flex-none min-h-[44px]"
              variant="outline" 
              onClick={exportFlashcards}
            >
              Export
            </Button>
          </div>
        </div>

        {currentView === 'view' ? (
          <FlashcardViewer 
            flashcards={selectedSet.flashcards}
            setId={selectedSet.id}
            onEditCard={handleEditCard}
          />
        ) : (
          <QuizMode 
            flashcards={selectedSet.flashcards} 
            onComplete={handleQuizComplete}
          />
        )}
      </div>

      {cardToEdit && (
        <FlashcardEditor
          card={cardToEdit}
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setCardToEdit(null);
          }}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
}