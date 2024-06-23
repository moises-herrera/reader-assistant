'use client';

import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Expand } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { Document, Page } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';

interface PdfFullScreenProps {
  url: string;
}

export const PdfFullScreen: FC<PdfFullScreenProps> = ({ url }) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pagesNumber, setPagesNumber] = useState<number>();

  const displayError = () => {
    toast({
      title: 'Error loading PDF',
      description: 'Please try again later.',
      variant: 'destructive',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button variant="ghost" className="gap-1.5">
          <Expand aria-label="fullscreen" className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={displayError}
              onLoadSuccess={({ numPages }) => setPagesNumber(numPages)}
              file={url}
              className="max-h-full"
            >
              {new Array(pagesNumber).fill(0).map((_, index) => (
                <Page key={index} width={width || 1} pageNumber={index + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};
