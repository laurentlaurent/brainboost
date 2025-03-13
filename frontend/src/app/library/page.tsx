'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlashcardViewer } from '@/components/flashcards/flashcard-viewer';
import { FlashcardEditor } from '@/components/flashcards/flashcard-editor';
import { QuizMode } from '@/components/flashcards/quiz-mode';

// Define API backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type FlashcardSetSummary = {
  id: string;
  title: string;
  count: number;
};

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

axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = false;

export default function LibraryPage() {
  const router = useRouter();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // New state for SPA functionality
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentView, setCurrentView] = useState<'library' | 'view' | 'quiz'>('library');
  const [isEditing, setIsEditing] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  const handleSelectSet = async (setId: string) => {
    try {
      setIsLoading(true);
      setFetchError(null);
      // Fetch the flashcard set data
      const response = await axios.get(`${API_URL}/flashcards/${setId}`);
      if (response.data) {
        setSelectedSet(response.data);
        setCurrentView('view');
      }
    } catch (error) {
      console.error('Error fetching flashcard set:', error);
      if (axios.isAxiosError(error)) {
        setFetchError(error.response?.data?.error || 'Failed to load flashcard set');
      } else {
        setFetchError('Failed to load flashcard set');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSet = async (setId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click
    if (!confirm('Are you sure you want to delete this set?')) return;

    try {
      setDeletingId(setId);
      await axios.delete(`${API_URL}/flashcards/${setId}`);
      // Remove the deleted set from the state
      setFlashcardSets(sets => sets.filter(set => set.id !== setId));
      
      // If the deleted set is the one being viewed, go back to library
      if (selectedSet && selectedSet.id === setId) {
        setSelectedSet(null);
        setCurrentView('library');
      }
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      alert('Failed to delete the flashcard set');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditCard = (card: Flashcard) => {
    setCardToEdit(card);
    setIsEditing(true);
  };

  const handleSaveCard = async (updatedCard: Flashcard) => {
    if (!selectedSet) return;

    try {
      const response = await axios.put(
        `${API_URL}/flashcards/${selectedSet.id}/cards/${updatedCard.id}`,
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

  const backToLibrary = () => {
    setSelectedSet(null);
    setCurrentView('library');
    fetchFlashcardSets(); // Reload the sets to get any updated counts
  };

  // Library view
  if (currentView === 'library') {
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

  // Loading or error states for selected set
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="flex justify-center items-center h-40">
          <CardContent>
            <p>Loading flashcards...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
          </CardHeader>
          <CardContent>
            <p>{fetchError}</p>
            <Button 
              className="mt-4" 
              onClick={backToLibrary}
            >
              Return to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedSet) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Flashcard set not found</p>
          <Button 
            className="mt-4" 
            onClick={backToLibrary}
          >
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  // Study view (Review or Quiz)
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={backToLibrary}
            >
              ← Back to Library
            </Button>
            <h2 className="text-2xl font-bold">{selectedSet.title}</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={currentView === 'view' ? 'default' : 'outline'} 
              onClick={() => setCurrentView('view')}
            >
              Review Mode
            </Button>
            <Button 
              variant={currentView === 'quiz' ? 'default' : 'outline'}
              onClick={() => setCurrentView('quiz')}
            >
              Quiz Mode
            </Button>
            <Button variant="outline" onClick={exportFlashcards}>
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