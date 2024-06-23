'use client';

import { FC, useState } from 'react';
import { Document, Page } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import 'pdfjs-dist/webpack';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';
import SimpleBar from 'simplebar-react';
import { PdfToolbar } from './PdfToolbar';
import { cn } from '@/lib';

interface PdfRendererProps {
  url: string;
}

export const PdfRenderer: FC<PdfRendererProps> = ({ url }) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();
  const [pagesNumber, setPagesNumber] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

  const displayError = () => {
    toast({
      title: 'Error loading PDF',
      description: 'Please try again later.',
      variant: 'destructive',
    });
  };

  return (
    <section className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <PdfToolbar
        fileUrl={url}
        pagesNumber={pagesNumber!}
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        setScale={setScale}
        scale={scale}
        setRotation={setRotation}
      />

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              {renderedScale && isLoading ? (
                <Page
                  width={width || 1}
                  pageNumber={currentPage}
                  scale={scale}
                  rotate={rotation}
                  key={`@${renderedScale}`}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                width={width || 1}
                pageNumber={currentPage}
                scale={scale}
                rotate={rotation}
                key={`@${scale}`}
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </section>
  );
};
