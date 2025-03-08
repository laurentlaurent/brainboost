'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">BrainBoost</h1>
          <p className="text-muted-foreground">
            Upload documents, generate flashcards, and start learning
          </p>
        </div>

        <div className="grid gap-4  md:grid-cols-2 sm:grid-cols-1">
          <Card className="cursor-pointer hover:bg-zinc-50" onClick={() => router.push('/upload')}>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <h2 className="text-xl font-semibold">Upload</h2>
              <p className="text-muted-foreground">Upload documents to generate flashcards</p>
              <Button variant="outline">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-zinc-50" onClick={() => router.push('/library')}>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <h2 className="text-xl font-semibold">My Flashcards</h2>
              <p className="text-muted-foreground">Browse and manage your flashcard sets</p>
              <Button variant="outline">View Library</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
