'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  difficulty: number;
  lastReviewed: string | null;
  nextReview: string | null;
};

type FlashcardViewerProps = {
  flashcards: Flashcard[];
  setId: string;  // Add setId prop
  onEditCard?: (card: Flashcard) => void;
};

const getDifficultyLabel = (difficulty: number): string => {
  const labels = {
    1: "Very Easy",
    2: "Easy",
    3: "Medium", 
    4: "Hard",
    5: "Very Hard"
  };
  return labels[difficulty as keyof typeof labels] || "Unknown";
};

export function FlashcardViewer({ flashcards, setId, onEditCard }: FlashcardViewerProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentCard = flashcards[currentCardIndex] || { tags: [] };

  if (!setId) {
    console.log('No setId prop provided');
  }

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const resetReview = () => {
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setCompleted(false);
  };

  if (!flashcards.length) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">No flashcards available</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center p-4 sm:p-6 border rounded-lg">
        <h3 className="text-xl font-semibold">Review Completed! 🎉</h3>
        <p className="text-muted-foreground text-center">
          You&apos;ve reviewed all {flashcards.length} flashcards in this set.
        </p>
        <Button className="min-h-[44px]" onClick={resetReview}>Start Over</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <p className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {flashcards.length}
        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            className="flex-1 sm:flex-none min-h-[44px]"
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
          >
            Previous
          </Button>
          <Button
            className="flex-1 sm:flex-none min-h-[44px]"
            variant="outline"
            size="sm"
            onClick={handleNext}
          >
            {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>

      <Card className="min-h-[240px] flex flex-col">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {(currentCard.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              Difficulty: {getDifficultyLabel(currentCard.difficulty)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center px-4 sm:px-6">
          <h3 className="text-base sm:text-lg font-medium mb-3">{currentCard.question}</h3>
          
          {showAnswer ? (
            <>
              <Separator className="my-3" />
              <div className="mt-2">
                <p>{currentCard.answer}</p>
              </div>
            </>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2 px-4 sm:px-6">
          <Button 
            className="flex-1 sm:flex-none min-h-[44px]"
            variant="ghost" 
            onClick={toggleAnswer}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>
          
          {onEditCard && (
            <Button 
              className="flex-1 sm:flex-none min-h-[44px]"
              variant="outline" 
              onClick={() => onEditCard(currentCard)}
            >
              Edit Card
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}