'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  return (
    <main className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">BrainBoost</h1>
          <p className="text-muted-foreground">
            Upload documents, generate flashcards, and start learning
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-zinc-50" onClick={() => router.push('/upload')}>
            <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
              <h2 className="text-xl font-semibold">Upload</h2>
              <p className="text-muted-foreground">Upload documents to generate flashcards</p>
              <Button variant="outline" className="min-h-[44px]">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-zinc-50" onClick={() => router.push('/library')}>
            <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
              <h2 className="text-xl font-semibold">My Flashcards</h2>
              <p className="text-muted-foreground">Browse and manage your flashcard sets</p>
              <Button variant="outline" className="min-h-[44px]">View Library</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
