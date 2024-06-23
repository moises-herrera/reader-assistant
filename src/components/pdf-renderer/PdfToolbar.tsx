'use client';

import { FC, KeyboardEventHandler } from 'react';
import { cn } from '@/lib';
import { ChevronDown, ChevronUp, Search, RotateCw } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { PdfFullScreen } from './PdfFullScreen';

interface PdfToolbarProps {
  fileUrl: string;
  pagesNumber: number;
  setCurrentPage: (page: number | ((page: number) => number)) => void;
  currentPage: number;
  setScale: (scale: number | ((scale: number) => number)) => void;
  scale: number;
  setRotation: (rotation: number | ((rotation: number) => number)) => void;
}

export const PdfToolbar: FC<PdfToolbarProps> = ({
  fileUrl,
  pagesNumber,
  setCurrentPage,
  currentPage,
  setScale,
  scale,
  setRotation,
}) => {
  const PageValidatorSchema = z.object({
    page: z
      .string()
      .refine((number) => Number(number) > 0 && Number(number) <= pagesNumber, {
        message: 'Invalid page number',
      }),
  });

  type PageValidatorSchemaType = z.infer<typeof PageValidatorSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PageValidatorSchemaType>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(PageValidatorSchema),
  });

  const handlePageSubmit = ({ page }: PageValidatorSchemaType) => {
    setCurrentPage(Number(page));
    setValue('page', page);
  };

  const onChangePageNumber: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === 'Enter') {
      handleSubmit(handlePageSubmit)();
    }
  };

  return (
    <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
      <div className="flex items-center gap-1.5">
        <Button
          disabled={currentPage === 1}
          variant="ghost"
          aria-label="previous page"
          onClick={() => {
            setCurrentPage((page) => (page - 1 > 1 ? page - 1 : 1));
            setValue('page', String(currentPage - 1));
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1.5">
          <Input
            {...register('page')}
            className={cn(
              'w-12 h-8',
              errors.page && 'focus-visible:ring-red-500'
            )}
            onKeyDown={onChangePageNumber}
            autoComplete="off"
          />
          <p className="text-zinc-700 text-sm space-x-1">
            <span>/</span>
            <span>{pagesNumber ?? 'x'}</span>
          </p>
        </div>

        <Button
          disabled={pagesNumber === undefined || currentPage === pagesNumber}
          variant="ghost"
          aria-label="next page"
          onClick={() => {
            setCurrentPage((page) =>
              page + 1 < pagesNumber ? page + 1 : pagesNumber
            );
            setValue('page', String(currentPage + 1));
          }}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-1.5" variant="ghost" aria-label="zoom">
              <Search className="h-4 w-4" />
              {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setScale(1)}>
              100%
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setScale(1.5)}>
              150%
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setScale(2)}>
              200%
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setScale(2.5)}>
              250%
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={() => setRotation((prev) => prev + 90)}
          variant="ghost"
          aria-label="rotate 90 degrees"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <PdfFullScreen url={fileUrl} />
      </div>
    </div>
  );
};
