'use client';

import { FileUploadForm } from '@/components/file-upload/upload-form';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Upload Study Material</h1>
          <p className="text-muted-foreground">
            Upload documents to automatically generate flashcards
          </p>
        </div>
        <FileUploadForm />
      </div>
    </div>
  );
}