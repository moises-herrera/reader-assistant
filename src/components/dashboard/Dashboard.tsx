'use client';

import { trpc } from '@/app/_trpc/client';
import { UploadButton } from './UploadButton';
import { Ghost } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import { useMemo } from 'react';
import Link from 'next/link';

export const Dashboard = () => {
  const { data: files, isLoading } = trpc.getUserFiles.useQuery();

  const filesSorted = useMemo(() => {
    if (!files) return [];

    return files.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [files]);

  return (
    <main className="max-auto max-w-7xl md:p-10">
      <section className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>

        <UploadButton />
      </section>

      {/* Files list */}
      {files && files.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-50 md:grid-cols-2 lg:grid-cols-3">
          {filesSorted.map((file) => (
            <li
              key={file.id}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
            >
              <Link
                href={`/dashboard/${file.id}`}
                className="flex flex-col gap-2"
              >
                <div className="p-6 flex w-full items-center justify-between space-x-6">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                    
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : isLoading ? (
        <Skeleton height={100} className="my-2" count={3} />
      ) : (
        <section className="mt-16 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">
            There are no files uploaded yet.
          </h3>
          <p>Let&apos;s upload your first PDF.</p>
        </section>
      )}
    </main>
  );
};
