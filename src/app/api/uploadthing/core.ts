import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { PineconeStore } from '@langchain/pinecone';
import { pinecone } from '@/lib/pinecone';
import { embeddingModel } from '@/lib/ai-model';
import { getUserSubscriptionPlan } from '@/helpers/get-user-subscription-plan';
import { PLANS } from '@/config/stripe';

const f = createUploadthing();

const middleware = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) throw new Error('Unauthorized');

  const subscriptionPlan = await getUserSubscriptionPlan(user);

  return { userId: user.id, subscriptionPlan };
};

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
  };
}) => {
  const isFileExist = await db.file.findFirst({
    where: {
      key: file.key,
    },
  });

  if (isFileExist) return;

  const createdFile = await db.file.create({
    data: {
      key: file.key,
      name: file.name,
      userId: metadata.userId,
      url: file.url,
      uploadStatus: 'PROCESSING',
    },
  });

  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const loader = new PDFLoader(blob);

    const pageLevelDocs = await loader.load();
    const pagesAmt = pageLevelDocs.length;

    const { subscriptionPlan } = metadata;
    const { isSubscribed } = subscriptionPlan;

    const isProExceeded =
      pagesAmt > PLANS.find(({ slug }) => slug === 'pro')!.pagesPerPdf;
    const isFreeExceeded =
      pagesAmt > PLANS.find(({ slug }) => slug === 'free')!.pagesPerPdf;

    if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
      await db.file.update({
        data: {
          uploadStatus: 'FAILED',
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    // Vectorize document
    const pineconeIndex = pinecone.Index('reader');
    await PineconeStore.fromDocuments(pageLevelDocs, embeddingModel, {
      pineconeIndex,
      namespace: createdFile.id,
    });

    await db.file.update({
      where: { id: createdFile.id },
      data: { uploadStatus: 'SUCCESS' },
    });
  } catch (error) {
    console.log(error);
    await db.file.update({
      where: { id: createdFile.id },
      data: { uploadStatus: 'FAILED' },
    });
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
