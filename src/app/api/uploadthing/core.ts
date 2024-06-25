import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { PineconeStore } from '@langchain/pinecone';
import { pinecone } from '@/lib/pinecone';
import { embeddingModel } from '@/lib/ai-model';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error('Unauthorized');

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
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
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
