'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './button';

export function NavHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            BrainBoost
          </Link>
          
          <div className="flex gap-2">
            <Button
              variant={isActive('/upload') ? 'default' : 'outline'}
              asChild
            >
              <Link href="/upload">Upload</Link>
            </Button>
            <Button
              variant={isActive('/library') ? 'default' : 'outline'}
              asChild
            >
              <Link href="/library">My Flashcards</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}