'use client';

import { FC, useState } from 'react';
import DropZone from 'react-dropzone';
import { Cloud, File as FileIcon, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadThing } from '@/lib/uploadthing';
import { useToast } from '../ui/use-toast';
import { trpc } from '@/app/_trpc/client';
import { useRouter } from 'next/navigation';

interface UploadDropZoneProps {
  isSubscribed: boolean;
}

export const UploadDropZone: FC<UploadDropZoneProps> = ({ isSubscribed }) => {
  const router = useRouter();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const { startUpload } = useUploadThing(
    isSubscribed ? 'proPlanUploader' : 'freePlanUploader'
  );

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`);
    },
    retry: true,
    retryDelay: 500,
  });

  const startSimulateProgress = (): NodeJS.Timeout => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((previousProgress) => {
        if (previousProgress >= 95) {
          clearInterval(interval);
          return previousProgress;
        }
        return previousProgress + 5;
      });
    }, 500);

    return interval;
  };

  const onDropFile = async (acceptedFile: any) => {
    setIsUploading(true);
    const progressInterval = startSimulateProgress();

    const response = await startUpload(acceptedFile);

    if (!response) {
      return toast({
        title: 'Something went wrong',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }

    const [fileResponse] = response;

    const key = fileResponse?.key;

    if (!key) {
      return toast({
        title: 'Something went wrong',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }

    clearInterval(progressInterval);
    setUploadProgress(100);

    startPolling({ key });
  };

  return (
    <DropZone multiple={false} onDrop={onDropFile}>
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">
                  PDF (up to {isSubscribed ? '16' : '4'}MB)
                </p>
              </div>

              {acceptedFiles.length && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <FileIcon className="h-4 w-4 text-blue-500" />
                  </div>

                  <p className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </p>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? 'bg-green-500' : ''
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </DropZone>
  );
};
