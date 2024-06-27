'use client';

import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadDropZone } from './UploadDropZone';

interface UploadButtonProps {
  isSubscribed: boolean;
}

export const UploadButton: FC<UploadButtonProps> = ({ isSubscribed }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(open);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent aria-describedby="upload-files">
        <UploadDropZone isSubscribed={isSubscribed} />
      </DialogContent>
    </Dialog>
  );
};
