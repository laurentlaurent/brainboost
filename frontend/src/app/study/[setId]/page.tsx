'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { FlashcardViewer } from '@/components/flashcards/flashcard-viewer';
import { FlashcardEditor } from '@/components/flashcards/flashcard-editor';
import { QuizMode } from '@/components/flashcards/quiz-mode';

// Define API backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
  const setId = params.setId as string;
  
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentView, setCurrentView] = useState<'view' | 'quiz'>('view');
  const [isEditing, setIsEditing] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (setId) {
      fetchFlashcardSet(setId);
    }
  }, [setId]);

  const fetchFlashcardSet = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/flashcards/${id}`);
      setSelectedSet(response.data);
    } catch (error) {
      console.error('Error fetching flashcard set:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!selectedSet) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Flashcard set not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{selectedSet.title}</h2>
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