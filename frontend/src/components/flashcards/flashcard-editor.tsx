'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Flashcard = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  difficulty: number;
  lastReviewed: string | null;
  nextReview: string | null;
};

type FlashcardEditorProps = {
  card: Flashcard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Flashcard) => void;
};

export function FlashcardEditor({ card, isOpen, onClose, onSave }: FlashcardEditorProps) {
  const [tags, setTags] = useState<string[]>(card.tags || []);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty.toString(),
    },
  });

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: Record<string, unknown>) => {
    const updatedCard = {
      ...card,
      question: data.question as string,
      answer: data.answer as string,
      tags,
      difficulty: parseInt(data.difficulty as string, 10),
    };
    onSave(updatedCard);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} defaultOpen={false}>
      <DialogContent className="z-50 sm:max-w-md data-[state=open]:bg-white max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>
              Make changes to your flashcard here.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                className="min-h-[44px]"
                {...register("question", { required: "Question is required" })}
              />
              {errors.question && (
                <p className="text-sm text-red-500">{errors.question.message as string}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Input
                id="answer"
                className="min-h-[44px]"
                {...register("answer", { required: "Answer is required" })}
              />
              {errors.answer && (
                <p className="text-sm text-red-500">{errors.answer.message as string}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                defaultValue={card.difficulty.toString()}
                onValueChange={(value) => setValue("difficulty", value)}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[60]">
                  <SelectItem value="1">Very Easy</SelectItem>
                  <SelectItem value="2">Easy</SelectItem>
                  <SelectItem value="3">Medium</SelectItem>
                  <SelectItem value="4">Hard</SelectItem>
                  <SelectItem value="5">Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[44px]"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addTag}
                  className="min-h-[44px]"
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1.5 text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-zinc-500 hover:text-zinc-800 p-1"
                        aria-label="Remove tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button type="submit" className="min-h-[44px]">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}